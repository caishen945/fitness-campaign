// Telegram轮询管理页面
class TelegramManagement {
    constructor() {
        this.status = null;
        this.refreshInterval = null;
        this.isLoading = false;
    }

    async render() {
        return `
            <div class="telegram-management-page">
                <div class="page-header" style="margin-bottom: 2rem;">
                    <h1 style="color: #2c3e50; margin-bottom: 0.5rem;">
                        <i class="fab fa-telegram-plane" style="color: #0088cc; margin-right: 10px;"></i>
                        Telegram轮询管理
                    </h1>
                    <p style="color: #7f8c8d; margin: 0;">管理Telegram Bot的轮询状态和配置</p>
                </div>

                <!-- 状态卡�?-->
                <div class="status-cards" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                    <div class="status-card" style="background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <div class="card-header" style="display: flex; align-items: center; margin-bottom: 1rem;">
                            <div class="status-indicator" id="pollingStatusIndicator" style="width: 12px; height: 12px; border-radius: 50%; background: #95a5a6; margin-right: 10px;"></div>
                            <h3 style="margin: 0; color: #2c3e50;">轮询状�?/h3>
                        </div>
                        <div class="status-info">
                            <div style="margin-bottom: 0.5rem;">
                                <span style="color: #7f8c8d;">状�?</span>
                                <span id="pollingStatus" style="margin-left: 10px; font-weight: bold;">检查中...</span>
                            </div>
                            <div style="margin-bottom: 0.5rem;">
                                <span style="color: #7f8c8d;">运行时间:</span>
                                <span id="pollingUptime" style="margin-left: 10px;">--</span>
                            </div>
                            <div>
                                <span style="color: #7f8c8d;">消息�?</span>
                                <span id="messageCount" style="margin-left: 10px; font-weight: bold;">--</span>
                            </div>
                        </div>
                    </div>

                    <div class="config-card" style="background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <div class="card-header" style="margin-bottom: 1rem;">
                            <h3 style="margin: 0; color: #2c3e50;">配置信息</h3>
                        </div>
                        <div class="config-info">
                            <div style="margin-bottom: 0.5rem;">
                                <span style="color: #7f8c8d;">当前间隔:</span>
                                <span id="currentInterval" style="margin-left: 10px; font-weight: bold;">--</span>
                            </div>
                            <div style="margin-bottom: 0.5rem;">
                                <span style="color: #7f8c8d;">空轮询次�?</span>
                                <span id="emptyPollCount" style="margin-left: 10px;">--</span>
                            </div>
                            <div>
                                <span style="color: #7f8c8d;">详细日志:</span>
                                <span id="verboseLogging" style="margin-left: 10px;">--</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 控制面板 -->
                <div class="control-panel" style="background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 2rem;">
                    <h3 style="color: #2c3e50; margin-bottom: 1.5rem;">控制面板</h3>
                    
                    <div class="control-buttons" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                        <button id="startPollingBtn" class="btn btn-success" style="padding: 0.75rem 1.5rem; border: none; border-radius: 5px; color: white; font-weight: bold; cursor: pointer; transition: all 0.3s;">
                            <i class="fas fa-play" style="margin-right: 8px;"></i>
                            启动轮询
                        </button>
                        
                        <button id="stopPollingBtn" class="btn btn-danger" style="padding: 0.75rem 1.5rem; border: none; border-radius: 5px; color: white; font-weight: bold; cursor: pointer; transition: all 0.3s;">
                            <i class="fas fa-stop" style="margin-right: 8px;"></i>
                            停止轮询
                        </button>
                        
                        <button id="enablePollingBtn" class="btn btn-primary" style="padding: 0.75rem 1.5rem; border: none; border-radius: 5px; color: white; font-weight: bold; cursor: pointer; transition: all 0.3s;">
                            <i class="fas fa-toggle-on" style="margin-right: 8px;"></i>
                            启用功能
                        </button>
                        
                        <button id="disablePollingBtn" class="btn btn-warning" style="padding: 0.75rem 1.5rem; border: none; border-radius: 5px; color: white; font-weight: bold; cursor: pointer; transition: all 0.3s;">
                            <i class="fas fa-toggle-off" style="margin-right: 8px;"></i>
                            禁用功能
                        </button>
                    </div>

                    <div class="log-controls" style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <label style="color: #2c3e50; font-weight: bold;">详细日志:</label>
                        <button id="enableVerboseBtn" class="btn btn-info" style="padding: 0.5rem 1rem; border: none; border-radius: 5px; color: white; font-weight: bold; cursor: pointer;">
                            启用
                        </button>
                        <button id="disableVerboseBtn" class="btn btn-secondary" style="padding: 0.5rem 1rem; border: none; border-radius: 5px; color: white; font-weight: bold; cursor: pointer;">
                            禁用
                        </button>
                    </div>

                    <div class="refresh-controls" style="display: flex; align-items: center; gap: 1rem;">
                        <button id="refreshStatusBtn" class="btn btn-outline-primary" style="padding: 0.5rem 1rem; border: 2px solid #007bff; border-radius: 5px; color: #007bff; background: transparent; font-weight: bold; cursor: pointer;">
                            <i class="fas fa-sync-alt" style="margin-right: 8px;"></i>
                            刷新状�?
                        </button>
                        
                        <label style="color: #2c3e50; font-weight: bold;">自动刷新:</label>
                        <button id="autoRefreshBtn" class="btn btn-outline-success" style="padding: 0.5rem 1rem; border: 2px solid #28a745; border-radius: 5px; color: #28a745; background: transparent; font-weight: bold; cursor: pointer;">
                            开�?
                        </button>
                    </div>
                </div>

                <!-- 日志显示区域 -->
                <div class="log-panel" style="background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h3 style="color: #2c3e50; margin-bottom: 1rem;">实时状�?/h3>
                    <div id="logContainer" style="background: #f8f9fa; padding: 1rem; border-radius: 5px; min-height: 200px; max-height: 400px; overflow-y: auto; font-family: 'Courier New', monospace; font-size: 0.9rem; color: #2c3e50;">
                        <div style="color: #6c757d;">等待状态更�?..</div>
                    </div>
                </div>
            </div>
        `;
    }

    async afterRender() {
        console.log('🚀 Telegram管理页面初始�?..');
        
        // 绑定事件监听�?
        this.bindEventListeners();
        
        // 加载初始状�?
        await this.loadStatus();
        
        // 开始自动刷�?
        this.startAutoRefresh();
        
        console.log('�?Telegram管理页面初始化完�?);
    }

    bindEventListeners() {
        // 控制按钮事件
        document.getElementById('startPollingBtn')?.addEventListener('click', () => this.startPolling());
        document.getElementById('stopPollingBtn')?.addEventListener('click', () => this.stopPolling());
        document.getElementById('enablePollingBtn')?.addEventListener('click', () => this.enablePolling());
        document.getElementById('disablePollingBtn')?.addEventListener('click', () => this.disablePolling());
        
        // 日志控制事件
        document.getElementById('enableVerboseBtn')?.addEventListener('click', () => this.setVerboseLogging(true));
        document.getElementById('disableVerboseBtn')?.addEventListener('click', () => this.setVerboseLogging(false));
        
        // 刷新控制事件
        document.getElementById('refreshStatusBtn')?.addEventListener('click', () => this.loadStatus());
        document.getElementById('autoRefreshBtn')?.addEventListener('click', () => this.toggleAutoRefresh());
    }

    async loadStatus() {
        try {
            this.isLoading = true;
            this.updateLog('正在获取Telegram轮询状�?..');
            
            const response = await fetch('http://localhost:3000/api/telegram/status');
            const result = await response.json();
            
            if (result.success) {
                this.status = result.data;
                this.updateStatusDisplay();
                this.updateLog(`状态更新成�?- 轮询: ${this.status.isPolling ? '运行�? : '已停�?}`);
            } else {
                this.updateLog(`获取状态失�? ${result.error}`, 'error');
            }
        } catch (error) {
            this.updateLog(`网络错误: ${error.message}`, 'error');
        } finally {
            this.isLoading = false;
        }
    }

    updateStatusDisplay() {
        if (!this.status) return;

        // 更新轮询状�?
        const statusIndicator = document.getElementById('pollingStatusIndicator');
        const pollingStatus = document.getElementById('pollingStatus');
        
        if (this.status.isPolling) {
            statusIndicator.style.background = '#28a745';
            pollingStatus.textContent = '运行�?;
            pollingStatus.style.color = '#28a745';
        } else {
            statusIndicator.style.background = '#dc3545';
            pollingStatus.textContent = '已停�?;
            pollingStatus.style.color = '#dc3545';
        }

        // 更新其他状态信�?
        document.getElementById('pollingUptime').textContent = this.formatUptime(this.status.uptime);
        document.getElementById('messageCount').textContent = this.status.messageCount || 0;
        document.getElementById('currentInterval').textContent = `${this.status.currentInterval}ms`;
        document.getElementById('emptyPollCount').textContent = this.status.emptyPollCount || 0;
        document.getElementById('verboseLogging').textContent = this.status.verboseLogging ? '启用' : '禁用';
        document.getElementById('verboseLogging').style.color = this.status.verboseLogging ? '#28a745' : '#6c757d';

        // 更新按钮状�?
        this.updateButtonStates();
    }

    updateButtonStates() {
        const startBtn = document.getElementById('startPollingBtn');
        const stopBtn = document.getElementById('stopPollingBtn');
        const enableBtn = document.getElementById('enablePollingBtn');
        const disableBtn = document.getElementById('disablePollingBtn');

        if (this.status.isPolling) {
            startBtn.disabled = true;
            startBtn.style.opacity = '0.5';
            stopBtn.disabled = false;
            stopBtn.style.opacity = '1';
        } else {
            startBtn.disabled = false;
            startBtn.style.opacity = '1';
            stopBtn.disabled = true;
            stopBtn.style.opacity = '0.5';
        }

        if (this.status.enabled) {
            enableBtn.disabled = true;
            enableBtn.style.opacity = '0.5';
            disableBtn.disabled = false;
            disableBtn.style.opacity = '1';
        } else {
            enableBtn.disabled = false;
            enableBtn.style.opacity = '1';
            disableBtn.disabled = true;
            disableBtn.style.opacity = '0.5';
        }
    }

    async startPolling() {
        try {
            this.updateLog('正在启动Telegram轮询...');
            const response = await fetch('http://localhost:3000/api/telegram/start', { method: 'POST' });
            const result = await response.json();
            
            if (result.success) {
                this.updateLog('轮询启动成功', 'success');
                await this.loadStatus();
            } else {
                this.updateLog(`启动失败: ${result.error}`, 'error');
            }
        } catch (error) {
            this.updateLog(`启动错误: ${error.message}`, 'error');
        }
    }

    async stopPolling() {
        try {
            this.updateLog('正在停止Telegram轮询...');
            const response = await fetch('http://localhost:3000/api/telegram/stop', { method: 'POST' });
            const result = await response.json();
            
            if (result.success) {
                this.updateLog('轮询停止成功', 'success');
                await this.loadStatus();
            } else {
                this.updateLog(`停止失败: ${result.error}`, 'error');
            }
        } catch (error) {
            this.updateLog(`停止错误: ${error.message}`, 'error');
        }
    }

    async enablePolling() {
        try {
            this.updateLog('正在启用Telegram轮询功能...');
            const response = await fetch('http://localhost:3000/api/telegram/enable', { method: 'POST' });
            const result = await response.json();
            
            if (result.success) {
                this.updateLog('轮询功能启用成功', 'success');
                await this.loadStatus();
            } else {
                this.updateLog(`启用失败: ${result.error}`, 'error');
            }
        } catch (error) {
            this.updateLog(`启用错误: ${error.message}`, 'error');
        }
    }

    async disablePolling() {
        try {
            this.updateLog('正在禁用Telegram轮询功能...');
            const response = await fetch('http://localhost:3000/api/telegram/disable', { method: 'POST' });
            const result = await response.json();
            
            if (result.success) {
                this.updateLog('轮询功能禁用成功', 'success');
                await this.loadStatus();
            } else {
                this.updateLog(`禁用失败: ${result.error}`, 'error');
            }
        } catch (error) {
            this.updateLog(`禁用错误: ${error.message}`, 'error');
        }
    }

    async setVerboseLogging(verbose) {
        try {
            this.updateLog(`正在${verbose ? '启用' : '禁用'}详细日志...`);
            const response = await fetch('http://localhost:3000/api/telegram/verbose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verbose })
            });
            const result = await response.json();
            
            if (result.success) {
                this.updateLog(`详细日志${verbose ? '启用' : '禁用'}成功`, 'success');
                await this.loadStatus();
            } else {
                this.updateLog(`设置失败: ${result.error}`, 'error');
            }
        } catch (error) {
            this.updateLog(`设置错误: ${error.message}`, 'error');
        }
    }

    startAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            if (!this.isLoading) {
                this.loadStatus();
            }
        }, 5000); // �?秒刷新一�?
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    toggleAutoRefresh() {
        const btn = document.getElementById('autoRefreshBtn');
        if (this.refreshInterval) {
            this.stopAutoRefresh();
            btn.textContent = '开�?;
            btn.className = 'btn btn-outline-success';
            this.updateLog('自动刷新已关�?);
        } else {
            this.startAutoRefresh();
            btn.textContent = '关闭';
            btn.className = 'btn btn-success';
            this.updateLog('自动刷新已开�?);
        }
    }

    updateLog(message, type = 'info') {
        const logContainer = document.getElementById('logContainer');
        const timestamp = new Date().toLocaleTimeString();
        const color = type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#6c757d';
        
        const logEntry = document.createElement('div');
        logEntry.style.marginBottom = '0.5rem';
        logEntry.style.color = color;
        logEntry.innerHTML = `[${timestamp}] ${message}`;
        
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
        
        // 限制日志条目数量
        const entries = logContainer.children;
        if (entries.length > 50) {
            logContainer.removeChild(entries[0]);
        }
    }

    formatUptime(ms) {
        if (!ms) return '--';
        
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}小时${minutes % 60}分钟`;
        } else if (minutes > 0) {
            return `${minutes}分钟${seconds % 60}秒`;
        } else {
            return `${seconds}秒`;
        }
    }

    destroy() {
        this.stopAutoRefresh();
        console.log('🧹 Telegram管理页面已清�?);
    }
}

export default TelegramManagement;
