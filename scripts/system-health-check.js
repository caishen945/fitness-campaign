#!/usr/bin/env node

/**
 * FitChallenge 系统健康检查脚本
 * 配合影响分析框架使用，用于修改前后的系统状态验证
 */

import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const CONFIG = {
    // 服务端点
    services: {
        backend: 'http://localhost:3000',
        frontend: 'http://localhost:8080',
        admin: 'http://localhost:8081'
    },
    
    // 数据库配置
    database: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'fitchallenge123',
        database: process.env.DB_NAME || 'fitchallenge'
    },
    
    // 健康检查超时
    timeout: 5000,
    
    // 关键API端点
    criticalAPIs: [
        '/api/health',
        '/api/auth/verify',
        '/api/admin/auth/verify'
    ]
};

class SystemHealthChecker {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            overall: 'unknown',
            services: {},
            database: {},
            apis: {},
            warnings: [],
            errors: []
        };
    }

    // 主要检查流程
    async runHealthCheck() {
        console.log('🏥 开始系统健康检查...\n');
        
        try {
            // 并行执行所有检查
            await Promise.all([
                this.checkServices(),
                this.checkDatabase(),
                this.checkCriticalAPIs(),
                this.checkSystemResources()
            ]);

            // 计算整体健康状态
            this.calculateOverallHealth();
            
            // 输出结果
            this.printResults();
            this.saveResults();
            
            return this.results;
            
        } catch (error) {
            console.error('❌ 健康检查执行失败:', error.message);
            this.results.overall = 'critical';
            this.results.errors.push(`检查执行失败: ${error.message}`);
            return this.results;
        }
    }

    // 检查各服务可用性
    async checkServices() {
        console.log('🔍 检查服务可用性...');
        
        for (const [name, url] of Object.entries(CONFIG.services)) {
            try {
                const startTime = Date.now();
                const response = await this.makeRequest(url, { timeout: CONFIG.timeout });
                const responseTime = Date.now() - startTime;
                
                this.results.services[name] = {
                    status: response.statusCode >= 200 && response.statusCode < 400 ? 'healthy' : 'unhealthy',
                    statusCode: response.statusCode,
                    responseTime: responseTime,
                    url: url
                };
                
                if (responseTime > 2000) {
                    this.results.warnings.push(`${name} 服务响应时间较慢: ${responseTime}ms`);
                }
                
                console.log(`  ✅ ${name}: ${response.statusCode} (${responseTime}ms)`);
                
            } catch (error) {
                this.results.services[name] = {
                    status: 'error',
                    error: error.message,
                    url: url
                };
                this.results.errors.push(`${name} 服务不可用: ${error.message}`);
                console.log(`  ❌ ${name}: ${error.message}`);
            }
        }
    }

    // 检查数据库连接和关键表
    async checkDatabase() {
        console.log('🗄️  检查数据库状态...');
        
        try {
            // 使用mysql命令行工具检查连接
            const startTime = Date.now();
            const result = await this.executeCommand('mysql', [
                '-u', CONFIG.database.user,
                '-p' + CONFIG.database.password,
                '-h', CONFIG.database.host,
                '-D', CONFIG.database.database,
                '-e', 'SELECT 1 as connected'
            ]);
            const connectionTime = Date.now() - startTime;
            
            if (result.success) {
                this.results.database.connection = {
                    status: 'healthy',
                    responseTime: connectionTime
                };
                
                // 检查关键表
                const tables = ['users', 'user_wallets', 'wallet_transactions', 'vip_challenges'];
                const tableStatus = {};
                
                for (const table of tables) {
                    try {
                        const tableResult = await this.executeCommand('mysql', [
                            '-u', CONFIG.database.user,
                            '-p' + CONFIG.database.password,
                            '-h', CONFIG.database.host,
                            '-D', CONFIG.database.database,
                            '-e', `SELECT COUNT(*) as count FROM ${table}`
                        ]);
                        
                        if (tableResult.success) {
                            // 简单解析输出中的数字
                            const countMatch = tableResult.output.match(/\d+/);
                            const count = countMatch ? parseInt(countMatch[0]) : 0;
                            
                            tableStatus[table] = {
                                status: 'healthy',
                                recordCount: count
                            };
                            console.log(`  ✅ 表 ${table}: ${count} 条记录`);
                        } else {
                            throw new Error(tableResult.error);
                        }
                    } catch (error) {
                        tableStatus[table] = {
                            status: 'error',
                            error: error.message
                        };
                        this.results.errors.push(`表 ${table} 检查失败: ${error.message}`);
                        console.log(`  ❌ 表 ${table}: ${error.message}`);
                    }
                }
                
                this.results.database.tables = tableStatus;
                
                // 检查数据库性能
                if (connectionTime > 1000) {
                    this.results.warnings.push(`数据库连接时间较慢: ${connectionTime}ms`);
                }
                
                console.log(`  ✅ 数据库连接正常 (${connectionTime}ms)`);
            } else {
                throw new Error(result.error);
            }
            
        } catch (error) {
            this.results.database.connection = {
                status: 'error',
                error: error.message
            };
            this.results.errors.push(`数据库连接失败: ${error.message}`);
            console.log(`  ❌ 数据库连接失败: ${error.message}`);
        }
    }

    // 检查关键API端点
    async checkCriticalAPIs() {
        console.log('🔌 检查关键API端点...');
        
        const baseUrl = CONFIG.services.backend;
        
        for (const endpoint of CONFIG.criticalAPIs) {
            try {
                const startTime = Date.now();
                const response = await this.makeRequest(`${baseUrl}${endpoint}`, { 
                    timeout: CONFIG.timeout 
                });
                const responseTime = Date.now() - startTime;
                
                this.results.apis[endpoint] = {
                    status: response.statusCode >= 200 && response.statusCode < 500 ? 'healthy' : 'unhealthy',
                    statusCode: response.statusCode,
                    responseTime: responseTime
                };
                
                console.log(`  ✅ ${endpoint}: ${response.statusCode} (${responseTime}ms)`);
                
            } catch (error) {
                this.results.apis[endpoint] = {
                    status: 'error',
                    error: error.message
                };
                
                // 某些API端点可能需要认证，404比连接失败要好
                if (error.message.includes('404')) {
                    this.results.warnings.push(`API端点 ${endpoint} 返回404，可能需要认证`);
                    console.log(`  ⚠️  ${endpoint}: 需要认证或不存在`);
                } else {
                    this.results.errors.push(`API端点 ${endpoint} 检查失败: ${error.message}`);
                    console.log(`  ❌ ${endpoint}: ${error.message}`);
                }
            }
        }
    }

    // 检查系统资源
    async checkSystemResources() {
        console.log('💻 检查系统资源...');
        
        try {
            // 检查内存使用
            const memoryUsage = process.memoryUsage();
            const memoryMB = {
                rss: Math.round(memoryUsage.rss / 1024 / 1024),
                heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                external: Math.round(memoryUsage.external / 1024 / 1024)
            };
            
            this.results.system = {
                memory: memoryMB,
                uptime: Math.round(process.uptime()),
                nodeVersion: process.version,
                platform: process.platform
            };
            
            // 检查日志目录
            const logDir = path.join(__dirname, '../backend/logs');
            if (fs.existsSync(logDir)) {
                const logFiles = fs.readdirSync(logDir);
                this.results.system.logFiles = logFiles.length;
                console.log(`  ✅ 日志目录正常 (${logFiles.length} 个文件)`);
            } else {
                this.results.warnings.push('日志目录不存在');
                console.log('  ⚠️  日志目录不存在');
            }
            
            console.log(`  ✅ 内存使用: ${memoryMB.heapUsed}MB / ${memoryMB.heapTotal}MB`);
            console.log(`  ✅ 运行时间: ${Math.round(process.uptime() / 60)} 分钟`);
            
        } catch (error) {
            this.results.warnings.push(`系统资源检查部分失败: ${error.message}`);
            console.log(`  ⚠️  系统资源检查失败: ${error.message}`);
        }
    }

    // 计算整体健康状态
    calculateOverallHealth() {
        const errorCount = this.results.errors.length;
        const warningCount = this.results.warnings.length;
        
        // 检查关键服务状态
        const backendHealthy = this.results.services.backend?.status === 'healthy';
        const dbHealthy = this.results.database.connection?.status === 'healthy';
        
        if (errorCount > 0 || !backendHealthy || !dbHealthy) {
            this.results.overall = 'critical';
        } else if (warningCount > 2) {
            this.results.overall = 'warning';
        } else if (warningCount > 0) {
            this.results.overall = 'caution';
        } else {
            this.results.overall = 'healthy';
        }
    }

    // 打印结果
    printResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 健康检查结果汇总');
        console.log('='.repeat(60));
        
        // 整体状态
        const statusEmoji = {
            'healthy': '🟢',
            'caution': '🟡',
            'warning': '🟠',
            'critical': '🔴'
        };
        
        console.log(`\n整体状态: ${statusEmoji[this.results.overall]} ${this.results.overall.toUpperCase()}`);
        
        // 详细统计
        const serviceCount = Object.keys(this.results.services).length;
        const healthyServices = Object.values(this.results.services).filter(s => s.status === 'healthy').length;
        
        console.log(`\n📈 统计信息:`);
        console.log(`  服务状态: ${healthyServices}/${serviceCount} 健康`);
        console.log(`  数据库: ${this.results.database.connection?.status || 'unknown'}`);
        console.log(`  警告数量: ${this.results.warnings.length}`);
        console.log(`  错误数量: ${this.results.errors.length}`);
        
        // 警告信息
        if (this.results.warnings.length > 0) {
            console.log(`\n⚠️  警告信息:`);
            this.results.warnings.forEach(warning => {
                console.log(`  - ${warning}`);
            });
        }
        
        // 错误信息
        if (this.results.errors.length > 0) {
            console.log(`\n❌ 错误信息:`);
            this.results.errors.forEach(error => {
                console.log(`  - ${error}`);
            });
        }
        
        // 建议
        console.log(`\n💡 建议:`);
        if (this.results.overall === 'healthy') {
            console.log(`  - 系统状态良好，可以安全进行修改操作`);
        } else if (this.results.overall === 'caution') {
            console.log(`  - 系统基本正常，建议先解决警告问题`);
        } else if (this.results.overall === 'warning') {
            console.log(`  - 系统存在多个问题，建议修复后再进行重要修改`);
        } else {
            console.log(`  - 系统存在严重问题，请立即修复`);
            console.log(`  - 不建议在当前状态下进行任何修改操作`);
        }
        
        console.log('\n' + '='.repeat(60));
    }

    // 保存结果到文件
    saveResults() {
        const outputDir = path.join(__dirname, '../.tasks');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `health-check-${timestamp}.json`;
        const filepath = path.join(outputDir, filename);
        
        try {
            fs.writeFileSync(filepath, JSON.stringify(this.results, null, 2));
            console.log(`📁 结果已保存: ${filename}`);
        } catch (error) {
            console.log(`⚠️  保存结果失败: ${error.message}`);
        }
    }

    // HTTP请求工具
    makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const isHttps = urlObj.protocol === 'https:';
            const client = isHttps ? https : http;
            
            const req = client.request({
                hostname: urlObj.hostname,
                port: urlObj.port,
                path: urlObj.pathname + urlObj.search,
                method: 'GET',
                timeout: options.timeout || 5000
            }, (res) => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers
                });
            });
            
            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('请求超时'));
            });
            
            req.end();
        });
    }

    // 执行命令行工具
    executeCommand(command, args = []) {
        return new Promise((resolve) => {
            try {
                const process = spawn(command, args, { 
                    stdio: 'pipe',
                    timeout: 10000
                });
                
                let output = '';
                let errorOutput = '';
                
                process.stdout.on('data', (data) => {
                    output += data.toString();
                });
                
                process.stderr.on('data', (data) => {
                    errorOutput += data.toString();
                });
                
                process.on('close', (code) => {
                    resolve({
                        success: code === 0,
                        output: output,
                        error: errorOutput || `命令退出码: ${code}`,
                        code: code
                    });
                });
                
                process.on('error', (error) => {
                    resolve({
                        success: false,
                        output: '',
                        error: error.message,
                        code: -1
                    });
                });
            } catch (error) {
                resolve({
                    success: false,
                    output: '',
                    error: error.message,
                    code: -1
                });
            }
        });
    }
}

// 命令行执行
if (import.meta.url.startsWith('file:') && process.argv[1] && import.meta.url.includes(process.argv[1].replace(/\\/g, '/'))) {
    console.log('🚀 启动 FitChallenge 系统健康检查...\n');
    
    const checker = new SystemHealthChecker();
    
    checker.runHealthCheck()
        .then(results => {
            // 根据健康状态设置退出码
            const exitCode = results.overall === 'critical' ? 1 : 0;
            process.exit(exitCode);
        })
        .catch(error => {
            console.error('❌ 健康检查失败:', error);
            process.exit(1);
        });
}

export default SystemHealthChecker;
