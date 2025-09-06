/**
 * WebSocket服务器
 * 提供VIP挑战系统的实时进度更新和推送通知功能
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

class WebSocketServer {
    constructor(server, options = {}) {
        this.server = server;
        this.options = {
            path: '/ws',
            cors: {
                origin: ["http://localhost:8080", "http://localhost:8081", "http://localhost:8082"],
                methods: ["GET", "POST"]
            },
            ...options
        };
        
        // 用户会话管理
        this.userSessions = new Map(); // userId -> socket
        this.socketUsers = new Map();   // socketId -> userId
        
        // 创建Socket.IO服务器
        this.io = new Server(server, this.options);
        
        // 初始化
        this.initialize();
    }
    
    initialize() {
        logger.info('🔌 WebSocket服务器初始化开始...');
        
        // 连接处理
        this.io.on('connection', (socket) => {
            this.handleConnection(socket);
        });
        
        // 错误处理
        this.io.on('error', (error) => {
            logger.error('❌ WebSocket服务器错误:', error);
        });
        
        logger.info('✅ WebSocket服务器初始化完成');
    }
    
    handleConnection(socket) {
        logger.info(`🔌 新的WebSocket连接: ${socket.id}`);
        
        // 认证处理
        socket.on('authenticate', async (data) => {
            try {
                const { token } = data;
                if (!token) {
                    socket.emit('auth_error', { message: '访问令牌缺失' });
                    return;
                }
                
                // 验证JWT token
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                const userId = decoded.id;
                
                // 保存用户会话
                this.userSessions.set(userId, socket);
                this.socketUsers.set(socket.id, userId);
                
                // 加入用户房间
                socket.join(`user:${userId}`);
                
                logger.info(`✅ 用户 ${userId} 认证成功，Socket ID: ${socket.id}`);
                socket.emit('authenticated', { 
                    message: '认证成功',
                    userId: userId,
                    timestamp: new Date().toISOString()
                });
                
                // 发送用户状态
                this.sendUserStatus(userId);
                
            } catch (error) {
                logger.error(`❌ 用户认证失败: ${error.message}`);
                socket.emit('auth_error', { 
                    message: '认证失败',
                    error: error.message 
                });
            }
        });
        
        // 进度更新
        socket.on('progress_update', (data) => {
            try {
                const userId = this.socketUsers.get(socket.id);
                if (!userId) {
                    socket.emit('error', { message: '用户未认证' });
                    return;
                }
                
                logger.info(`📊 用户 ${userId} 进度更新:`, data);
                
                // 广播进度更新给相关用户
                this.broadcastProgressUpdate(userId, data);
                
                // 确认接收
                socket.emit('progress_received', { 
                    message: '进度更新已接收',
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                logger.error(`❌ 进度更新处理失败: ${error.message}`);
                socket.emit('error', { 
                    message: '进度更新处理失败',
                    error: error.message 
                });
            }
        });
        
        // 挑战状态更新
        socket.on('challenge_update', (data) => {
            try {
                const userId = this.socketUsers.get(socket.id);
                if (!userId) {
                    socket.emit('error', { message: '用户未认证' });
                    return;
                }
                
                logger.info(`🏆 用户 ${userId} 挑战状态更新:`, data);
                
                // 广播挑战状态更新
                this.broadcastChallengeUpdate(userId, data);
                
                // 确认接收
                socket.emit('challenge_received', { 
                    message: '挑战状态更新已接收',
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                logger.error(`❌ 挑战状态更新处理失败: ${error.message}`);
                socket.emit('error', { 
                    message: '挑战状态更新处理失败',
                    error: error.message 
                });
            }
        });
        
        // 断开连接处理
        socket.on('disconnect', () => {
            const userId = this.socketUsers.get(socket.id);
            if (userId) {
                logger.info(`🔌 用户 ${userId} 断开连接: ${socket.id}`);
                
                // 清理会话
                this.userSessions.delete(userId);
                this.socketUsers.delete(socket.id);
                
                // 广播用户离线状态
                this.broadcastUserStatus(userId, 'offline');
            } else {
                logger.info(`🔌 未认证用户断开连接: ${socket.id}`);
            }
        });
        
        // 心跳检测
        socket.on('ping', () => {
            socket.emit('pong', { timestamp: new Date().toISOString() });
        });
        
        // 发送连接成功消息
        socket.emit('connected', { 
            message: 'WebSocket连接成功',
            socketId: socket.id,
            timestamp: new Date().toISOString()
        });
    }
    
    // 发送用户状态
    sendUserStatus(userId) {
        try {
            const socket = this.userSessions.get(userId);
            if (socket) {
                socket.emit('user_status', {
                    userId: userId,
                    status: 'online',
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            logger.error(`❌ 发送用户状态失败: ${error.message}`);
        }
    }
    
    // 广播进度更新
    broadcastProgressUpdate(userId, data) {
        try {
            const socket = this.userSessions.get(userId);
            if (socket) {
                socket.emit('progress_broadcast', {
                    userId: userId,
                    progress: data,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            logger.error(`❌ 广播进度更新失败: ${error.message}`);
        }
    }
    
    // 广播挑战状态更新
    broadcastChallengeUpdate(userId, data) {
        try {
            const socket = this.userSessions.get(userId);
            if (socket) {
                socket.emit('challenge_broadcast', {
                    userId: userId,
                    challenge: data,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            logger.error(`❌ 广播挑战状态更新失败: ${error.message}`);
        }
    }
    
    // 广播用户状态
    broadcastUserStatus(userId, status) {
        try {
            this.io.emit('user_status_change', {
                userId: userId,
                status: status,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error(`❌ 广播用户状态失败: ${error.message}`);
        }
    }
    
    // 发送通知给特定用户
    sendNotification(userId, notification) {
        try {
            const socket = this.userSessions.get(userId);
            if (socket) {
                socket.emit('notification', {
                    ...notification,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            logger.error(`❌ 发送通知失败: ${error.message}`);
        }
    }
    
    // 广播系统通知
    broadcastSystemNotification(notification) {
        try {
            this.io.emit('system_notification', {
                ...notification,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error(`❌ 广播系统通知失败: ${error.message}`);
        }
    }
    
    // 获取在线用户数量
    getOnlineUserCount() {
        return this.userSessions.size;
    }
    
    // 获取在线用户列表
    getOnlineUsers() {
        return Array.from(this.userSessions.keys());
    }
    
    // 关闭服务器
    close() {
        logger.info('🛑 正在关闭WebSocket服务器...');
        this.io.close(() => {
            logger.info('✅ WebSocket服务器已关闭');
        });
    }
}

module.exports = WebSocketServer;
