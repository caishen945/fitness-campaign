@echo off
chcp 65001 >nul
echo 🔍 FitChallenge 数据库状态检查
echo.

cd /d "%~dp0backend"

echo 📋 正在检查数据库连接...
node -e "
const mysql = require('mysql2/promise');
require('dotenv').config();

async function quickCheck() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'fitchallenge123',
            database: process.env.DB_NAME || 'fitchallenge'
        });
        
        console.log('✅ 数据库连接成功');
        
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(\`📊 数据库包含 \${tables.length} 个表\`);
        
        if (tables.length > 0) {
            console.log('🎉 数据库已存在且包含表结构，无需重新创建！');
        } else {
            console.log('⚠️ 数据库存在但没有表，需要导入表结构');
        }
        
        await connection.end();
        
    } catch (error) {
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('❌ 数据库 fitchallenge 不存在，需要创建');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('❌ 无法连接MySQL服务，请检查MySQL是否启动');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('❌ 数据库连接被拒绝，请检查用户名密码');
        } else {
            console.log('❌ 连接错误:', error.message);
        }
    }
}

quickCheck();
" 2>nul

echo.
echo 💡 如果数据库不存在，可以运行以下命令创建：
echo    mysql -u root -p -e "CREATE DATABASE fitchallenge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo.
echo 💡 如果需要导入表结构，可以运行：
echo    mysql -u root -p fitchallenge ^< database/schema.sql
echo.
pause