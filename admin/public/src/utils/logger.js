class AdminLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000;
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        
        this.info('SYSTEM', '管理员后台日志系统初始化完成', {
            sessionId: this.sessionId,
            userAgent: navigator.userAgent,
            url: window.location.href
        });

        this.setupErrorHandlers();
        this.setupPerformanceMonitoring();
    }

    generateSessionId() {
        return `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    formatTimestamp() {
        return new Date().toISOString().replace('T', ' ').substring(0, 23);
    }

    log(level, category, message, data = null, error = null) {
        const logEntry = {
            timestamp: this.formatTimestamp(),
            sessionId: this.sessionId,
            level,
            category,
            message,
            data,
            error: error ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : null,
            url: window.location.href,
            adminUser: this.getAdminUser(),
            memoryUsage: this.getMemoryUsage()
        };

        this.logs.push(logEntry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        this.outputToConsole(logEntry);
        this.sendToBackend(logEntry);
        this.storeToLocal(logEntry);
        this.updateLogDisplay(logEntry);
    }

    outputToConsole(logEntry) {
        const colors = {
            INFO: 'color: #2196F3; background: #E3F2FD; padding: 2px 5px; border-radius: 3px',
            WARN: 'color: #F57C00; background: #FFF3E0; padding: 2px 5px; border-radius: 3px',
            ERROR: 'color: #D32F2F; background: #FFEBEE; padding: 2px 5px; border-radius: 3px',
            SUCCESS: 'color: #388E3C; background: #E8F5E8; padding: 2px 5px; border-radius: 3px',
            DEBUG: 'color: #7B1FA2; background: #F3E5F5; padding: 2px 5px; border-radius: 3px'
        };
        
        const style = colors[logEntry.level] || 'color: #333';
        console.log(
            `%c[${logEntry.timestamp}] [${logEntry.level}] [${logEntry.category}] ${logEntry.message}`,
            style
        );
        
        if (logEntry.data) {
            console.group('数据详情:');
            console.log(logEntry.data);
            console.groupEnd();
        }
        
        if (logEntry.error) {
            console.group('错误详情:');
            console.error(logEntry.error);
            console.groupEnd();
        }
    }

    setupErrorHandlers() {
        window.addEventListener('error', (event) => {
            this.error('SYSTEM', '未处理的JavaScript错误', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            }, event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.error('SYSTEM', '未处理的Promise拒绝', {
                reason: event.reason?.toString(),
                stack: event.reason?.stack
            });
        });
    }

    setupPerformanceMonitoring() {
        // 监控页面性能
        if (window.performance && window.performance.timing) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const timing = window.performance.timing;
                    const loadTime = timing.loadEventEnd - timing.navigationStart;
                    this.info('PERFORMANCE', '页面加载性能', {
                        totalLoadTime: `${loadTime}ms`,
                        domContentLoaded: `${timing.domContentLoadedEventEnd - timing.navigationStart}ms`,
                        firstPaint: this.getFirstPaint()
                    });
                }, 1000);
            });
        }
    }

    getFirstPaint() {
        if (window.performance && window.performance.getEntriesByType) {
            const paintEntries = window.performance.getEntriesByType('paint');
            const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
            return firstPaint ? `${Math.round(firstPaint.startTime)}ms` : 'unknown';
        }
        return 'unknown';
    }

    getAdminUser() {
        try {
            const adminUser = localStorage.getItem('adminUser');
            return adminUser ? JSON.parse(adminUser) : null;
        } catch {
            return null;
        }
    }

    getMemoryUsage() {
        if (window.performance && window.performance.memory) {
            return {
                used: `${Math.round(window.performance.memory.usedJSHeapSize / 1024 / 1024)}MB`,
                total: `${Math.round(window.performance.memory.totalJSHeapSize / 1024 / 1024)}MB`,
                limit: `${Math.round(window.performance.memory.jsHeapSizeLimit / 1024 / 1024)}MB`
            };
        }
        return null;
    }

    async sendToBackend(logEntry) {
        try {
            // 使用统一的API配置
            const config = window.API_CONFIG || { baseUrl: 'http://localhost:3000' };
            fetch(`${config.baseUrl}/api/logs/admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(logEntry)
            }).catch(() => {
                // 静默处理错误，不影响主应�?
            });
        } catch (error) {
            // 静默处理错误，不影响主应�?
        }
    }

    storeToLocal(logEntry) {
        try {
            const localLogs = JSON.parse(localStorage.getItem('adminLogs') || '[]');
            localLogs.push(logEntry);
            
            if (localLogs.length > 100) {
                localLogs.splice(0, localLogs.length - 100);
            }
            
            localStorage.setItem('adminLogs', JSON.stringify(localLogs));
        } catch (error) {
            localStorage.removeItem('adminLogs');
        }
    }

    updateLogDisplay(logEntry) {
        // 如果页面有日志显示区域，实时更新
        const logDisplay = document.getElementById('real-time-logs');
        if (logDisplay) {
            const logElement = document.createElement('div');
            logElement.className = `log-entry log-${logEntry.level.toLowerCase()}`;
            logElement.innerHTML = `
                <span class="log-time">${logEntry.timestamp}</span>
                <span class="log-level">${logEntry.level}</span>
                <span class="log-category">${logEntry.category}</span>
                <span class="log-message">${logEntry.message}</span>
            `;
            
            logDisplay.insertBefore(logElement, logDisplay.firstChild);
            
            // 只显示最�?0�?
            const logEntries = logDisplay.querySelectorAll('.log-entry');
            if (logEntries.length > 50) {
                logEntries[logEntries.length - 1].remove();
            }
        }
    }

    // 便捷方法
    info(category, message, data) {
        this.log('INFO', category, message, data);
    }

    warn(category, message, data) {
        this.log('WARN', category, message, data);
    }

    error(category, message, data, error) {
        this.log('ERROR', category, message, data, error);
    }

    success(category, message, data) {
        this.log('SUCCESS', category, message, data);
    }

    debug(category, message, data) {
        this.log('DEBUG', category, message, data);
    }

    // 管理员专用日志方�?
    adminAction(action, target, data) {
        this.info('ADMIN-ACTION', `${action} - ${target}`, {
            action,
            target,
            data: this.sanitizeData(data),
            adminUser: this.getAdminUser()?.username
        });
    }

    vipManagement(operation, levelId, data, success, error) {
        const level = success ? 'SUCCESS' : 'ERROR';
        this.log(level, 'VIP-MANAGEMENT', `${operation} VIP等级 ${levelId}`, {
            operation,
            levelId,
            data: this.sanitizeData(data),
            success,
            adminUser: this.getAdminUser()?.username
        }, error);
    }

    userManagement(operation, userId, data, success, error) {
        const level = success ? 'SUCCESS' : 'ERROR';
        this.log(level, 'USER-MANAGEMENT', `${operation} 用户 ${userId}`, {
            operation,
            userId,
            data: this.sanitizeData(data),
            success,
            adminUser: this.getAdminUser()?.username
        }, error);
    }

    authentication(event, username, success, error) {
        const level = success ? 'SUCCESS' : 'ERROR';
        this.log(level, 'ADMIN-AUTH', `${event} - ${username}`, {
            event,
            username,
            success,
            ip: this.getClientIP()
        }, error);
    }

    getClientIP() {
        // 尝试获取客户端IP（在实际部署中可能需要服务器端支持）
        return 'unknown';
    }

    sanitizeData(data) {
        if (!data) return null;
        
        const sanitized = JSON.parse(JSON.stringify(data));
        
        if (sanitized.password) sanitized.password = '***';
        if (sanitized.token) sanitized.token = sanitized.token.substring(0, 10) + '***';
        if (sanitized.Authorization) sanitized.Authorization = 'Bearer ***';
        
        return sanitized;
    }

    // 创建实时日志显示界面
    createLogDisplay() {
        return `
            <div id="log-display-container" style="
                position: fixed; 
                bottom: 10px; 
                right: 10px; 
                width: 400px; 
                height: 300px; 
                background: rgba(0,0,0,0.9); 
                color: white; 
                border-radius: 8px; 
                padding: 10px; 
                font-family: monospace; 
                font-size: 12px; 
                z-index: 9999;
                display: none;
                overflow: hidden;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="font-weight: bold;">实时日志</span>
                    <div>
                        <button onclick="this.parentElement.parentElement.parentElement.style.display='none'" style="background: #f44336; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer;">关闭</button>
                        <button onclick="document.getElementById('real-time-logs').innerHTML=''" style="background: #2196F3; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer; margin-left: 5px;">清除</button>
                    </div>
                </div>
                <div id="real-time-logs" style="height: 250px; overflow-y: auto; font-size: 11px;"></div>
            </div>
            <style>
                .log-entry { margin: 2px 0; padding: 2px; border-radius: 2px; }
                .log-info { background: rgba(33, 150, 243, 0.2); }
                .log-warn { background: rgba(255, 152, 0, 0.2); }
                .log-error { background: rgba(244, 67, 54, 0.2); }
                .log-success { background: rgba(76, 175, 80, 0.2); }
                .log-debug { background: rgba(156, 39, 176, 0.2); }
                .log-time { color: #888; margin-right: 5px; }
                .log-level { font-weight: bold; margin-right: 5px; }
                .log-category { color: #4CAF50; margin-right: 5px; }
            </style>
        `;
    }

    // 显示实时日志
    showLogDisplay() {
        let logContainer = document.getElementById('log-display-container');
        if (!logContainer) {
            document.body.insertAdjacentHTML('beforeend', this.createLogDisplay());
            logContainer = document.getElementById('log-display-container');
        }
        logContainer.style.display = 'block';
    }

    // 获取详细报告
    getDetailedReport() {
        const errors = this.logs.filter(log => log.level === 'ERROR');
        const warnings = this.logs.filter(log => log.level === 'WARN');
        const vipOperations = this.logs.filter(log => log.category === 'VIP-MANAGEMENT');
        
        return {
            sessionInfo: {
                sessionId: this.sessionId,
                duration: Date.now() - this.startTime,
                adminUser: this.getAdminUser(),
                memoryUsage: this.getMemoryUsage()
            },
            statistics: {
                totalLogs: this.logs.length,
                errorCount: errors.length,
                warningCount: warnings.length,
                vipOperationCount: vipOperations.length
            },
            recentActivity: {
                lastErrors: errors.slice(-5),
                lastWarnings: warnings.slice(-5),
                recentVipOperations: vipOperations.slice(-10)
            },
            fullLogs: this.logs
        };
    }
}

const adminLogger = new AdminLogger();
window.adminLogger = adminLogger;

export default adminLogger;
