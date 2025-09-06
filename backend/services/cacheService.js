/**
 * Redis缓存服务
 * 提供VIP挑战系统的数据缓存功能，提升系统性能
 */

const redis = require('redis');
const logger = require('../utils/logger');

class CacheService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.defaultTTL = 300; // 默认5分钟
        
        // 缓存策略配置
        this.cacheStrategies = {
            // 用户统计数据缓存
            userStats: { ttl: 300, prefix: 'user:stats:' }, // 5分钟
            // 挑战进度缓存
            challengeProgress: { ttl: 60, prefix: 'challenge:progress:' }, // 1分钟
            // 通知模板缓存
            notificationTemplates: { ttl: 3600, prefix: 'notification:templates:' }, // 1小时
            // 用户会话缓存
            userSessions: { ttl: 1800, prefix: 'user:sessions:' }, // 30分钟
            // 配置数据缓存
            configData: { ttl: 7200, prefix: 'config:' }, // 2小时
            // 热点数据缓存
            hotData: { ttl: 120, prefix: 'hot:' } // 2分钟
        };
        
        this.initialize();
    }
    
    async initialize() {
        try {
            logger.info('🔧 初始化Redis缓存服务...');
            
            // 创建Redis客户端
            this.client = redis.createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379',
                retry_strategy: (options) => {
                    if (options.error && options.error.code === 'ECONNREFUSED') {
                        logger.error('❌ Redis服务器拒绝连接');
                        return new Error('Redis服务器拒绝连接');
                    }
                    if (options.total_retry_time > 1000 * 60 * 60) {
                        logger.error('❌ Redis重连超时');
                        return new Error('Redis重连超时');
                    }
                    if (options.attempt > 10) {
                        logger.error('❌ Redis重连次数过多');
                        return new Error('Redis重连次数过多');
                    }
                    return Math.min(options.attempt * 100, 3000);
                }
            });
            
            // 错误处理
            this.client.on('error', (error) => {
                logger.error('❌ Redis客户端错误:', error);
                this.isConnected = false;
            });
            
            // 连接成功
            this.client.on('connect', () => {
                logger.info('✅ Redis连接成功');
                this.isConnected = true;
            });
            
            // 连接就绪
            this.client.on('ready', () => {
                logger.info('✅ Redis客户端就绪');
                this.isConnected = true;
            });
            
            // 连接断开
            this.client.on('end', () => {
                logger.info('🔌 Redis连接断开');
                this.isConnected = false;
            });
            
            // 连接Redis
            await this.client.connect();
            
            // 测试连接
            await this.client.ping();
            logger.info('✅ Redis连接测试成功');
            
        } catch (error) {
            logger.error('❌ Redis缓存服务初始化失败:', error.message);
            this.isConnected = false;
        }
    }
    
    // 获取缓存值
    async get(key, strategy = 'default') {
        try {
            if (!this.isConnected || !this.client) {
                logger.warn('⚠️ Redis未连接，跳过缓存获取');
                return null;
            }
            
            const cacheKey = this.buildCacheKey(key, strategy);
            const value = await this.client.get(cacheKey);
            
            if (value) {
                logger.debug(`✅ 缓存命中: ${cacheKey}`);
                return JSON.parse(value);
            } else {
                logger.debug(`❌ 缓存未命中: ${cacheKey}`);
                return null;
            }
            
        } catch (error) {
            logger.error(`❌ 获取缓存失败 [${key}]:`, error.message);
            return null;
        }
    }
    
    // 设置缓存值
    async set(key, value, strategy = 'default', customTTL = null) {
        try {
            if (!this.isConnected || !this.client) {
                logger.warn('⚠️ Redis未连接，跳过缓存设置');
                return false;
            }
            
            const cacheKey = this.buildCacheKey(key, strategy);
            const ttl = customTTL || this.getTTL(strategy);
            
            await this.client.setEx(cacheKey, ttl, JSON.stringify(value));
            
            logger.debug(`✅ 缓存设置成功: ${cacheKey}, TTL: ${ttl}s`);
            return true;
            
        } catch (error) {
            logger.error(`❌ 设置缓存失败 [${key}]:`, error.message);
            return false;
        }
    }
    
    // 删除缓存
    async del(key, strategy = 'default') {
        try {
            if (!this.isConnected || !this.client) {
                logger.warn('⚠️ Redis未连接，跳过缓存删除');
                return false;
            }
            
            const cacheKey = this.buildCacheKey(key, strategy);
            const result = await this.client.del(cacheKey);
            
            if (result > 0) {
                logger.debug(`✅ 缓存删除成功: ${cacheKey}`);
                return true;
            } else {
                logger.debug(`⚠️ 缓存不存在: ${cacheKey}`);
                return false;
            }
            
        } catch (error) {
            logger.error(`❌ 删除缓存失败 [${key}]:`, error.message);
            return false;
        }
    }
    
    // 检查缓存是否存在
    async exists(key, strategy = 'default') {
        try {
            if (!this.isConnected || !this.client) {
                return false;
            }
            
            const cacheKey = this.buildCacheKey(key, strategy);
            const result = await this.client.exists(cacheKey);
            
            return result === 1;
            
        } catch (error) {
            logger.error(`❌ 检查缓存存在失败 [${key}]:`, error.message);
            return false;
        }
    }
    
    // 设置缓存过期时间
    async expire(key, ttl, strategy = 'default') {
        try {
            if (!this.isConnected || !this.client) {
                return false;
            }
            
            const cacheKey = this.buildCacheKey(key, strategy);
            const result = await this.client.expire(cacheKey, ttl);
            
            return result === 1;
            
        } catch (error) {
            logger.error(`❌ 设置缓存过期时间失败 [${key}]:`, error.message);
            return false;
        }
    }
    
    // 获取缓存剩余时间
    async ttl(key, strategy = 'default') {
        try {
            if (!this.isConnected || !this.client) {
                return -1;
            }
            
            const cacheKey = this.buildCacheKey(key, strategy);
            const result = await this.client.ttl(cacheKey);
            
            return result;
            
        } catch (error) {
            logger.error(`❌ 获取缓存剩余时间失败 [${key}]:`, error.message);
            return -1;
        }
    }
    
    // 批量获取缓存
    async mget(keys, strategy = 'default') {
        try {
            if (!this.isConnected || !this.client) {
                return keys.map(() => null);
            }
            
            const cacheKeys = keys.map(key => this.buildCacheKey(key, strategy));
            const values = await this.client.mGet(cacheKeys);
            
            return values.map(value => value ? JSON.parse(value) : null);
            
        } catch (error) {
            logger.error('❌ 批量获取缓存失败:', error.message);
            return keys.map(() => null);
        }
    }
    
    // 批量设置缓存
    async mset(keyValuePairs, strategy = 'default', customTTL = null) {
        try {
            if (!this.isConnected || !this.client) {
                return false;
            }
            
            const ttl = customTTL || this.getTTL(strategy);
            const pipeline = this.client.multi();
            
            keyValuePairs.forEach(([key, value]) => {
                const cacheKey = this.buildCacheKey(key, strategy);
                pipeline.setEx(cacheKey, ttl, JSON.stringify(value));
            });
            
            await pipeline.exec();
            logger.debug(`✅ 批量设置缓存成功: ${keyValuePairs.length} 个`);
            
            return true;
            
        } catch (error) {
            logger.error('❌ 批量设置缓存失败:', error.message);
            return false;
        }
    }
    
    // 清除策略缓存
    async clearStrategy(strategy) {
        try {
            if (!this.isConnected || !this.client) {
                return false;
            }
            
            const pattern = this.buildCacheKey('*', strategy);
            const keys = await this.client.keys(pattern);
            
            if (keys.length > 0) {
                await this.client.del(keys);
                logger.info(`✅ 清除策略缓存成功: ${strategy}, 删除 ${keys.length} 个键`);
            }
            
            return true;
            
        } catch (error) {
            logger.error(`❌ 清除策略缓存失败 [${strategy}]:`, error.message);
            return false;
        }
    }
    
    // 清除所有缓存
    async clearAll() {
        try {
            if (!this.isConnected || !this.client) {
                return false;
            }
            
            await this.client.flushDb();
            logger.info('✅ 清除所有缓存成功');
            
            return true;
            
        } catch (error) {
            logger.error('❌ 清除所有缓存失败:', error.message);
            return false;
        }
    }
    
    // 获取缓存统计信息
    async getStats() {
        try {
            if (!this.isConnected || !this.client) {
                return null;
            }
            
            const info = await this.client.info();
            const dbSize = await this.client.dbSize();
            
            return {
                isConnected: this.isConnected,
                dbSize: dbSize,
                info: info
            };
            
        } catch (error) {
            logger.error('❌ 获取缓存统计信息失败:', error.message);
            return null;
        }
    }
    
    // 构建缓存键
    buildCacheKey(key, strategy) {
        const strategyConfig = this.cacheStrategies[strategy] || this.cacheStrategies.default;
        const prefix = strategyConfig.prefix || 'cache:';
        return `${prefix}${key}`;
    }
    
    // 获取TTL
    getTTL(strategy) {
        const strategyConfig = this.cacheStrategies[strategy] || this.cacheStrategies.default;
        return strategyConfig.ttl || this.defaultTTL;
    }
    
    // 健康检查
    async healthCheck() {
        try {
            if (!this.isConnected || !this.client) {
                return { status: 'disconnected', message: 'Redis未连接' };
            }
            
            await this.client.ping();
            return { status: 'healthy', message: 'Redis连接正常' };
            
        } catch (error) {
            return { status: 'unhealthy', message: `Redis健康检查失败: ${error.message}` };
        }
    }
    
    // 关闭连接
    async close() {
        try {
            if (this.client) {
                await this.client.quit();
                logger.info('✅ Redis连接已关闭');
            }
        } catch (error) {
            logger.error('❌ 关闭Redis连接失败:', error.message);
        }
    }
}

module.exports = CacheService;
