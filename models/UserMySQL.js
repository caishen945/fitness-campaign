// MySQL兼容的User模型
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

class UserMySQL {
    static async findByEmail(email) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
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

    static async findByUsername(username) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE username = ?',
                [username]
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

    static async create(username, email, password) {
        try {
            // 生成密码哈希
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // 插入用户
            const [result] = await pool.execute(
                'INSERT INTO users (username, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
                [username, email, passwordHash]
            );

            // 返回新创建的用户
            return await this.findById(result.insertId);
        } catch (error) {
            console.error('创建用户失败:', error);
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
            
            // 添加验证密码的方法
            validatePassword: async function(password) {
                return await bcrypt.compare(password, this.password_hash);
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
                    lastLogin: this.lastLogin
                };
            }
        };
        
        return user;
    }
}

module.exports = UserMySQL;
