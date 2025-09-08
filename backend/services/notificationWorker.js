const { Worker, QueueEvents } = require('bullmq');
const IORedis = require('ioredis');
const logger = require('../utils/logger');
const { pool } = require('../config/database');
const { queueName } = require('./notificationQueueService');
const { isRedisEnabled } = require('../config/featureFlags');

function createRedis() {
    if (!isRedisEnabled()) {
        return null;
    }
    const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    return new IORedis(redisUrl, { maxRetriesPerRequest: null, enableReadyCheck: true });
}

function isWithinQuietHours(now, start, end) {
    if (!start || !end) return false;
    // 简化：仅按本地时间比较，不处理跨天复杂场景
    const [sh, sm, ss] = String(start).split(':').map(Number);
    const [eh, em, es] = String(end).split(':').map(Number);
    const startMinutes = sh * 60 + (sm || 0);
    const endMinutes = eh * 60 + (em || 0);
    const curMinutes = now.getHours() * 60 + now.getMinutes();
    if (endMinutes >= startMinutes) {
        return curMinutes >= startMinutes && curMinutes < endMinutes;
    } else {
        // 跨午夜
        return curMinutes >= startMinutes || curMinutes < endMinutes;
    }
}

async function getUserNotificationSettings(userId) {
    try {
        const [rows] = await pool.query('SELECT mute_all, channel_preferences, quiet_hours_start, quiet_hours_end FROM user_notification_settings WHERE user_id = ? LIMIT 1', [userId]);
        return rows && rows[0] ? rows[0] : null;
    } catch (e) {
        return null;
    }
}

async function handleSendNotification(job) {
    const { notificationId, userId, title, message, channels = ['web'], metadata = {} } = job.data || {};

    // 1) 持久化到 notifications（若未提供 notificationId）
    let effectiveNotificationId = notificationId;
    if (!effectiveNotificationId) {
        const result = await pool.query(
            'INSERT INTO notifications (user_id, title, message, is_read, created_at) VALUES (?, ?, ?, 0, NOW())',
            [userId, title, message]
        );
        effectiveNotificationId = result.insertId;
    }

    // 2) 用户偏好与静音/安静时段检查
    const settings = await getUserNotificationSettings(userId);
    if (settings && settings.mute_all) {
        try {
            await pool.query('INSERT INTO notification_deliveries (notification_id, channel, status, attempt_count, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())', [effectiveNotificationId, 'web', 'skipped', 0]);
        } catch {}
        return { notificationId: effectiveNotificationId, userId, skipped: 'muted' };
    }
    const now = new Date();
    const inQuiet = settings && isWithinQuietHours(now, settings.quiet_hours_start, settings.quiet_hours_end);
    if (inQuiet) {
        try {
            await pool.query('INSERT INTO notification_deliveries (notification_id, channel, status, attempt_count, next_attempt_at, created_at, updated_at) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 60 MINUTE), NOW(), NOW())', [effectiveNotificationId, 'web', 'deferred', 0]);
        } catch {}
        // 重新入队，延迟1小时
        throw new Error('Deferred due to quiet hours');
    }

    // 3) 若包含模板元数据，则按用户语言解析模板并渲染
    let finalTitle = title;
    let finalMessage = message;
    if (metadata && metadata.template_key) {
        try {
            const [langRows] = await pool.query('SELECT language FROM user_settings WHERE user_id = ? LIMIT 1', [userId]);
            const userLang = langRows && langRows[0] && langRows[0].language ? langRows[0].language : 'zh-CN';
            const templateService = require('./templateService');
            // 针对每个渠道分开解析，提高命中率
            // 这里先获取第一个渠道的模板用于标题/内容基底
            const firstChannel = Array.isArray(channels) && channels.length ? channels[0] : 'web';
            const tpl = await templateService.resolveTemplate({ templateKey: metadata.template_key, language: userLang, channel: firstChannel });
            if (tpl) {
                const rendered = templateService.renderMessage({ subject: tpl.subject, body: tpl.body, variables: metadata.variables || {} });
                finalTitle = rendered.subject || finalTitle;
                finalMessage = rendered.body || finalMessage;
            }
        } catch (e) {
            logger.warn('模板渲染失败，退回原始标题与内容', { error: e.message });
        }
    }

    // 4) 渠道投递
    const channelsToSend = Array.isArray(channels) && channels.length ? channels : ['web'];
    for (const ch of channelsToSend) {
        if (ch === 'web') {
            try {
                const app = require('../server');
                const wsServer = app && app.get && app.get('websocketServer');
                if (wsServer && wsServer.sendNotification) {
                    wsServer.sendNotification(userId, { id: effectiveNotificationId, title: finalTitle, message: finalMessage, metadata });
                }
                await pool.query('INSERT INTO notification_deliveries (notification_id, channel, status, attempt_count, sent_at, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW(), NOW())', [effectiveNotificationId, 'web', 'sent', 1]);
            } catch (e) {
                logger.warn('⚠️ Web 通道投递失败', { error: e.message });
                try { await pool.query('INSERT INTO notification_deliveries (notification_id, channel, status, attempt_count, last_error, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())', [effectiveNotificationId, 'web', 'failed', 1, e.message]); } catch {}
            }
        } else if (ch === 'telegram') {
            try {
                const telegramService = require('./telegramService');
                const [rows] = await pool.query('SELECT telegram_id FROM users WHERE id = ? LIMIT 1', [userId]);
                const chatId = rows && rows[0] && rows[0].telegram_id;
                if (chatId) {
                    const result = await telegramService.sendMessage(chatId, `${finalTitle}\n\n${finalMessage}`);
                    if (!result.success) throw new Error(result.error || 'telegram send failed');
                    await pool.query('INSERT INTO notification_deliveries (notification_id, channel, status, attempt_count, sent_at, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW(), NOW())', [effectiveNotificationId, 'telegram', 'sent', 1]);
                } else {
                    await pool.query('INSERT INTO notification_deliveries (notification_id, channel, status, attempt_count, last_error, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())', [effectiveNotificationId, 'telegram', 'skipped', 0, 'no chat id']);
                }
            } catch (e) {
                logger.warn('⚠️ Telegram 通道投递失败', { error: e.message });
                try { await pool.query('INSERT INTO notification_deliveries (notification_id, channel, status, attempt_count, last_error, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())', [effectiveNotificationId, 'telegram', 'failed', 1, e.message]); } catch {}
            }
        } else if (ch === 'email') {
            try {
                const emailService = require('./emailService');
                // 查找用户邮箱
                const [rows] = await pool.query('SELECT email FROM users WHERE id = ? LIMIT 1', [userId]);
                const to = rows && rows[0] && rows[0].email;
                if (to) {
                    await emailService.sendMail({ to, subject: finalTitle, text: finalMessage });
                    await pool.query('INSERT INTO notification_deliveries (notification_id, channel, status, attempt_count, sent_at, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW(), NOW())', [effectiveNotificationId, 'email', 'sent', 1]);
                } else {
                    await pool.query('INSERT INTO notification_deliveries (notification_id, channel, status, attempt_count, last_error, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())', [effectiveNotificationId, 'email', 'skipped', 0, 'no email']);
                }
            } catch (e) {
                logger.warn('⚠️ Email 通道投递失败', { error: e.message });
                try { await pool.query('INSERT INTO notification_deliveries (notification_id, channel, status, attempt_count, last_error, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())', [effectiveNotificationId, 'email', 'failed', 1, e.message]); } catch {}
            }
        } else if (ch === 'push') {
            try {
                const pushService = require('./pushService');
                if (!pushService.isEnabled()) {
                    await pool.query('INSERT INTO notification_deliveries (notification_id, channel, status, attempt_count, last_error, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())', [effectiveNotificationId, 'push', 'skipped', 0, 'push disabled']);
                } else {
                    await pushService.send({ to: userId, title: finalTitle || '', body: finalMessage || '', data: metadata || {} });
                    await pool.query('INSERT INTO notification_deliveries (notification_id, channel, status, attempt_count, sent_at, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW(), NOW())', [effectiveNotificationId, 'push', 'sent', 1]);
                }
            } catch (e) {
                logger.warn('⚠️ Push 通道投递失败', { error: e.message });
                try { await pool.query('INSERT INTO notification_deliveries (notification_id, channel, status, attempt_count, last_error, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())', [effectiveNotificationId, 'push', 'failed', 1, e.message]); } catch {}
            }
        }
    }

    return { notificationId: effectiveNotificationId, userId };
}

function start() {
    if (!isRedisEnabled()) {
        logger.info('📬 通知Worker未启动（Redis disabled）');
        return { worker: null, queueEvents: null, connection: null };
    }
    const connection = createRedis();
    const worker = new Worker(
        queueName,
        async (job) => {
            switch (job.name) {
                case 'send-notification':
                    return await handleSendNotification(job);
                default:
                    throw new Error(`Unknown job name: ${job.name}`);
            }
        },
        { connection, concurrency: Number(process.env.NOTIFICATION_WORKER_CONCURRENCY || 5) }
    );

    const queueEvents = new QueueEvents(queueName, { connection });

    worker.on('failed', (job, err) => {
        logger.error('❌ 通知任务失败', { id: job?.id, name: job?.name, error: err?.message });
    });
    worker.on('completed', (job) => {
        logger.info('✅ 通知任务完成', { id: job?.id, name: job?.name });
    });
    queueEvents.on('waiting', ({ jobId }) => logger.debug('⏳ 通知任务等待中', { jobId }));
    queueEvents.on('active', ({ jobId }) => logger.debug('🚚 通知任务处理中', { jobId }));

    logger.info('🚀 通知Worker已启动');
    return { worker, queueEvents, connection };
}

module.exports = { start };


