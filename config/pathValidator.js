const fs = require('fs');
const path = require('path');
const { PATHS, ALIASES } = require('./paths');

/**
 * 路径验证器
 */
class PathValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.suggestions = [];
    }

    /**
     * 验证所有路径配置
     */
    validateAll() {
        console.log('🔍 开始路径验证...');
        
        this.validateDirectoryStructure();
        this.validateAliases();
        this.validateFileReferences();
        this.validateSymlinks();
        this.validatePermissions();
        
        this.generateValidationReport();
    }

    /**
     * 验证目录结构
     */
    validateDirectoryStructure() {
        console.log('📁 验证目录结构...');
        
        const requiredDirs = [
            PATHS.BACKEND,
            PATHS.FRONTEND,
            PATHS.ADMIN,
            PATHS.DATABASE,
            PATHS.SCRIPTS,
            PATHS.BACKEND_CONFIG,
            PATHS.BACKEND_CONTROLLERS,
            PATHS.BACKEND_SERVICES,
            PATHS.BACKEND_ROUTES,
            PATHS.FRONTEND_PUBLIC,
            PATHS.ADMIN_PUBLIC
        ];

        requiredDirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                this.errors.push(`目录不存在: ${dir}`);
            } else if (!fs.statSync(dir).isDirectory()) {
                this.errors.push(`路径不是目录: ${dir}`);
            }
        });
    }

    /**
     * 验证别名配置
     */
    validateAliases() {
        console.log('🏷️ 验证路径别名...');
        
        for (const [alias, aliasPath] of Object.entries(ALIASES)) {
            if (!fs.existsSync(aliasPath)) {
                this.warnings.push(`别名 ${alias} 指向的路径不存在: ${aliasPath}`);
            }
            
            // 检查别名冲突
            const aliasWithoutAt = alias.substring(1);
            if (aliasWithoutAt.includes('/') || aliasWithoutAt.includes('\\')) {
                this.errors.push(`别名格式错误: ${alias} (不应包含路径分隔符)`);
            }
        }
    }

    /**
     * 验证文件引用
     */
    validateFileReferences() {
        console.log('📄 验证文件引用...');
        
        // 检查关键文件是否存在
        const criticalFiles = [
            path.join(PATHS.BACKEND, 'server.js'),
            path.join(PATHS.BACKEND, 'package.json'),
            path.join(PATHS.FRONTEND_PUBLIC, 'index.html'),
            path.join(PATHS.ADMIN_PUBLIC, 'index.html'),
            path.join(PATHS.DATABASE, 'schema.sql')
        ];

        criticalFiles.forEach(file => {
            if (!fs.existsSync(file)) {
                this.errors.push(`关键文件不存在: ${file}`);
            }
        });
    }

    /**
     * 验证符号链接
     */
    validateSymlinks() {
        console.log('🔗 验证符号链接...');
        
        // 检查是否有不必要的符号链接
        const checkSymlinks = (dir) => {
            if (!fs.existsSync(dir)) return;
            
            const items = fs.readdirSync(dir);
            items.forEach(item => {
                const itemPath = path.join(dir, item);
                try {
                    const stat = fs.statSync(itemPath);
                    if (stat.isSymbolicLink()) {
                        this.warnings.push(`发现符号链接: ${itemPath}`);
                    }
                } catch (error) {
                    // 忽略无法访问的文件
                }
            });
        };

        [PATHS.BACKEND, PATHS.FRONTEND, PATHS.ADMIN].forEach(checkSymlinks);
    }

    /**
     * 验证文件权限
     */
    validatePermissions() {
        console.log('🔐 验证文件权限...');
        
        // 检查关键目录的读写权限
        const checkPermissions = (dir) => {
            if (!fs.existsSync(dir)) return;
            
            try {
                // 测试写权限
                const testFile = path.join(dir, '.permission-test');
                fs.writeFileSync(testFile, 'test');
                fs.unlinkSync(testFile);
            } catch (error) {
                this.warnings.push(`目录权限问题: ${dir} - ${error.message}`);
            }
        };

        [PATHS.BACKEND, PATHS.FRONTEND, PATHS.ADMIN].forEach(checkPermissions);
    }

    /**
     * 生成验证报告
     */
    generateValidationReport() {
        console.log('\n📊 路径验证报告:');
        
        if (this.errors.length === 0 && this.warnings.length === 0) {
            console.log('✅ 所有路径配置正确！');
            return;
        }

        if (this.errors.length > 0) {
            console.log(`\n❌ 错误 (${this.errors.length}):`);
            this.errors.forEach(error => {
                console.log(`  - ${error}`);
            });
        }

        if (this.warnings.length > 0) {
            console.log(`\n⚠️ 警告 (${this.warnings.length}):`);
            this.warnings.forEach(warning => {
                console.log(`  - ${warning}`);
            });
        }

        if (this.suggestions.length > 0) {
            console.log(`\n💡 建议 (${this.suggestions.length}):`);
            this.suggestions.forEach(suggestion => {
                console.log(`  - ${suggestion}`);
            });
        }

        // 保存详细报告
        const report = {
            timestamp: new Date().toISOString(),
            errors: this.errors,
            warnings: this.warnings,
            suggestions: this.suggestions,
            summary: {
                totalErrors: this.errors.length,
                totalWarnings: this.warnings.length,
                totalSuggestions: this.suggestions.length
            }
        };

        const reportPath = path.join(PATHS.ROOT, 'path-validation-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 详细报告已保存到: ${reportPath}`);
    }

    /**
     * 自动修复常见问题
     */
    autoFix() {
        console.log('🔧 开始自动修复...');
        
        let fixedCount = 0;

        // 创建缺失的目录
        const requiredDirs = [
            PATHS.BACKEND_CONFIG,
            PATHS.BACKEND_CONTROLLERS,
            PATHS.BACKEND_SERVICES,
            PATHS.BACKEND_ROUTES,
            PATHS.BACKEND_MIDDLEWARE,
            PATHS.BACKEND_UTILS,
            PATHS.FRONTEND_SRC,
            PATHS.FRONTEND_PAGES,
            PATHS.FRONTEND_SERVICES,
            PATHS.ADMIN_SRC,
            PATHS.ADMIN_PAGES,
            PATHS.ADMIN_SERVICES
        ];

        requiredDirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`✅ 创建目录: ${dir}`);
                fixedCount++;
            }
        });

        console.log(`\n🔧 自动修复完成，修复了 ${fixedCount} 个问题`);
    }
}

module.exports = PathValidator;
