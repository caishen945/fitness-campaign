// 数据库配置文件
const mysql = require('mysql2');

// 创建数据库连接池
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'fitchallenge123', // 使用修复后的root用户密码
    database: 'fitchallenge',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
});

// 数据库连接错误处理
pool.on('error', (err) => {
    const errorInfo = {
        code: err.code,
        errno: err.errno,
        sqlState: err.sqlState,
        sqlMessage: err.sqlMessage,
        message: err.message
    };
    
    console.error('❌ 数据库连接池错误:', errorInfo);
    
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('🔄 数据库连接丢失，尝试重连...');
    } else if (err.code === 'ER_CON_COUNT_ERROR') {
        console.log('🔄 数据库连接数过多，等待可用连接...');
    } else if (err.code === 'ECONNREFUSED') {
        console.log('❌ 数据库服务拒绝连接，请检查MySQL是否启动');
    } else if (err.code === 'ETIMEDOUT') {
        console.log('❌ 数据库连接超时，请检查网络连接');
    } else if (err.code === 'ENOTFOUND') {
        console.log('❌ 数据库主机未找到，请检查主机配置');
    }
    
    // 记录到错误日志文件
    try {
        const fs = require('fs');
        const path = require('path');
        const logDir = path.join(__dirname, '..', 'logs');
        const errorLogFile = path.join(logDir, 'database-error.log');
        
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [ERROR] 数据库连接池错误: ${JSON.stringify(errorInfo)}\n`;
        fs.appendFileSync(errorLogFile, logEntry);
    } catch (logError) {
        console.error('写入数据库错误日志失败:', logError);
    }
});

// 获取数据库连接
const getConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ 数据库连接获取成功');
        return connection;
    } catch (err) {
        console.error('❌ 获取数据库连接失败:', err);
        throw err;
    }
};

// 测试数据库连接
const testConnection = async () => {
    try {
        const connection = await getConnection();
        console.log('✅ 数据库连接测试成功');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ 数据库连接测试失败:', error);
        return false;
    }
};

module.exports = {
    pool: pool.promise(),
    getConnection,
    testConnection
};