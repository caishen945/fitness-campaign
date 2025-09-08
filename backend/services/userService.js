const UserMySQL = require('../models/UserMySQL');
const { pool } = require('../config/database');

class UserService {
    constructor() {
        // 不再使用内存存储，直接使用数据库
    }

    // 创建用户（转发到模型，签名：username, email, password）
    async createUser(username, email, password) {
        return await UserMySQL.create(username, email, password);
    }

    // 根据邮箱查找用户
    async findByEmail(email) {
        return await UserMySQL.findByEmail(email);
    }

    // 根据ID查找用户
    async findById(id) {
        return await UserMySQL.findById(id);
    }

    // 更新用户钱包地址
    async updateUserWallet(userId, walletAddress) {
        try {
            // 先检查用户是否存在
            const existingUser = await this.findById(userId);
            if (!existingUser) {
                throw new Error('用户不存在');
            }
            
            // 先更新数据库
            const result = await pool.execute(
                'UPDATE users SET trc20_wallet = ?, updated_at = NOW() WHERE id = ?',
                [walletAddress, userId]
            );
            
            if (result[0].affectedRows === 0) {
                throw new Error('更新失败');
            }
            
            // 返回更新后的用户信息
            return await this.findById(userId);
        } catch (error) {
            throw error;
        }
    }

    // 更新最后登录时间
    async updateLastLogin(userId) {
        try {
            const result = await pool.execute(
                'UPDATE users SET last_login = NOW() WHERE id = ?',
                [userId]
            );
            
            if (result[0].affectedRows === 0) {
                throw new Error('用户不存在');
            }
            
            return true;
        } catch (error) {
            throw error;
        }
    }

    // 验证用户凭据
    async validateUserCredentials(email, password) {
        try {
            const user = await this.findByEmail(email);
            if (!user) {
                throw new Error('邮箱或密码错误');
            }
            
            const isValidPassword = await user.validatePassword(password);
            if (!isValidPassword) {
                throw new Error('邮箱或密码错误');
            }
            
            return user;
        } catch (error) {
            throw error;
        }
    }

    // 获取用户资料
    async getUserProfile(userId) {
        try {
            const user = await this.findById(userId);
            if (!user) {
                throw new Error('用户不存在');
            }
            return user;
        } catch (error) {
            throw error;
        }
    }

    // 搜索用户（用户名或邮箱）
    async searchUsers(searchQuery, limit = 20, offset = 0) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE username LIKE ? OR email LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
                [`%${searchQuery}%`, `%${searchQuery}%`, limit, offset]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // 获取用户统计信息
    async getUserStats() {
        try {
            const [totalResult] = await pool.execute('SELECT COUNT(*) as count FROM users');
            const [activeResult] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE last_login > DATE_SUB(NOW(), INTERVAL 30 DAY)');
            const [newResult] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)');
            
            return {
                totalUsers: totalResult[0].count,
                activeUsers: activeResult[0].count,
                newUsersThisMonth: newResult[0].count
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new UserService();