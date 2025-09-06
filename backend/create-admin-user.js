const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'fitchallenge123',
        database: 'fitchallenge'
    });

    try {
        // 检查管理员用户是否已存在
        const [existing] = await connection.execute(
            'SELECT * FROM admin_users WHERE username = ?',
            ['admin']
        );

        if (existing.length > 0) {
            console.log('管理员用户已存在');
            return;
        }

        // 创建管理员用户
        const password = 'admin123';
        const passwordHash = bcrypt.hashSync(password, 10);

        await connection.execute(
            'INSERT INTO admin_users (username, password_hash, role, permissions, is_active) VALUES (?, ?, ?, ?, ?)',
            ['admin', passwordHash, 'admin', JSON.stringify(['all']), 1]
        );

        console.log('✅ 管理员用户创建成功！');
        console.log('用户名: admin');
        console.log('密码: admin123');
    } catch (error) {
        console.error('❌ 创建管理员用户失败:', error);
    } finally {
        await connection.end();
    }
}

createAdminUser();
