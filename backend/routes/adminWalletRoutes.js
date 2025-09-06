const express = require('express');
const router = express.Router();

// 导入数据库连接
const { pool } = require('../config/database');

// 钱包概览统计
router.get('/overview', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        try {
            // 获取钱包统计数据
            const [totalBalanceResult] = await connection.execute(`
                SELECT 
                    COALESCE(SUM(balance), 0) as totalBalance,
                    COALESCE(SUM(frozen_balance), 0) as frozenAmount,
                    COUNT(*) as userCount,
                    COALESCE(AVG(balance), 0) as averageBalance
                FROM user_wallets
            `);
            
            const [depositStats] = await connection.execute(`
                SELECT 
                    COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as totalDeposits,
                    COALESCE(SUM(CASE WHEN status = 'completed' AND DATE(created_at) = CURDATE() THEN amount ELSE 0 END), 0) as todayDeposits
                FROM deposit_orders
            `);
            
            const [withdrawalStats] = await connection.execute(`
                SELECT 
                    COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as totalWithdrawals,
                    COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pendingWithdrawals,
                    COALESCE(SUM(CASE WHEN status = 'completed' AND DATE(created_at) = CURDATE() THEN amount ELSE 0 END), 0) as todayWithdrawals
                FROM withdrawal_requests
            `);
            
            const walletStats = {
                totalBalance: parseFloat(totalBalanceResult[0].totalBalance || 0),
                totalDeposits: parseFloat(depositStats[0].totalDeposits || 0),
                totalWithdrawals: parseFloat(withdrawalStats[0].totalWithdrawals || 0),
                pendingWithdrawals: parseFloat(withdrawalStats[0].pendingWithdrawals || 0),
                frozenAmount: parseFloat(totalBalanceResult[0].frozenAmount || 0),
                userCount: parseInt(totalBalanceResult[0].userCount || 0),
                todayDeposits: parseFloat(depositStats[0].todayDeposits || 0),
                todayWithdrawals: parseFloat(withdrawalStats[0].todayWithdrawals || 0),
                averageBalance: parseFloat(totalBalanceResult[0].averageBalance || 0)
            };
            
            res.json({
                success: true,
                data: walletStats,
                message: '获取钱包统计成功'
            });
            
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('获取钱包统计失败:', error);
        res.status(500).json({
            success: false,
            message: '获取钱包统计失败',
            error: error.message
        });
    }
});

// 提现申请列表
router.get('/withdrawals', async (req, res) => {
    try {
        const { page = 1, limit = 20, status, userId } = req.query;
        const offset = (page - 1) * limit;
        
        const connection = await pool.getConnection();
        
        try {
            let whereClause = '';
            let queryParams = [];
            const conditions = [];
            
            if (status && status !== 'all') {
                conditions.push('wr.status = ?');
                queryParams.push(status);
            }
            
            if (userId) {
                conditions.push('wr.user_id = ?');
                queryParams.push(userId);
            }
            
            if (conditions.length > 0) {
                whereClause = 'WHERE ' + conditions.join(' AND ');
            }
            
            // 查询提现申请列表
            const [withdrawals] = await connection.execute(`
                SELECT 
                    wr.*,
                    u.email,
                    u.first_name,
                    u.last_name,
                    u.telegram_id
                FROM withdrawal_requests wr
                JOIN users u ON wr.user_id = u.id
                ${whereClause}
                ORDER BY wr.created_at DESC
                LIMIT ? OFFSET ?
            `, [...queryParams, parseInt(limit), parseInt(offset)]);
            
            // 查询总数
            const [countResult] = await connection.execute(`
                SELECT COUNT(*) as total 
                FROM withdrawal_requests wr
                JOIN users u ON wr.user_id = u.id
                ${whereClause}
            `, queryParams);
            
            const total = countResult[0].total;
            
            // 格式化数据
            const formattedWithdrawals = withdrawals.map(w => ({
                id: w.id,
                requestNo: w.request_no,
                userId: w.user_id,
                userEmail: w.email,
                userName: w.first_name && w.last_name ? `${w.first_name} ${w.last_name}` : w.email,
                amount: parseFloat(w.amount),
                fee: parseFloat(w.fee || 0),
                actualAmount: parseFloat(w.actual_amount || w.amount),
                trc20Wallet: w.trc20_wallet,
                status: w.status,
                adminNotes: w.admin_notes,
                rejectReason: w.reject_reason,
                createdAt: w.created_at,
                updatedAt: w.updated_at,
                processedAt: w.processed_at
            }));
            
            res.json({
                success: true,
                data: formattedWithdrawals,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: total,
                    totalPages: Math.ceil(total / limit)
                },
                message: '获取提现申请列表成功'
            });
            
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('获取提现申请失败:', error);
        res.status(500).json({
            success: false,
            message: '获取提现申请失败',
            error: error.message
        });
    }
});

// 批准提现申请
router.post('/withdrawals/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body;
        
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // 更新提现申请状态
            const [result] = await connection.execute(`
                UPDATE withdrawal_requests 
                SET status = 'approved', admin_notes = ?, processed_at = NOW(), updated_at = NOW()
                WHERE id = ?
            `, [note || '管理员批准', id]);
            
            if (result.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: '提现申请不存在'
                });
            }
            
            await connection.commit();
            
            res.json({
                success: true,
                message: '提现申请已批准'
            });
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('批准提现申请失败:', error);
        res.status(500).json({
            success: false,
            message: '批准提现申请失败',
            error: error.message
        });
    }
});

// 拒绝提现申请
router.post('/withdrawals/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        if (!reason) {
            return res.status(400).json({
                success: false,
                message: '拒绝原因不能为空'
            });
        }
        
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // 获取提现申请信息
            const [withdrawalRows] = await connection.execute(`
                SELECT * FROM withdrawal_requests WHERE id = ?
            `, [id]);
            
            if (withdrawalRows.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: '提现申请不存在'
                });
            }
            
            const withdrawal = withdrawalRows[0];
            
            // 更新提现申请状态
            await connection.execute(`
                UPDATE withdrawal_requests 
                SET status = 'rejected', reject_reason = ?, processed_at = NOW(), updated_at = NOW()
                WHERE id = ?
            `, [reason, id]);
            
            // 如果提现申请之前已经冻结了资金，需要解冻
            if (withdrawal.status === 'pending') {
                // 获取用户钱包
                const [walletRows] = await connection.execute(`
                    SELECT * FROM user_wallets WHERE user_id = ?
                `, [withdrawal.user_id]);
                
                if (walletRows.length > 0) {
                    const balanceBefore = parseFloat(walletRows[0].balance);
                    const frozenBefore = parseFloat(walletRows[0].frozen_balance);
                    
                    // 解冻资金
                    await connection.execute(`
                        UPDATE user_wallets 
                        SET balance = balance + ?, frozen_balance = frozen_balance - ?, updated_at = NOW()
                        WHERE user_id = ?
                    `, [withdrawal.amount, withdrawal.amount, withdrawal.user_id]);
                    
                    // 记录交易
                    await connection.execute(`
                        INSERT INTO wallet_transactions (
                            user_id, transaction_type, amount, balance_before, balance_after,
                            description, reference_id, reference_type, status
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        withdrawal.user_id, 
                        'withdrawal', 
                        withdrawal.amount, 
                        balanceBefore, 
                        balanceBefore + parseFloat(withdrawal.amount),
                        `提现申请被拒绝，资金退回：${reason}`, 
                        withdrawal.request_no, 
                        'withdrawal_request', 
                        'completed'
                    ]);
                }
            }
            
            await connection.commit();
            
            res.json({
                success: true,
                message: '提现申请已拒绝'
            });
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('拒绝提现申请失败:', error);
        res.status(500).json({
            success: false,
            message: '拒绝提现申请失败',
            error: error.message
        });
    }
});

// 充值订单列表
router.get('/deposits', async (req, res) => {
    try {
        const { page = 1, limit = 20, status, userId } = req.query;
        const offset = (page - 1) * limit;
        
        const connection = await pool.getConnection();
        
        try {
            let whereClause = '';
            let queryParams = [];
            const conditions = [];
            
            if (status && status !== 'all') {
                conditions.push('do.status = ?');
                queryParams.push(status);
            }
            
            if (userId) {
                conditions.push('do.user_id = ?');
                queryParams.push(userId);
            }
            
            if (conditions.length > 0) {
                whereClause = 'WHERE ' + conditions.join(' AND ');
            }
            
            // 查询充值订单列表
            const [deposits] = await connection.execute(`
                SELECT 
                    do.*,
                    u.email,
                    u.first_name,
                    u.last_name,
                    u.telegram_id
                FROM deposit_orders do
                JOIN users u ON do.user_id = u.id
                ${whereClause}
                ORDER BY do.created_at DESC
                LIMIT ? OFFSET ?
            `, [...queryParams, parseInt(limit), parseInt(offset)]);
            
            // 查询总数
            const [countResult] = await connection.execute(`
                SELECT COUNT(*) as total 
                FROM deposit_orders do
                JOIN users u ON do.user_id = u.id
                ${whereClause}
            `, queryParams);
            
            const total = countResult[0].total;
            
            // 格式化数据
            const formattedDeposits = deposits.map(d => ({
                id: d.id,
                orderNo: d.order_no,
                userId: d.user_id,
                userEmail: d.email,
                userName: d.first_name && d.last_name ? `${d.first_name} ${d.last_name}` : d.email,
                amount: parseFloat(d.amount),
                paymentMethod: d.payment_method,
                trxHash: d.trx_hash,
                status: d.status,
                adminNotes: d.admin_notes,
                createdAt: d.created_at,
                updatedAt: d.updated_at,
                completedAt: d.completed_at
            }));
            
            res.json({
                success: true,
                data: formattedDeposits,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: total,
                    totalPages: Math.ceil(total / limit)
                },
                message: '获取充值订单列表成功'
            });
            
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('获取充值订单失败:', error);
        res.status(500).json({
            success: false,
            message: '获取充值订单失败',
            error: error.message
        });
    }
});

// 处理充值订单
router.put('/deposits/:orderNo', async (req, res) => {
    try {
        const { orderNo } = req.params;
        const { status, adminNotes } = req.body;
        
        if (!status || !['completed', 'failed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: '无效的订单状态'
            });
        }
        
        // 导入钱包服务
        const walletService = require('../services/walletService');
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

// 获取用户交易记录
router.get('/users/:userId/transactions', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        
        if (!userId || userId <= 0) {
            return res.status(400).json({
                success: false,
                message: '用户ID无效'
            });
        }
        
        // 导入钱包服务
        const walletService = require('../services/walletService');
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

// 管理员调整用户余额
router.post('/adjust', async (req, res) => {
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
        
        // 导入钱包服务
        const walletService = require('../services/walletService');
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