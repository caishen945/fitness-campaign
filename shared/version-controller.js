/**
 * 统一版本控制器
 * 管理整个系统的版本号和缓存失效
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class UnifiedVersionController {
    constructor() {
        this.configPath = path.join(__dirname, 'version-config.json');
        this.loadConfig();
    }

    /**
     * 加载版本配置
     */
    loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                const data = fs.readFileSync(this.configPath, 'utf8');
                this.config = JSON.parse(data);
            } else {
                this.config = {
                    version: '3.0.2',
                    timestamp: Date.now(),
                    lastUpdated: new Date().toISOString()
                };
                this.saveConfig();
            }
        } catch (error) {
            console.error('版本配置加载失败:', error);
            this.config = {
                version: '3.0.2',
                timestamp: Date.now(),
                lastUpdated: new Date().toISOString()
            };
        }
    }

    /**
     * 保存版本配置
     */
    saveConfig() {
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
        } catch (error) {
            console.error('版本配置保存失败:', error);
        }
    }

    /**
     * 获取当前版本
     */
    getCurrentVersion() {
        return this.config.version;
    }

    /**
     * 获取版本时间戳
     */
    getTimestamp() {
        return this.config.timestamp;
    }

    /**
     * 更新版本号
     */
    updateVersion(newVersion) {
        const oldVersion = this.config.version;
        this.config.version = newVersion;
        this.config.timestamp = Date.now();
        this.config.lastUpdated = new Date().toISOString();
        this.saveConfig();
        
        console.log(`版本已更新: ${oldVersion} → ${newVersion}`);
        return true;
    }

    /**
     * 自动递增版本号
     */
    incrementVersion() {
        const parts = this.config.version.split('.');
        const patch = parseInt(parts[2]) + 1;
        const newVersion = `${parts[0]}.${parts[1]}.${patch}`;
        return this.updateVersion(newVersion);
    }

    /**
     * 生成版本化URL
     */
    generateVersionedURL(url) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}v=${this.config.version}&t=${this.config.timestamp}`;
    }

    /**
     * 生成版本化模块导入路径
     */
    generateVersionedModulePath(modulePath) {
        return `${modulePath}?v=${this.config.version}&t=${this.config.timestamp}`;
    }

    /**
     * 获取缓存控制头
     */
    getCacheHeaders() {
        return {
            'Cache-Control': 'no-cache, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0',
            'ETag': `"${this.config.version}-${this.config.timestamp}"`
        };
    }

    /**
     * 验证版本一致性
     */
    validateConsistency(otherVersion) {
        return this.config.version === otherVersion;
    }

    /**
     * 获取版本信息
     */
    getVersionInfo() {
        return {
            version: this.config.version,
            timestamp: this.config.timestamp,
            lastUpdated: this.config.lastUpdated,
            formattedTime: new Date(this.config.timestamp).toLocaleString('zh-CN')
        };
    }

    /**
     * 广播版本更新事件
     */
    broadcastUpdate() {
        // 这里可以扩展为实际的事件广播机制
        console.log(`版本更新广播: ${this.config.version} @ ${this.config.lastUpdated}`);
        return this.getVersionInfo();
    }
}

// 创建全局实例
const versionController = new UnifiedVersionController();

export default versionController;
