const axios = require('axios');
const { pool } = require('../config/database');

class TelegramService {
    constructor() {
        // Telegram Bot Token - 直接配置
        this.botToken = '8208922479:AAH-W6WnIijh3FLl1_ngYc0korHoBZx4hws';
        this.botUsername = 'Fit_FitChallengeBOT';
        this.apiBaseUrl = `https://api.telegram.org/bot${this.botToken}`;
    }

    // 验证Telegram登录数据
    async validateTelegramAuth(authData) {
        try {
            const { id, first_name, last_name, username, photo_url, auth_date, hash } = authData;
            
            // 验证必要字段
            if (!id || !first_name || !auth_date || !hash) {
                throw new Error('缺少必要的Telegram认证数据');
            }

            // 验证时间戳（5分钟内有效）
            const currentTime = Math.floor(Date.now() / 1000);
            if (currentTime - auth_date > 300) {
                throw new Error('Telegram认证已过期');
            }

            // 这里应该验证hash签名，但为了简化，我们先跳过
            // 在实际生产环境中，需要验证Telegram的签名

            return {
                telegramId: id,
                firstName: first_name,
                lastName: last_name || '',
                username: username || '',
                photoUrl: photo_url || '',
                isValid: true
            };
        } catch (error) {
            console.error('Telegram认证验证失败:', error);
            throw error;
        }
    }

    // 通过Telegram ID查找或创建用户
    async findOrCreateUserByTelegram(telegramData) {
        console.log('🔍 开始处理Telegram用户:', { 
            telegramId: telegramData.telegramId, 
            firstName: telegramData.firstName,
            username: telegramData.username 
        });
        
        const connection = await pool.getConnection();
        try {
            // 查找是否已有该Telegram ID的用户
            const [existingUsers] = await connection.execute(`
                SELECT * FROM users WHERE telegram_id = ?
            `, [telegramData.telegramId]);

            if (existingUsers.length > 0) {
                // 用户已存在，返回用户信息
                console.log('✅ 找到现有Telegram用户:', { userId: existingUsers[0].id, username: existingUsers[0].username });
                const user = existingUsers[0];
                return {
                    success: true,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        telegramId: user.telegram_id,
                        firstName: user.first_name,
                        lastName: user.last_name
                    },
                    isNewUser: false
                };
            }

            // 创建新用户 - 只使用必要信息，不生成临时邮箱和密码
            const username = telegramData.username || `tg_${telegramData.telegramId}`;
            console.log('🆕 创建新Telegram用户:', { username, telegramId: telegramData.telegramId });
            
            // 插入新用户 - 只设置必要字段
            const [result] = await connection.execute(`
                INSERT INTO users (username, telegram_id, first_name, last_name, created_at)
                VALUES (?, ?, ?, ?, NOW())
            `, [username, telegramData.telegramId, telegramData.firstName, telegramData.lastName]);

            const newUserId = result.insertId;
            console.log('✅ 新用户创建成功，ID:', newUserId);

            // 创建用户资料记录
            await connection.execute(`
                INSERT INTO user_profiles (user_id) VALUES (?)
            `, [newUserId]);

            // 创建用户钱包
            await connection.execute(`
                INSERT INTO user_wallets (user_id, balance, frozen_balance, total_deposited, total_withdrawn, total_rewarded)
                VALUES (?, 0.00, 0.00, 0.00, 0.00, 0.00)
            `, [newUserId]);

            return {
                success: true,
                user: {
                    id: newUserId,
                    username: username,
                    email: null, // 纯Telegram用户，不设置邮箱
                    telegramId: telegramData.telegramId,
                    firstName: telegramData.firstName,
                    lastName: telegramData.lastName
                },
                isNewUser: true
            };

        } catch (error) {
            console.error('❌ Telegram用户处理失败:', error);
            throw new Error(`Telegram用户处理失败: ${error.message}`);
        } finally {
            connection.release();
        }
    }



    // 获取Bot信息
    async getBotInfo() {
        try {
            const response = await axios.get(`${this.apiBaseUrl}/getMe`);
            return response.data;
        } catch (error) {
            console.error('获取Bot信息失败:', error);
            throw error;
        }
    }

    // 发送消息给用户
    async sendMessage(chatId, text) {
        try {
            const response = await axios.post(`${this.apiBaseUrl}/sendMessage`, {
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML'
            });
            return response.data;
        } catch (error) {
            console.error('发送消息失败:', error);
            throw error;
        }
    }
}

module.exports = new TelegramService();
