const fs = require('fs');
const path = require('path');
const { PATHS } = require('./paths');

/**
 * 路径监控器
 */
class PathMonitor {
    constructor() {
        this.watchers = new Map();
        this.stats = {
            fileChanges: 0,
            directoryChanges: 0,
            errors: 0,
            startTime: Date.now()
        };
        this.callbacks = {
            onFileChange: null,
            onDirectoryChange: null,
            onError: null
        };
    }

    /**
     * 开始监控
     */
    startMonitoring(options = {}) {
        console.log('👁️ 开始路径监控...');
        
        const {
            watchBackend = true,
            watchFrontend = true,
            watchAdmin = true,
            watchDatabase = false,
            recursive = true,
            persistent = true
        } = options;

        const watchOptions = {
            recursive,
            persistent
        };

        try {
            if (watchBackend) {
                this.watchDirectory(PATHS.BACKEND, 'backend', watchOptions);
            }
            
            if (watchFrontend) {
                this.watchDirectory(PATHS.FRONTEND, 'frontend', watchOptions);
            }
            
            if (watchAdmin) {
                this.watchDirectory(PATHS.ADMIN, 'admin', watchOptions);
            }
            
            if (watchDatabase) {
                this.watchDirectory(PATHS.DATABASE, 'database', watchOptions);
            }

            console.log('✅ 路径监控已启动');
            
        } catch (error) {
            console.error('❌ 启动路径监控失败:', error);
            this.stats.errors++;
        }
    }

    /**
     * 监控目录
     */
    watchDirectory(dirPath, moduleName, options) {
        if (!fs.existsSync(dirPath)) {
            console.warn(`⚠️ 目录不存在，跳过监控: ${dirPath}`);
            return;
        }

        try {
            const watcher = fs.watch(dirPath, options, (eventType, filename) => {
                this.handleFileChange(eventType, filename, dirPath, moduleName);
            });

            this.watchers.set(moduleName, {
                path: dirPath,
                watcher: watcher,
                startTime: Date.now()
            });

            console.log(`👁️ 监控目录: ${moduleName} (${dirPath})`);

        } catch (error) {
            console.error(`❌ 监控目录失败: ${dirPath}`, error);
            this.stats.errors++;
        }
    }

    /**
     * 处理文件变化
     */
    handleFileChange(eventType, filename, dirPath, moduleName) {
        const filePath = path.join(dirPath, filename);
        const relativePath = path.relative(PATHS.ROOT, filePath);
        
        // 忽略临时文件和隐藏文件
        if (this.shouldIgnoreFile(filename)) {
            return;
        }

        const changeInfo = {
            eventType,
            filename,
            filePath,
            relativePath,
            moduleName,
            timestamp: Date.now()
        };

        switch (eventType) {
            case 'change':
                this.stats.fileChanges++;
                console.log(`📝 文件变化: ${relativePath} (${moduleName})`);
                if (this.callbacks.onFileChange) {
                    this.callbacks.onFileChange(changeInfo);
                }
                break;
                
            case 'rename':
                // 检查文件是否存在来判断是创建还是删除
                if (fs.existsSync(filePath)) {
                    this.stats.fileChanges++;
                    console.log(`➕ 文件创建: ${relativePath} (${moduleName})`);
                } else {
                    this.stats.fileChanges++;
                    console.log(`➖ 文件删除: ${relativePath} (${moduleName})`);
                }
                if (this.callbacks.onFileChange) {
                    this.callbacks.onFileChange(changeInfo);
                }
                break;
        }
    }

    /**
     * 判断是否应该忽略文件
     */
    shouldIgnoreFile(filename) {
        const ignorePatterns = [
            /^\./,           // 隐藏文件
            /~$/,            // 临时文件
            /\.tmp$/,        // 临时文件
            /\.log$/,        // 日志文件
            /\.cache$/,      // 缓存文件
            /node_modules/,  // node_modules
            /\.git/,         // git目录
            /\.vscode/,      // vscode配置
            /\.idea/,        // idea配置
            /\.DS_Store/,    // macOS系统文件
            /Thumbs\.db/,    // Windows缩略图
        ];

        return ignorePatterns.some(pattern => pattern.test(filename));
    }

    /**
     * 停止监控
     */
    stopMonitoring() {
        console.log('🛑 停止路径监控...');
        
        this.watchers.forEach((info, moduleName) => {
            try {
                info.watcher.close();
                console.log(`✅ 停止监控: ${moduleName}`);
            } catch (error) {
                console.error(`❌ 停止监控失败: ${moduleName}`, error);
            }
        });

        this.watchers.clear();
        console.log('✅ 路径监控已停止');
    }

    /**
     * 获取监控统计
     */
    getStats() {
        const uptime = Date.now() - this.stats.startTime;
        const uptimeMinutes = Math.floor(uptime / 60000);
        
        return {
            ...this.stats,
            uptime,
            uptimeMinutes,
            activeWatchers: this.watchers.size,
            watcherDetails: Array.from(this.watchers.entries()).map(([name, info]) => ({
                module: name,
                path: info.path,
                uptime: Date.now() - info.startTime
            }))
        };
    }

    /**
     * 设置回调函数
     */
    on(event, callback) {
        if (this.callbacks.hasOwnProperty(event)) {
            this.callbacks[event] = callback;
        }
    }

    /**
     * 生成监控报告
     */
    generateReport() {
        const stats = this.getStats();
        
        console.log('\n📊 路径监控报告:');
        console.log(`⏱️ 运行时间: ${stats.uptimeMinutes} 分钟`);
        console.log(`📝 文件变化: ${stats.fileChanges} 次`);
        console.log(`📁 目录变化: ${stats.directoryChanges} 次`);
        console.log(`❌ 错误次数: ${stats.errors} 次`);
        console.log(`👁️ 活跃监控: ${stats.activeWatchers} 个`);
        
        if (stats.watcherDetails.length > 0) {
            console.log('\n📋 监控详情:');
            stats.watcherDetails.forEach(detail => {
                const uptimeMinutes = Math.floor(detail.uptime / 60000);
                console.log(`  - ${detail.module}: ${detail.path} (运行 ${uptimeMinutes} 分钟)`);
            });
        }

        // 保存报告
        const report = {
            timestamp: new Date().toISOString(),
            stats,
            summary: {
                totalChanges: stats.fileChanges + stats.directoryChanges,
                errorRate: stats.errors / (stats.fileChanges + stats.directoryChanges + 1)
            }
        };

        const reportPath = path.join(PATHS.ROOT, 'path-monitor-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 详细报告已保存到: ${reportPath}`);
    }

    /**
     * 性能分析
     */
    analyzePerformance() {
        const stats = this.getStats();
        const changesPerMinute = stats.uptimeMinutes > 0 ? 
            (stats.fileChanges + stats.directoryChanges) / stats.uptimeMinutes : 0;

        console.log('\n⚡ 性能分析:');
        console.log(`📈 变化频率: ${changesPerMinute.toFixed(2)} 次/分钟`);
        console.log(`🎯 错误率: ${(stats.errors / (stats.fileChanges + stats.directoryChanges + 1) * 100).toFixed(2)}%`);
        
        if (changesPerMinute > 10) {
            console.log('⚠️ 高变化频率，建议检查是否有不必要的文件操作');
        }
        
        if (stats.errors > 0) {
            console.log('⚠️ 存在监控错误，建议检查文件权限和路径配置');
        }
    }
}

module.exports = PathMonitor;
