const TelegramBotHandler = require('./telegramBotHandler');

class TelegramPollingService {
    constructor() {
        this.botHandler = TelegramBotHandler;
        this.isPolling = false;
        this.pollingInterval = null;
        this.lastUpdateId = 0;
        this.maxRetries = 3;
        this.retryDelay = 5000; // 5秒
        this.startTime = null;
        
        // 智能轮询配置
        this.baseInterval = 5000; // 基础间隔5秒
        this.minInterval = 2000;  // 最小间隔2秒
        this.maxInterval = 30000; // 最大间隔30秒
        this.currentInterval = this.baseInterval;
        this.messageCount = 0;
        this.lastMessageTime = null;
        this.emptyPollCount = 0; // 连续空轮询次数
        
        // 轮询控制开关
        this.autoStart = false; // 默认不自动启动
        this.enabled = true; // 轮询功能是否启用
        
        // 日志控制
        this.verboseLogging = false; // 详细日志开关
        this.lastLogTime = 0; // 上次日志时间
    }

    // 开始轮询
    async startPolling() {
        if (!this.enabled) {
            console.log('⚠️ Telegram轮询功能已禁用');
            return;
        }
        
        if (this.isPolling) {
            console.log('⚠️ Telegram轮询服务已在运行中');
            return;
        }

        console.log('🚀 启动Telegram消息轮询服务...');
        this.isPolling = true;
        this.startTime = Date.now();

        try {
            // 获取Webhook信息，如果已设置则删除
            await this.botHandler.deleteWebhook();
            console.log('✅ 已删除Webhook，启用轮询模式');

            // 开始轮询
            this.startPollingLoop();
        } catch (error) {
            console.error('❌ 启动轮询服务失败:', error);
            this.isPolling = false;
        }
    }

    // 停止轮询
    stopPolling() {
        if (!this.isPolling) {
            console.log('⚠️ Telegram轮询服务未在运行');
            return;
        }

        console.log('🛑 停止Telegram消息轮询服务...');
        this.isPolling = false;

        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }

        console.log('✅ Telegram轮询服务已停止');
    }

    // 轮询循环
    startPollingLoop() {
        const poll = async () => {
            if (!this.isPolling) {
                return;
            }

            try {
                await this.pollUpdates();
            } catch (error) {
                console.error('❌ 轮询更新失败:', error);
            }
            
            // 智能调整下次轮询间隔
            this.adjustPollingInterval();
            
            // 设置下次轮询
            if (this.isPolling) {
                this.pollingInterval = setTimeout(poll, this.currentInterval);
            }
        };
        
        // 开始第一次轮询
        poll();
    }

    // 轮询更新
    async pollUpdates() {
        try {
            const updates = await this.getUpdates();
            
            if (updates && updates.length > 0) {
                console.log(`📱 收到 ${updates.length} 条新消息`);
                this.messageCount += updates.length;
                this.lastMessageTime = Date.now();
                this.emptyPollCount = 0; // 重置空轮询计数
                
                for (const update of updates) {
                    try {
                        // 处理消息
                        const result = await this.botHandler.handleMessage(update);
                        
                        if (result.success) {
                            console.log(`✅ 消息处理成功: ${update.message?.text || '回调查询'}`);
                        } else {
                            console.error(`❌ 消息处理失败:`, result.error);
                        }
                    } catch (error) {
                        console.error('❌ 处理单条消息失败:', error);
                    }
                }

                // 更新lastUpdateId
                const lastUpdate = updates[updates.length - 1];
                this.lastUpdateId = lastUpdate.update_id + 1;
            } else {
                // 没有新消息，增加空轮询计数
                this.emptyPollCount++;
                
                // 只在详细日志模式下或每30次空轮询记录一次
                if (this.verboseLogging || this.emptyPollCount % 30 === 0) {
                    const now = Date.now();
                    if (now - this.lastLogTime > 300000) { // 5分钟内最多记录一次
                        console.log(`📊 Telegram轮询状态: 连续${this.emptyPollCount}次空轮询，当前间隔${this.currentInterval}ms`);
                        this.lastLogTime = now;
                    }
                }
            }
        } catch (error) {
            console.error('❌ 获取更新失败:', error);
            this.emptyPollCount++;
        }
    }

    // 获取更新
    async getUpdates() {
        try {
            const response = await this.botHandler.getUpdates(this.lastUpdateId);
            
            if (response && response.ok && response.result) {
                return response.result;
            }
            
            return [];
        } catch (error) {
            console.error('❌ 获取Telegram更新失败:', error);
            return [];
        }
    }

    // 智能调整轮询间隔
    adjustPollingInterval() {
        const now = Date.now();
        
        // 如果最近有消息，使用较短间隔
        if (this.lastMessageTime && (now - this.lastMessageTime) < 60000) { // 1分钟内有消息
            this.currentInterval = this.minInterval; // 2秒
        }
        // 如果连续多次空轮询，逐渐增加间隔
        else if (this.emptyPollCount > 0) {
            if (this.emptyPollCount < 5) {
                this.currentInterval = this.baseInterval; // 5秒
            } else if (this.emptyPollCount < 15) {
                this.currentInterval = 10000; // 10秒
            } else if (this.emptyPollCount < 30) {
                this.currentInterval = 20000; // 20秒
            } else {
                this.currentInterval = this.maxInterval; // 30秒
            }
        } else {
            this.currentInterval = this.baseInterval; // 默认5秒
        }
        
        // 确保间隔在合理范围内
        this.currentInterval = Math.max(this.minInterval, Math.min(this.maxInterval, this.currentInterval));
    }

    // 启用轮询功能
    enable() {
        this.enabled = true;
        console.log('✅ Telegram轮询功能已启用');
    }

    // 禁用轮询功能
    disable() {
        this.enabled = false;
        if (this.isPolling) {
            this.stopPolling();
        }
        console.log('❌ Telegram轮询功能已禁用');
    }

    // 设置自动启动
    setAutoStart(autoStart) {
        this.autoStart = autoStart;
        console.log(`📋 Telegram轮询自动启动: ${autoStart ? '启用' : '禁用'}`);
    }

    // 设置详细日志
    setVerboseLogging(verbose) {
        this.verboseLogging = verbose;
        console.log(`📝 Telegram轮询详细日志: ${verbose ? '启用' : '禁用'}`);
    }

    // 获取服务状态
    getStatus() {
        return {
            isPolling: this.isPolling,
            enabled: this.enabled,
            autoStart: this.autoStart,
            verboseLogging: this.verboseLogging,
            lastUpdateId: this.lastUpdateId,
            uptime: this.isPolling ? Date.now() - this.startTime : 0,
            currentInterval: this.currentInterval,
            messageCount: this.messageCount,
            emptyPollCount: this.emptyPollCount,
            lastMessageTime: this.lastMessageTime
        };
    }
}

module.exports = new TelegramPollingService();
