// MySQL兼容的User模型
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

class UserMySQL {
    // 创建邮箱+用户名用户
    static async create(username, email, password) {
        try {
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            const [result] = await pool.execute(
                'INSERT INTO users (username, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
                [username, email, passwordHash]
            );

            return await this.findById(result.insertId);
        } catch (error) {
            console.error('创建用户失败:', error);
            throw error;
        }
    }
    static async findByEmail(email) {
        try {
            console.log('UserMySQL.findByEmail 被调用，email:', email);
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );
            console.log('查询结果:', rows.length > 0 ? '找到用户' : '未找到用户');
            if (rows.length === 0) {
                return null;
            }
            return this.mapUserData(rows[0]);
        } catch (error) {
            console.error('查询用户失败:', error);
            throw error;
        }
    }

    // 根据Telegram ID查找用户
    static async findByTelegramId(telegramId) {
        try {
            console.log('UserMySQL.findByTelegramId 被调用，telegramId:', telegramId);
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE telegram_id = ?',
                [telegramId]
            );
            if (rows.length === 0) {
                return null;
            }
            return this.mapUserData(rows[0]);
        } catch (error) {
            console.error('查询用户失败:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            console.log('UserMySQL.findById 被调用，id:', id);
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE id = ?',
                [id]
            );
            if (rows.length === 0) {
                return null;
            }
            return this.mapUserData(rows[0]);
        } catch (error) {
            console.error('查询用户失败:', error);
            throw error;
        }
    }

    // 创建邮箱用户
    static async createEmailUser(email, password) {
        try {
            // 生成密码哈希
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // 插入用户
            const [result] = await pool.execute(
                'INSERT INTO users (email, password_hash, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
                [email, passwordHash]
            );

            // 返回新创建的用户
            return await this.findById(result.insertId);
        } catch (error) {
            console.error('创建邮箱用户失败:', error);
            throw error;
        }
    }

    // 创建或更新Telegram用户
    static async createOrUpdateTelegramUser(telegramData) {
        try {
            const { id: telegramId, first_name, last_name, username: telegramUsername } = telegramData;
            
            // 先检查用户是否已存在
            let user = await this.findByTelegramId(telegramId);
            
            if (user) {
                // 更新现有用户的Telegram信息
                await pool.execute(
                    'UPDATE users SET first_name = ?, last_name = ?, updated_at = NOW() WHERE telegram_id = ?',
                    [first_name, last_name, telegramId]
                );
                return await this.findById(user.id);
            } else {
                // 创建新的Telegram用户
                const [result] = await pool.execute(
                    'INSERT INTO users (telegram_id, first_name, last_name, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
                    [telegramId, first_name, last_name]
                );
                return await this.findById(result.insertId);
            }
        } catch (error) {
            console.error('创建或更新Telegram用户失败:', error);
            throw error;
        }
    }

    static async updateLastLogin(userId) {
        try {
            await pool.execute(
                'UPDATE users SET last_login = NOW() WHERE id = ?',
                [userId]
            );
            return await this.findById(userId);
        } catch (error) {
            console.error('更新最后登录时间失败:', error);
            throw error;
        }
    }

    static async updateWallet(userId, walletAddress) {
        try {
            await pool.execute(
                'UPDATE users SET trc20_wallet = ? WHERE id = ?',
                [walletAddress, userId]
            );
            return await this.findById(userId);
        } catch (error) {
            console.error('更新钱包地址失败:', error);
            throw error;
        }
    }

    // 辅助方法：将数据库行映射为用户对象
    static mapUserData(row) {
        const user = {
            id: row.id,
            username: row.username,
            email: row.email,
            password_hash: row.password_hash,
            trc20Wallet: row.trc20_wallet,
            isActive: row.is_active === 1,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            lastLogin: row.last_login,
            // Telegram相关字段
            telegramId: row.telegram_id,
            firstName: row.first_name,
            lastName: row.last_name,
            phone: row.phone,
            avatar: row.avatar,
            
            // 添加验证密码的方法
            validatePassword: async function(password) {
                if (!this.password_hash) {
                    console.log('用户没有设置密码，无法验证');
                    return false;
                }
                console.log('验证密码，用户ID:', this.id);
                return await bcrypt.compare(password, this.password_hash);
            },
            
            // 获取显示名称的方法
            getDisplayName: function() {
                if (this.firstName && this.lastName) {
                    return `${this.firstName} ${this.lastName}`;
                } else if (this.firstName) {
                    return this.firstName;
                } else if (this.email) {
                    return this.email.split('@')[0];
                } else {
                    return `用户${this.id}`;
                }
            },
            
            // 添加toJSON方法
            toJSON: function() {
                return {
                    id: this.id,
                    username: this.username,
                    email: this.email,
                    trc20Wallet: this.trc20Wallet,
                    isActive: this.isActive,
                    createdAt: this.createdAt,
                    updatedAt: this.updatedAt,
                    lastLogin: this.lastLogin,
                    telegramId: this.telegramId,
                    firstName: this.firstName,
                    lastName: this.lastName,
                    phone: this.phone,
                    avatar: this.avatar,
                    displayName: this.getDisplayName()
                };
            }
        };
        
        return user;
    }
}

module.exports = UserMySQL;
