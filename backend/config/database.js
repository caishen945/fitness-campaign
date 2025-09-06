// 数据库配置文件 - 重构版本
const mysql = require('mysql2');

// 数据库连接配置
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'fitchallenge123',
    database: process.env.DB_NAME || 'fitchallenge',
    waitForConnections: true,
    connectionLimit: 20,  // 增加连接池大小
    queueLimit: 10,       // 限制等待队列
    charset: 'utf8mb4'
};

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);

// 创建Promise版本的连接池
const promisePool = pool.promise();

// 数据库连接错误处理
pool.on('error', (err) => {
    console.error('❌ 数据库连接池错误:', {
        code: err.code,
        errno: err.errno,
        message: err.message
    });
});

// 获取数据库连接
const getConnection = async () => {
    try {
        const connection = await promisePool.getConnection();
        return connection;
    } catch (err) {
        console.error('❌ 获取数据库连接失败:', err);
        throw err;
    }
};

// 执行查询
const query = async (sql, params = []) => {
    try {
        const [rows] = await promisePool.execute(sql, params);
        return rows;
    } catch (err) {
        console.error('❌ 查询执行失败:', err);
        throw err;
    }
};

// 执行事务
const transaction = async (callback) => {
    const connection = await getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// 测试数据库连接
const testConnection = async () => {
    try {
        const result = await query('SELECT 1 as test');
        console.log('✅ 数据库连接测试成功');
        return true;
    } catch (error) {
        console.error('❌ 数据库连接测试失败:', error);
        return false;
    }
};

module.exports = {
    pool: promisePool,
    getConnection,
    query,
    transaction,
    testConnection
};