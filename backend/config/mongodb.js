// MongoDB配置文件
const mongoose = require('mongoose');

// MongoDB连接配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitchallenge';

// 连接选项
const connectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0,
    bufferCommands: false
};

// 连接MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_URI, connectOptions);
        console.log('✅ MongoDB连接成功:', conn.connection.host);
        return conn;
    } catch (error) {
        console.error('❌ MongoDB连接失败:', error.message);
        throw error;
    }
};

// 断开连接
const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log('✅ MongoDB连接已断开');
    } catch (error) {
        console.error('❌ MongoDB断开连接失败:', error.message);
    }
};

// 测试连接
const testConnection = async () => {
    try {
        await connectDB();
        console.log('✅ MongoDB连接测试成功');
        return true;
    } catch (error) {
        console.error('❌ MongoDB连接测试失败:', error.message);
        return false;
    }
};

module.exports = {
    connectDB,
    disconnectDB,
    testConnection,
    mongoose
};
