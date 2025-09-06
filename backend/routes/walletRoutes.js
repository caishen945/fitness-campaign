const express = require('express');
const walletService = require('../services/walletService');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// 用户路由需要认证
router.use('/info', authenticateToken);
router.use('/transactions', authenticateToken);
router.use('/deposit', authenticateToken);
router.use('/withdraw', authenticateToken);

// 获取用户钱包信息
router.get('/info', async (req, res) => {
    try {
        const wallet = await walletService.getUserWallet(req.user.id);
        const stats = await walletService.getWalletStats(req.user.id);
        
        res.json({
            success: true,
            data: {
                wallet,
                stats
            },
            message: '获取钱包信息成功'
        });
    } catch (error) {
        console.error('获取钱包信息失败:', error);
        res.status(500).json({
            success: false,
            message: '获取钱包信息失败',
            error: error.message
        });
    }
});

// 获取交易记录
router.get('/transactions', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        const result = await walletService.getTransactionHistory(req.user.id, page, limit);
        
        res.json({
            success: true,
            data: result,
            message: '获取交易记录成功'
        });
    } catch (error) {
        console.error('获取交易记录失败:', error);
        res.status(500).json({
            success: false,
            message: '获取交易记录失败',
            error: error.message
        });
    }
});

// 用户充值申请
router.post('/deposit', async (req, res) => {
    try {
        const { amount, paymentMethod, trxHash, description } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: '充值金额必须大于0'
            });
        }
        
        if (amount < 1.00) {
            return res.status(400).json({
                success: false,
                message: '最小充值金额为1.00 USDT'
            });
        }
        
        const result = await walletService.deposit(
            req.user.id, 
            amount, 
            paymentMethod || 'trc20', 
            trxHash || null, 
            description || '用户充值申请'
        );
        
        res.json(result);
    } catch (error) {
        console.error('充值申请失败:', error);
        res.status(500).json({
            success: false,
            message: '充值申请失败',
            error: error.message
        });
    }
});

// 申请提现
router.post('/withdraw', async (req, res) => {
    try {
        const { amount, trc20Wallet } = req.body;
        
        if (!amount || !trc20Wallet) {
            return res.status(400).json({
                success: false,
                message: '金额和钱包地址不能为空'
            });
        }
        
        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: '提现金额必须大于0'
            });
        }
        
        const result = await walletService.requestWithdrawal(req.user.id, amount, trc20Wallet);
        
        res.json(result);
    } catch (error) {
        console.error('提现申请失败:', error);
        res.status(500).json({
            success: false,
            message: '提现申请失败',
            error: error.message
        });
    }
});

// 管理员路由 - 临时允许无认证访问（仅用于测试）
// TODO: 在生产环境中应该重新启用认证
// router.use(requireAdmin);

// 管理员充值
router.post('/admin/deposit', async (req, res) => {
    try {
        const { userId, amount, paymentMethod, trxHash, description } = req.body;
        
        if (!userId || !amount) {
            return res.status(400).json({
                success: false,
                message: '用户ID和金额不能为空'
            });
        }
        
        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: '充值金额必须大于0'
            });
        }
        
        const result = await walletService.deposit(
            userId, 
            amount, 
            paymentMethod || 'admin', 
            trxHash, 
            description || '管理员充值'
        );
        
        res.json({
            success: true,
            data: result,
            message: '充值成功'
        });
    } catch (error) {
        console.error('管理员充值失败:', error);
        res.status(500).json({
            success: false,
            message: '管理员充值失败',
            error: error.message
        });
    }
});

// 管理员发放奖励
router.post('/admin/reward', async (req, res) => {
    try {
        const { userId, rewardType, amount, description, referenceId, referenceType } = req.body;
        
        if (!userId || !rewardType || !amount) {
            return res.status(400).json({
                success: false,
                message: '用户ID、奖励类型和金额不能为空'
            });
        }
        
        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: '奖励金额必须大于0'
            });
        }
        
        const result = await walletService.giveReward(
            userId, 
            rewardType, 
            amount, 
            description || '管理员奖励', 
            referenceId, 
            referenceType
        );
        
        res.json({
            success: true,
            data: result,
            message: '奖励发放成功'
        });
    } catch (error) {
        console.error('管理员发放奖励失败:', error);
        res.status(500).json({
            success: false,
            message: '管理员发放奖励失败',
            error: error.message
        });
    }
});

// 获取所有充值订单
router.get('/admin/deposits', async (req, res) => {
    try {
        const { page = 1, limit = 20, status, userId, email, telegram } = req.query;
        const offset = (page - 1) * limit;
        
        const connection = await require('../config/database').pool.getConnection();
        
        let whereClause = '';
        let queryParams = [];
        const conditions = [];
        
        if (status && status !== 'all') {
            conditions.push('do.status = ?');
            queryParams.push(status);
        }
        
        // 添加搜索条件
        if (userId) {
            conditions.push('u.id = ?');
            queryParams.push(userId);
        }
        
        if (email) {
            conditions.push('u.email LIKE ?');
            queryParams.push(`%${email}%`);
        }
        
        if (telegram) {
            conditions.push('(u.telegram_id LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)');
            queryParams.push(`%${telegram}%`, `%${telegram}%`, `%${telegram}%`);
        }
        
        if (conditions.length > 0) {
            whereClause = 'WHERE ' + conditions.join(' AND ');
        }
        
        const [deposits] = await connection.execute(`
            SELECT 
                do.*,
                u.email,
                u.telegram_id,
                u.first_name,
                u.last_name
            FROM deposit_orders do
            JOIN users u ON do.user_id = u.id
            ${whereClause}
            ORDER BY do.created_at DESC
            LIMIT ? OFFSET ?
        `, [...queryParams, parseInt(limit), parseInt(offset)]);
        
        const [countResult] = await connection.execute(`
            SELECT COUNT(*) as total 
            FROM deposit_orders do
            JOIN users u ON do.user_id = u.id
            ${whereClause}
        `, queryParams);
        
        connection.release();
        
        res.json({
            success: true,
            data: deposits,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total,
                totalPages: Math.ceil(countResult[0].total / limit)
            },
            message: '获取充值订单列表成功'
        });
    } catch (error) {
        console.error('获取充值订单列表失败:', error);
        res.status(500).json({
            success: false,
            message: '获取充值订单列表失败',
            error: error.message
        });
    }
});

// 处理充值订单
router.put('/admin/deposits/:orderNo', async (req, res) => {
    try {
        const { orderNo } = req.params;
        const { status, adminNotes } = req.body;
        
        if (!status || !['completed', 'failed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: '无效的订单状态'
            });
        }
        
        const result = await walletService.processDeposit(orderNo, status, adminNotes);
        
        res.json(result);
    } catch (error) {
        console.error('处理充值订单失败:', error);
        res.status(500).json({
            success: false,
            message: '处理充值订单失败',
            error: error.message
        });
    }
});

// 获取所有提现申请
router.get('/admin/withdrawals', async (req, res) => {
    try {
        const { page = 1, limit = 20, status, userId, email, telegram } = req.query;
        const offset = (page - 1) * limit;
        
        const connection = await require('../config/database').pool.getConnection();
        
        let whereClause = '';
        let queryParams = [];
        const conditions = [];
        
        if (status && status !== 'all') {
            conditions.push('wr.status = ?');
            queryParams.push(status);
        }
        
        // 添加搜索条件
        if (userId) {
            conditions.push('u.id = ?');
            queryParams.push(userId);
        }
        
        if (email) {
            conditions.push('u.email LIKE ?');
            queryParams.push(`%${email}%`);
        }
        
        if (telegram) {
            conditions.push('(u.telegram_id LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)');
            queryParams.push(`%${telegram}%`, `%${telegram}%`, `%${telegram}%`);
        }
        
        if (conditions.length > 0) {
            whereClause = 'WHERE ' + conditions.join(' AND ');
        }
        
        const [withdrawals] = await connection.execute(`
            SELECT 
                wr.*,
                u.username,
                u.email,
                u.telegram_id,
                u.first_name,
                u.last_name
            FROM withdrawal_requests wr
            JOIN users u ON wr.user_id = u.id
            ${whereClause}
            ORDER BY wr.created_at DESC
            LIMIT ? OFFSET ?
        `, [...queryParams, parseInt(limit), parseInt(offset)]);
        
        const [countResult] = await connection.execute(`
            SELECT COUNT(*) as total 
            FROM withdrawal_requests wr
            JOIN users u ON wr.user_id = u.id
            ${whereClause}
        `, queryParams);
        
        connection.release();
        
        res.json({
            success: true,
            data: withdrawals,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total,
                totalPages: Math.ceil(countResult[0].total / limit)
            },
            message: '获取提现申请列表成功'
        });
    } catch (error) {
        console.error('获取提现申请列表失败:', error);
        res.status(500).json({
            success: false,
            message: '获取提现申请列表失败',
            error: error.message
        });
    }
});

// 处理提现申请
router.put('/admin/withdrawals/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;
        
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: '状态必须是 approved 或 rejected'
            });
        }
        
        const result = await walletService.processWithdrawal(id, status, adminNotes);
        
        res.json({
            success: true,
            data: result,
            message: '提现申请处理成功'
        });
    } catch (error) {
        console.error('处理提现申请失败:', error);
        res.status(500).json({
            success: false,
            message: '处理提现申请失败',
            error: error.message
        });
    }
});

// 获取钱包统计
router.get('/admin/stats', async (req, res) => {
    try {
        const connection = await require('../config/database').pool.getConnection();
        
        // 总体统计
        const [overallStats] = await connection.execute(`
            SELECT 
                COUNT(DISTINCT uw.user_id) as total_users,
                SUM(uw.balance) as total_balance,
                SUM(uw.frozen_balance) as total_frozen,
                SUM(uw.total_deposited) as total_deposited,
                SUM(uw.total_withdrawn) as total_withdrawn,
                SUM(uw.total_rewarded) as total_rewarded
            FROM user_wallets uw
        `);
        
        // 本月统计
        const [monthlyStats] = await connection.execute(`
            SELECT 
                SUM(CASE WHEN transaction_type = 'deposit' THEN amount ELSE 0 END) as monthly_deposits,
                SUM(CASE WHEN transaction_type = 'withdrawal' THEN amount ELSE 0 END) as monthly_withdrawals,
                SUM(CASE WHEN transaction_type = 'reward' THEN amount ELSE 0 END) as monthly_rewards,
                COUNT(*) as total_transactions
            FROM wallet_transactions 
            WHERE MONTH(created_at) = MONTH(NOW()) 
            AND YEAR(created_at) = YEAR(NOW())
        `);
        
        // 今日统计
        const [todayStats] = await connection.execute(`
            SELECT 
                SUM(CASE WHEN transaction_type = 'deposit' THEN amount ELSE 0 END) as today_deposits,
                SUM(CASE WHEN transaction_type = 'withdrawal' THEN amount ELSE 0 END) as today_withdrawals,
                SUM(CASE WHEN transaction_type = 'reward' THEN amount ELSE 0 END) as today_rewards,
                COUNT(*) as today_transactions
            FROM wallet_transactions 
            WHERE DATE(created_at) = CURDATE()
        `);
        
        connection.release();
        
        res.json({
            success: true,
            data: {
                overall: overallStats[0],
                monthly: monthlyStats[0],
                today: todayStats[0]
            },
            message: '获取钱包统计成功'
        });
    } catch (error) {
        console.error('获取钱包统计失败:', error);
        res.status(500).json({
            success: false,
            message: '获取钱包统计失败',
            error: error.message
        });
    }
});

// 获取用户交易记录
router.get('/admin/transactions/user/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        if (!userId || userId <= 0) {
            return res.status(400).json({
                success: false,
                message: '用户ID无效'
            });
        }
        
        const result = await walletService.getUserTransactionHistory(userId, page, limit);
        
        res.json({
            success: true,
            data: result,
            message: '获取用户交易记录成功'
        });
    } catch (error) {
        console.error('获取用户交易记录失败:', error);
        res.status(500).json({
            success: false,
            message: '获取用户交易记录失败',
            error: error.message
        });
    }
});

// 获取充值记录（管理员）
router.get('/admin/deposits', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        
        const result = await walletService.getDepositRecords(page, limit);
        
        res.json({
            success: true,
            data: result,
            message: '获取充值记录成功'
        });
    } catch (error) {
        console.error('获取充值记录失败:', error);
        res.status(500).json({
            success: false,
            message: '获取充值记录失败',
            error: error.message
        });
    }
});

// 获取所有交易记录（管理员）
router.get('/admin/transactions', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        
        const result = await walletService.getAllTransactions(page, limit);
        
        res.json({
            success: true,
            data: result,
            message: '获取所有交易记录成功'
        });
    } catch (error) {
        console.error('获取所有交易记录失败:', error);
        res.status(500).json({
            success: false,
            message: '获取所有交易记录失败',
            error: error.message
        });
    }
});

// 管理员调整用户余额
router.post('/admin/adjust', async (req, res) => {
    try {
        const { userId, type, amount, reason } = req.body;
        
        if (!userId || !type || !amount || !reason) {
            return res.status(400).json({
                success: false,
                message: '用户ID、调整类型、金额和原因不能为空'
            });
        }
        
        if (!['add', 'subtract'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: '调整类型必须是 add 或 subtract'
            });
        }
        
        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: '调整金额必须大于0'
            });
        }
        
        const result = await walletService.adjustUserBalance(userId, type, amount, reason);
        
        res.json({
            success: true,
            data: result,
            message: '余额调整成功'
        });
    } catch (error) {
        console.error('余额调整失败:', error);
        res.status(500).json({
            success: false,
            message: '余额调整失败',
            error: error.message
        });
    }
});

module.exports = router;
