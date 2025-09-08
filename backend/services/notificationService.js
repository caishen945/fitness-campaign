const IORedis = require('ioredis');
const logger = require('../utils/logger');
const { addNotificationJob } = require('./notificationQueueService');
const { isRedisEnabled } = require('../config/featureFlags');

let redis;
function getRedis() {
    if (!isRedisEnabled()) {
        return null;
    }
    if (!redis) {
        const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
        redis = new IORedis(url, { maxRetriesPerRequest: null, enableReadyCheck: true });
        redis.on('error', (e) => logger.warn('Redis限流连接错误（不阻断主流程）', { error: e.message }));
    }
    return redis;
}

async function checkRateLimit(key, limit, windowSeconds) {
    try {
        if (!isRedisEnabled()) {
            return true; // 关闭时默认放行
        }
        const client = getRedis();
        const nowWindowKey = `notif:rate:${key}:${Math.floor(Date.now() / 1000 / windowSeconds)}`;
        const count = await client.incr(nowWindowKey);
        if (count === 1) {
            await client.expire(nowWindowKey, windowSeconds);
        }
        return count <= limit;
    } catch (e) {
        logger.warn('通知限流检查失败，放行', { error: e.message });
        return true;
    }
}

/**
 * 统一发送/入队用户通知
 * options: { channels: ['web'|'email'|'telegram'|'push'|'sms'], metadata, rateLimit: { limitPerMinute } }
 */
async function sendToUser(userId, title, message, options = {}) {
    const channels = Array.isArray(options.channels) && options.channels.length > 0 ? options.channels : ['web'];
    const metadata = options.metadata || {};
    const limitPerMinute = options.rateLimit?.limitPerMinute ?? Number(process.env.NOTIF_RATE_LIMIT_PER_MINUTE || 60);

    const canSend = await checkRateLimit(`user:${userId}`, limitPerMinute, 60);
    if (!canSend) {
        logger.warn('通知触发频率过高，已限流', { userId, limitPerMinute });
        return { queued: false, reason: 'rate_limited' };
    }

    const job = await addNotificationJob('send-notification', {
        userId,
        title,
        message,
        channels,
        metadata
    });

    return { queued: true, jobId: job.id };
}

module.exports = {
    sendToUser
};


