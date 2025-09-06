// 版本更新工具
// 用于自动更新版本配置和文件引用

import VERSION_CONFIG from '../config/version.js';

class VersionUpdater {
    constructor() {
        this.config = VERSION_CONFIG;
        // 初始化版本信息
        this.initVersionInfo();
    }

    // 初始化版本信息
    initVersionInfo() {
        // 解析版本号
        const versionParts = this.config.VERSION.split('.');
        this.config.MAJOR = parseInt(versionParts[0]) || 1;
        this.config.MINOR = parseInt(versionParts[1]) || 0;
        this.config.PATCH = parseInt(versionParts[2]) || 0;
        
        // 生成版本字符串
        this.config.VERSION_STRING = this.config.VERSION;
        
        // 生成完整版本标识
        this.config.FULL_VERSION = `v${this.config.VERSION}-${this.config.BUILD_TIME}`;
        
        // 生成查询参数
        this.config.QUERY_PARAM = `?v=${this.config.BUILD_TIME}`;
        
        // 生成文件路径后缀
        this.config.FILE_SUFFIX = `.js?v=${this.config.BUILD_TIME}`;
        
        // 生成构建日期
        const buildTime = this.config.BUILD_TIME;
        this.config.BUILD_DATE = `${buildTime.substring(0, 4)}-${buildTime.substring(4, 6)}-${buildTime.substring(6, 8)}`;
    }

    // 更新构建时间
    updateBuildTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        const buildTime = `${year}${month}${day}${hours}${minutes}${seconds}`;
        const buildDate = `${year}-${month}-${day}`;
        const buildTimeReadable = `${hours}:${minutes}:${seconds}`;
        
        // 更新配置
        this.config.BUILD_TIME = buildTime;
        this.config.BUILD_DATE = buildDate;
        this.config.BUILD_TIME_READABLE = buildTimeReadable;
        this.config.QUERY_PARAM = `?v=${buildTime}`;
        this.config.FILE_SUFFIX = `.js?v=${buildTime}`;
        this.config.FULL_VERSION = `v${this.config.VERSION}-${buildTime}`;
        
        return buildTime;
    }

    // 更新版本号
    updateVersion(major, minor, patch) {
        if (major !== undefined) this.config.MAJOR = major;
        if (minor !== undefined) this.config.MINOR = minor;
        if (patch !== undefined) this.config.PATCH = patch;
        
        this.config.VERSION = `${this.config.MAJOR}.${this.config.MINOR}.${this.config.PATCH}`;
        this.config.VERSION_STRING = this.config.VERSION;
        this.config.FULL_VERSION = `v${this.config.VERSION}-${this.config.BUILD_TIME}`;
        this.config.DESCRIPTION = `FitChallenge管理员系统v${this.config.VERSION} - 完整功能版`;
    }

    // 获取当前版本信息
    getVersionInfo() {
        return {
            version: this.config.VERSION,
            fullVersion: this.config.FULL_VERSION,
            buildTime: this.config.BUILD_TIME,
            buildDate: this.config.BUILD_DATE,
            buildTimeReadable: this.config.BUILD_TIME_READABLE,
            description: this.config.DESCRIPTION,
            queryParam: this.config.QUERY_PARAM,
            fileSuffix: this.config.FILE_SUFFIX
        };
    }

    // 生成文件路径
    getFilePath(basePath) {
        return `${basePath}${this.config.FILE_SUFFIX}`;
    }

    // 生成导入路径
    getImportPath(basePath) {
        return `${basePath}${this.config.QUERY_PARAM}`;
    }

    // 获取版本查询参数
    getVersionQuery() {
        return this.config.QUERY_PARAM;
    }

    // 添加更新日志条目
    addChangelogEntry(entry) {
        this.config.CHANGELOG.unshift(`[${this.config.BUILD_DATE}] ${entry}`);
        // 保持最近20条记录
        if (this.config.CHANGELOG.length > 20) {
            this.config.CHANGELOG = this.config.CHANGELOG.slice(0, 20);
        }
    }

    // 显示版本信息
    displayVersionInfo() {
        console.log('📦 FitChallenge 管理员系统版本信息');
        console.log(`   版本: ${this.config.VERSION}`);
        console.log(`   完整版本: ${this.config.FULL_VERSION}`);
        console.log(`   构建时间: ${this.config.BUILD_DATE} ${this.config.BUILD_TIME_READABLE}`);
        console.log(`   描述: ${this.config.DESCRIPTION}`);
        console.log(`   查询参数: ${this.config.QUERY_PARAM}`);
        console.log(`   文件后缀: ${this.config.FILE_SUFFIX}`);
        console.log('📝 最近更新');
        this.config.CHANGELOG.slice(0, 5).forEach((entry, index) => {
            console.log(`   ${index + 1}. ${entry}`);
        });
    }
}

// 创建全局实例
const versionUpdater = new VersionUpdater();

// 导出实例
export default versionUpdater;