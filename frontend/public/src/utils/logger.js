class FrontendLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000; // 最多保留1000条日志
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        
        // 初始化日志
        this.info('SYSTEM', '前端日志系统初始化完成', {
            sessionId: this.sessionId,
            userAgent: navigator.userAgent,
            url: window.location.href
        });

        // 监听页面错误
        this.setupErrorHandlers();
    }

    generateSessionId() {
        return `frontend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
            userAgent: navigator.userAgent
        };

        // 添加到内存日志
        this.logs.push(logEntry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // 控制台输出
        this.outputToConsole(logEntry);

        // 发送到后端（非阻塞）
        this.sendToBackend(logEntry);

        // 存储到localStorage（限制大小）
        this.storeToLocal(logEntry);
    }

    outputToConsole(logEntry) {
        const colors = {
            INFO: 'color: #2196F3',
            WARN: 'color: #FF9800',
            ERROR: 'color: #F44336',
            SUCCESS: 'color: #4CAF50',
            DEBUG: 'color: #9C27B0'
        };
        
        const style = colors[logEntry.level] || 'color: #333';
        console.log(
            `%c[${logEntry.timestamp}] [${logEntry.level}] [${logEntry.category}] ${logEntry.message}`,
            style
        );
        
        if (logEntry.data) {
            console.log('    DATA:', logEntry.data);
        }
        
        if (logEntry.error) {
            console.error('    ERROR:', logEntry.error);
        }
    }

    async sendToBackend(logEntry) {
        try {
            // 非阻塞发送到后端日志收集接口
            fetch('/api/logs/frontend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(logEntry)
            }).catch(() => {
                // 静默忽略发送失败，避免日志系统影响主功能
            });
        } catch (error) {
            // 静默忽略
        }
    }

    storeToLocal(logEntry) {
        try {
            const localLogs = JSON.parse(localStorage.getItem('frontendLogs') || '[]');
            localLogs.push(logEntry);
            
            // 只保留最近100条本地日志
            if (localLogs.length > 100) {
                localLogs.splice(0, localLogs.length - 100);
            }
            
            localStorage.setItem('frontendLogs', JSON.stringify(localLogs));
        } catch (error) {
            // localStorage可能已满，清除旧日志
            localStorage.removeItem('frontendLogs');
        }
    }

    setupErrorHandlers() {
        // 捕获未处理的JavaScript错误
        window.addEventListener('error', (event) => {
            this.error('SYSTEM', '未处理的JavaScript错误', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            }, event.error);
        });

        // 捕获Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
            this.error('SYSTEM', '未处理的Promise拒绝', {
                reason: event.reason
            });
        });

        // 监听网络错误
        window.addEventListener('online', () => {
            this.info('NETWORK', '网络已连接');
        });

        window.addEventListener('offline', () => {
            this.warn('NETWORK', '网络已断开');
        });
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

    // 专用日志方法
    userAction(action, element, data) {
        this.info('USER-ACTION', `${action}`, {
            element: element ? element.tagName + (element.id ? '#' + element.id : '') + (element.className ? '.' + element.className : '') : null,
            data
        });
    }

    apiCall(method, url, requestData, startTime) {
        this.info('API-CALL', `${method} ${url}`, {
            requestData: this.sanitizeData(requestData),
            timestamp: startTime || Date.now()
        });
    }

    apiResponse(method, url, status, responseData, duration) {
        const level = status >= 400 ? 'ERROR' : 'SUCCESS';
        this.log(level, 'API-RESPONSE', `${method} ${url} - ${status}`, {
            responseData: this.sanitizeData(responseData),
            duration: `${duration}ms`
        });
    }

    navigation(from, to) {
        this.info('NAVIGATION', `从 ${from} 导航到 ${to}`, {
            from,
            to,
            timestamp: Date.now()
        });
    }

    authentication(event, success, data) {
        const level = success ? 'SUCCESS' : 'ERROR';
        this.log(level, 'AUTH', event, this.sanitizeData(data));
    }

    vipOperation(operation, data, success, error) {
        const level = success ? 'SUCCESS' : 'ERROR';
        this.log(level, 'VIP-OPERATION', operation, this.sanitizeData(data), error);
    }

    sanitizeData(data) {
        if (!data) return null;
        
        const sanitized = JSON.parse(JSON.stringify(data));
        
        // 移除敏感信息
        if (sanitized.password) sanitized.password = '***';
        if (sanitized.token) sanitized.token = sanitized.token.substring(0, 10) + '***';
        if (sanitized.Authorization) sanitized.Authorization = 'Bearer ***';
        
        return sanitized;
    }

    // 获取日志报告
    getLogReport() {
        return {
            sessionId: this.sessionId,
            sessionDuration: Date.now() - this.startTime,
            totalLogs: this.logs.length,
            errorCount: this.logs.filter(log => log.level === 'ERROR').length,
            warningCount: this.logs.filter(log => log.level === 'WARN').length,
            lastErrors: this.logs.filter(log => log.level === 'ERROR').slice(-5),
            logs: this.logs
        };
    }

    // 导出日志
    exportLogs() {
        const report = this.getLogReport();
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `frontend-logs-${this.sessionId}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // 清除日志
    clearLogs() {
        this.logs = [];
        localStorage.removeItem('frontendLogs');
        this.info('SYSTEM', '日志已清除');
    }
}

// 创建全局日志实例
const logger = new FrontendLogger();

// 暴露到全局
window.frontendLogger = logger;

export default logger;
