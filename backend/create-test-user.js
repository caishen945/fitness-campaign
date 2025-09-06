const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createTestUser() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'fitchallenge123',
        database: 'fitchallenge'
    });

    try {
        // 检查测试用户是否已存在
        const [existing] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            ['test@example.com']
        );

        if (existing.length > 0) {
            console.log('测试用户已存在');
            return;
        }

        // 创建测试用户
        const password = '123456';
        const passwordHash = bcrypt.hashSync(password, 10);

        await connection.execute(
            'INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, NOW())',
            ['testuser', 'test@example.com', passwordHash]
        );

        console.log('✅ 测试用户创建成功！');
        console.log('邮箱: test@example.com');
        console.log('密码: 123456');
    } catch (error) {
        console.error('❌ 创建测试用户失败:', error);
    } finally {
        await connection.end();
    }
}

createTestUser();
