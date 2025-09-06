// 用户服务 - MySQL版本
const UserMySQL = require('../models/UserMySQL');
const { pool } = require('../config/database');

class UserService {
    constructor() {
        // 不再使用内存存储，直接使用数据库
    }

    // 创建用户
    async createUser(username, email, password) {
        return await UserMySQL.create(username, email, password);
    }

    // 根据用户名查找用户
    async findByUsername(username) {
        return await UserMySQL.findByUsername(username);
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
        return await UserMySQL.updateWallet(userId, walletAddress);
    }

    // 更新最后登录时间
    async updateLastLogin(userId) {
        return await UserMySQL.updateLastLogin(userId);
    }
}

module.exports = new UserService();
