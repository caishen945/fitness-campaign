const { pool } = require('../config/database');

class AdminPkChallengeController {
    /**
     * 获取所有PK挑战
     */
    async getAllChallenges(req, res) {
        try {
            const { status, userId, page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;
            
            // 构建查询条件
            let conditions = [];
            let params = [];
            
            if (status) {
                conditions.push('pc.status = ?');
                params.push(status);
            }
            
            if (userId) {
                conditions.push('(pc.challenger_id = ? OR pc.opponent_id = ?)');
                params.push(userId, userId);
            }
            
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            
            // 获取总记录数
            const [countRows] = await pool.query(`
                SELECT COUNT(*) as total
                FROM pk_challenges pc
                ${whereClause}
            `, params);
            
            const total = countRows[0].total;
            
            // 获取分页数据
            const [rows] = await pool.query(`
                SELECT 
                    pc.*,
                    u1.username as challenger_name,
                    u1.email as challenger_email,
                    u2.username as opponent_name,
                    u2.email as opponent_email,
                    w.username as winner_name
                FROM 
                    pk_challenges pc
                JOIN 
                    users u1 ON pc.challenger_id = u1.id
                JOIN 
                    users u2 ON pc.opponent_id = u2.id
                LEFT JOIN 
                    users w ON pc.winner_id = w.id
                ${whereClause}
                ORDER BY pc.created_at DESC
                LIMIT ? OFFSET ?
            `, [...params, parseInt(limit), parseInt(offset)]);
            
            // 处理结果
            const challenges = rows.map(row => ({
                id: row.id,
                status: row.status,
                startDate: row.start_date,
                endDate: row.end_date,
                depositAmount: parseFloat(row.deposit_amount),
                rewardAmount: parseFloat(row.reward_amount),
                stepTarget: row.step_target,
                challenger: {
                    id: row.challenger_id,
                    name: row.challenger_name,
                    email: row.challenger_email,
                    steps: row.challenger_steps
                },
                opponent: {
                    id: row.opponent_id,
                    name: row.opponent_name,
                    email: row.opponent_email,
                    steps: row.opponent_steps
                },
                winnerId: row.winner_id,
                winnerName: row.winner_name,
                createdAt: row.created_at
            }));
            
            res.json({
                success: true,
                data: {
                    challenges,
                    pagination: {
                        total,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        pages: Math.ceil(total / limit)
                    }
                },
                message: '获取PK挑战列表成功'
            });
        } catch (error) {
            console.error('获取PK挑战列表失败:', error);
            res.status(500).json({
                success: false,
                message: '获取PK挑战列表失败',
                error: error.message
            });
        }
    }
    
    /**
     * 获取单个PK挑战详情
     */
    async getChallengeDetails(req, res) {
        try {
            const challengeId = req.params.challengeId;
            
            // 获取挑战详情
            const [rows] = await pool.query(`
                SELECT 
                    pc.*,
                    u1.username as challenger_name,
                    u1.email as challenger_email,
                    u2.username as opponent_name,
                    u2.email as opponent_email,
                    w.username as winner_name
                FROM 
                    pk_challenges pc
                JOIN 
                    users u1 ON pc.challenger_id = u1.id
                JOIN 
                    users u2 ON pc.opponent_id = u2.id
                LEFT JOIN 
                    users w ON pc.winner_id = w.id
                WHERE 
                    pc.id = ?
            `, [challengeId]);
            
            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '挑战不存在'
                });
            }
            
            const challenge = rows[0];
            
            // 获取挑战历史记录
            const [historyRows] = await pool.query(`
                SELECT 
                    pch.*,
                    u.username
                FROM 
                    pk_challenge_history pch
                JOIN
                    users u ON pch.user_id = u.id
                WHERE 
                    pch.challenge_id = ?
                ORDER BY 
                    pch.date ASC
            `, [challengeId]);
            
            // 处理历史记录
            const history = historyRows.map(row => ({
                id: row.id,
                userId: row.user_id,
                username: row.username,
                date: row.date,
                steps: row.steps
            }));
            
            // 获取挑战消息
            const [messageRows] = await pool.query(`
                SELECT 
                    pcm.*,
                    u.username as sender_name
                FROM 
                    pk_challenge_messages pcm
                JOIN 
                    users u ON pcm.sender_id = u.id
                WHERE 
                    pcm.challenge_id = ?
                ORDER BY 
                    pcm.created_at ASC
            `, [challengeId]);
            
            // 处理消息
            const messages = messageRows.map(row => ({
                id: row.id,
                senderId: row.sender_id,
                senderName: row.sender_name,
                receiverId: row.receiver_id,
                message: row.message,
                isRead: row.is_read === 1,
                createdAt: row.created_at
            }));
            
            // 构建响应数据
            const challengeData = {
                id: challenge.id,
                status: challenge.status,
                startDate: challenge.start_date,
                endDate: challenge.end_date,
                depositAmount: parseFloat(challenge.deposit_amount),
                rewardAmount: parseFloat(challenge.reward_amount),
                stepTarget: challenge.step_target,
                challenger: {
                    id: challenge.challenger_id,
                    name: challenge.challenger_name,
                    email: challenge.challenger_email,
                    steps: challenge.challenger_steps
                },
                opponent: {
                    id: challenge.opponent_id,
                    name: challenge.opponent_name,
                    email: challenge.opponent_email,
                    steps: challenge.opponent_steps
                },
                winnerId: challenge.winner_id,
                winnerName: challenge.winner_name,
                createdAt: challenge.created_at,
                history,
                messages
            };
            
            res.json({
                success: true,
                data: challengeData,
                message: '获取PK挑战详情成功'
            });
        } catch (error) {
            console.error('获取PK挑战详情失败:', error);
            res.status(500).json({
                success: false,
                message: '获取PK挑战详情失败',
                error: error.message
            });
        }
    }
    
    /**
     * 取消PK挑战（管理员可以取消任何状态的挑战）
     */
    async cancelChallenge(req, res) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            const challengeId = req.params.challengeId;
            
            // 验证挑战是否存在
            const [challengeRows] = await connection.query(`
                SELECT * FROM pk_challenges WHERE id = ?
            `, [challengeId]);
            
            if (challengeRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '挑战不存在'
                });
            }
            
            const challenge = challengeRows[0];
            
            // 如果挑战已完成，不能取消
            if (challenge.status === 'completed') {
                return res.status(400).json({
                    success: false,
                    message: '已完成的挑战不能取消'
                });
            }
            
            // 更新挑战状态
            await connection.query(`
                UPDATE pk_challenges SET status = 'cancelled' WHERE id = ?
            `, [challengeId]);
            
            // 如果挑战已接受，需要退还双方押金
            if (challenge.status === 'accepted') {
                // 退还挑战者押金
                await connection.query(`
                    UPDATE user_wallets SET 
                        balance = balance + ?,
                        frozen_balance = frozen_balance - ?
                    WHERE user_id = ?
                `, [challenge.deposit_amount, challenge.deposit_amount, challenge.challenger_id]);
                
                // 记录交易
                await connection.query(`
                    INSERT INTO wallet_transactions (
                        user_id, transaction_type, amount, description
                    ) VALUES (?, 'deposit', ?, 'PK挑战押金退还（管理员取消）')
                `, [challenge.challenger_id, challenge.deposit_amount]);
                
                // 退还对手押金
                await connection.query(`
                    UPDATE user_wallets SET 
                        balance = balance + ?,
                        frozen_balance = frozen_balance - ?
                    WHERE user_id = ?
                `, [challenge.deposit_amount, challenge.deposit_amount, challenge.opponent_id]);
                
                // 记录交易
                await connection.query(`
                    INSERT INTO wallet_transactions (
                        user_id, transaction_type, amount, description
                    ) VALUES (?, 'deposit', ?, 'PK挑战押金退还（管理员取消）')
                `, [challenge.opponent_id, challenge.deposit_amount]);
            } else if (challenge.status === 'pending') {
                // 如果挑战待接受，只需退还挑战者押金
                await connection.query(`
                    UPDATE user_wallets SET 
                        balance = balance + ?,
                        frozen_balance = frozen_balance - ?
                    WHERE user_id = ?
                `, [challenge.deposit_amount, challenge.deposit_amount, challenge.challenger_id]);
                
                // 记录交易
                await connection.query(`
                    INSERT INTO wallet_transactions (
                        user_id, transaction_type, amount, description
                    ) VALUES (?, 'deposit', ?, 'PK挑战押金退还（管理员取消）')
                `, [challenge.challenger_id, challenge.deposit_amount]);
            }
            
            await connection.commit();
            
            res.json({
                success: true,
                data: {
                    challengeId,
                    status: 'cancelled'
                },
                message: '已取消PK挑战'
            });
        } catch (error) {
            await connection.rollback();
            console.error('取消PK挑战失败:', error);
            res.status(500).json({
                success: false,
                message: '取消PK挑战失败',
                error: error.message
            });
        } finally {
            connection.release();
        }
    }
    
    /**
     * 管理用户PK权限
     */
    async managePkPermission(req, res) {
        try {
            const userId = req.params.userId;
            const { pkEnabled } = req.body;
            
            // 验证输入
            if (pkEnabled === undefined) {
                return res.status(400).json({
                    success: false,
                    message: '缺少必要参数'
                });
            }
            
            // 验证用户是否存在
            const [userRows] = await pool.query(`
                SELECT id FROM users WHERE id = ?
            `, [userId]);
            
            if (userRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '用户不存在'
                });
            }
            
            // 更新用户PK权限
            await pool.query(`
                UPDATE users SET pk_enabled = ? WHERE id = ?
            `, [pkEnabled ? 1 : 0, userId]);
            
            res.json({
                success: true,
                data: {
                    userId,
                    pkEnabled: !!pkEnabled
                },
                message: `已${pkEnabled ? '启用' : '禁用'}用户PK挑战权限`
            });
        } catch (error) {
            console.error('管理用户PK权限失败:', error);
            res.status(500).json({
                success: false,
                message: '管理用户PK权限失败',
                error: error.message
            });
        }
    }
    
    /**
     * 手动结算PK挑战
     */
    async settleChallenge(req, res) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            const challengeId = req.params.challengeId;
            const { winnerId } = req.body;
            
            // 验证挑战是否存在
            const [challengeRows] = await connection.query(`
                SELECT * FROM pk_challenges WHERE id = ?
            `, [challengeId]);
            
            if (challengeRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '挑战不存在'
                });
            }
            
            const challenge = challengeRows[0];
            
            // 验证挑战状态
            if (challenge.status !== 'accepted') {
                return res.status(400).json({
                    success: false,
                    message: '只有已接受的挑战可以手动结算'
                });
            }
            
            // 验证获胜者是否为挑战参与者
            if (winnerId && winnerId != challenge.challenger_id && winnerId != challenge.opponent_id) {
                return res.status(400).json({
                    success: false,
                    message: '获胜者必须是挑战参与者'
                });
            }
            
            // 更新挑战状态
            await connection.query(`
                UPDATE pk_challenges SET status = 'completed', winner_id = ? WHERE id = ?
            `, [winnerId || null, challengeId]);
            
            // 处理奖励分配
            if (winnerId) {
                // 获胜者获得所有押金
                const totalReward = parseFloat(challenge.deposit_amount) * 2;
                
                await connection.query(`
                    UPDATE user_wallets SET 
                        balance = balance + ?,
                        frozen_balance = frozen_balance - ?
                    WHERE user_id = ?
                `, [totalReward, challenge.deposit_amount, winnerId]);
                
                // 记录交易
                await connection.query(`
                    INSERT INTO wallet_transactions (
                        user_id, transaction_type, amount, description
                    ) VALUES (?, 'reward', ?, 'PK挑战获胜奖励（管理员结算）')
                `, [winnerId, totalReward]);
                
                // 减少失败者的冻结余额
                const loserId = winnerId == challenge.challenger_id ? challenge.opponent_id : challenge.challenger_id;
                
                await connection.query(`
                    UPDATE user_wallets SET 
                        frozen_balance = frozen_balance - ?
                    WHERE user_id = ?
                `, [challenge.deposit_amount, loserId]);
            } else {
                // 平局，退还双方押金
                await connection.query(`
                    UPDATE user_wallets SET 
                        balance = balance + ?,
                        frozen_balance = frozen_balance - ?
                    WHERE user_id = ? OR user_id = ?
                `, [challenge.deposit_amount, challenge.deposit_amount, challenge.challenger_id, challenge.opponent_id]);
                
                // 记录交易
                await connection.query(`
                    INSERT INTO wallet_transactions (
                        user_id, transaction_type, amount, description
                    ) VALUES (?, 'deposit', ?, 'PK挑战平局退还押金（管理员结算）')
                `, [challenge.challenger_id, challenge.deposit_amount]);
                
                await connection.query(`
                    INSERT INTO wallet_transactions (
                        user_id, transaction_type, amount, description
                    ) VALUES (?, 'deposit', ?, 'PK挑战平局退还押金（管理员结算）')
                `, [challenge.opponent_id, challenge.deposit_amount]);
            }
            
            await connection.commit();
            
            res.json({
                success: true,
                data: {
                    challengeId,
                    status: 'completed',
                    winnerId
                },
                message: winnerId ? '已结算PK挑战并分配奖励' : '已结算PK挑战为平局'
            });
        } catch (error) {
            await connection.rollback();
            console.error('结算PK挑战失败:', error);
            res.status(500).json({
                success: false,
                message: '结算PK挑战失败',
                error: error.message
            });
        } finally {
            connection.release();
        }
    }
}

module.exports = new AdminPkChallengeController();
