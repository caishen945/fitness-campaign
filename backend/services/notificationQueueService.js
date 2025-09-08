const { Queue, QueueScheduler } = require('bullmq');
const IORedis = require('ioredis');
const logger = require('../utils/logger');
const { isRedisEnabled } = require('../config/featureFlags');

const queueName = process.env.NOTIFICATION_QUEUE_NAME || 'notificationQueue';

// 单例连接与队列
let redisConnection;
let queue;
let scheduler;

function getRedisConnection() {
    if (!isRedisEnabled()) {
        return null;
    }
    if (!redisConnection) {
        const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
        logger.info(`🔌 初始化通知队列Redis连接: ${redisUrl}`);
        redisConnection = new IORedis(redisUrl, {
            maxRetriesPerRequest: null,
            enableReadyCheck: true
        });
        redisConnection.on('error', (err) => logger.error('❌ BullMQ Redis 连接错误', { error: err.message }));
        redisConnection.on('connect', () => logger.info('✅ BullMQ Redis 已连接'));
        redisConnection.on('end', () => logger.info('🔌 BullMQ Redis 连接已关闭'));
    }
    return redisConnection;
}

function getQueue() {
    if (!isRedisEnabled()) {
        return {
            add: async () => ({ id: 'noop', name: 'noop' }),
            close: async () => {}
        };
    }
    if (!queue) {
        const connection = getRedisConnection();
        queue = new Queue(queueName, {
            connection,
            defaultJobOptions: {
                attempts: 5,
                backoff: { type: 'exponential', delay: 1000 },
                removeOnComplete: 1000,
                removeOnFail: 2000
            }
        });
        scheduler = new QueueScheduler(queueName, { connection });
        scheduler.waitUntilReady().then(() => logger.info('⏱️ 通知队列调度器已就绪')).catch((e) => logger.error('❌ 通知队列调度器启动失败', { error: e.message }));
    }
    return queue;
}

async function addNotificationJob(jobName, data, opts = {}) {
    const q = getQueue();
    if (!isRedisEnabled()) {
        logger.info('📨 通知任务已跳过入队（Redis disabled）', { name: jobName });
        return { id: 'noop', name: jobName, data };
    }
    const job = await q.add(jobName, data, opts);
    logger.info('📨 通知任务已入队', { id: job.id, name: jobName });
    return job;
}

async function close() {
    try {
        if (scheduler) await scheduler.close();
        if (queue) await queue.close();
        if (redisConnection) await redisConnection.quit();
    } catch (e) {
        logger.error('❌ 关闭通知队列失败', { error: e.message });
    }
}

module.exports = {
    getQueue,
    addNotificationJob,
    close,
    queueName
};


