// 检查数据库表结构
const mysql = require('mysql2/promise');

async function checkDatabase() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'fitchallenge123',
        database: 'fitchallenge'
    });

    try {
        console.log('🔍 检查数据库表结构...\n');

        // 检查system_configs表
        try {
            const [rows] = await connection.execute('DESCRIBE system_configs');
            console.log('✅ system_configs表存在:');
            console.table(rows);
        } catch (error) {
            console.log('❌ system_configs表不存在:', error.message);
            
            // 创建system_configs表
            console.log('🔧 创建system_configs表...');
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS system_configs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    config_key VARCHAR(100) NOT NULL UNIQUE,
                    config_value TEXT,
                    description VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_config_key (config_key)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            console.log('✅ system_configs表创建成功');
        }

        // 检查system_logs表
        try {
            const [rows] = await connection.execute('DESCRIBE system_logs');
            console.log('\n✅ system_logs表存在:');
            console.table(rows);
        } catch (error) {
            console.log('\n❌ system_logs表不存在:', error.message);
            
            // 创建system_logs表
            console.log('🔧 创建system_logs表...');
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS system_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    action VARCHAR(100) NOT NULL,
                    details JSON,
                    user_id INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_action (action),
                    INDEX idx_user_id (user_id),
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            console.log('✅ system_logs表创建成功');
        }

        // 检查admin_users表
        try {
            const [rows] = await connection.execute('DESCRIBE admin_users');
            console.log('\n✅ admin_users表存在:');
            console.table(rows);
        } catch (error) {
            console.log('\n❌ admin_users表不存在:', error.message);
        }

        console.log('\n🎉 数据库检查完成！');

    } catch (error) {
        console.error('❌ 数据库检查失败:', error);
    } finally {
        await connection.end();
    }
}

checkDatabase();
