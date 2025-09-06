const { pool } = require('../config/database');
const achievementService = require('../services/achievementService');

class PKChallengeController {
    /**
     * 获取用户的PK挑战列表
     */
    async getUserChallenges(req, res) {
        try {
            const userId = req.user.id;
            
            // 获取用户参与的所有PK挑战（作为挑战者或被挑战者）
            const [rows] = await pool.query(`
                SELECT 
                    pc.*,
                    u1.username as challenger_name,
                    u1.email as challenger_email,
                    u2.username as opponent_name,
                    u2.email as opponent_email
                FROM 
                    pk_challenges pc
                JOIN 
                    users u1 ON pc.challenger_id = u1.id
                JOIN 
                    users u2 ON pc.opponent_id = u2.id
                WHERE 
                    pc.challenger_id = ? OR pc.opponent_id = ?
                ORDER BY 
                    pc.created_at DESC
            `, [userId, userId]);
            
            // 处理结果
            const challenges = rows.map(row => {
                const isChallenger = row.challenger_id == userId;
                
                return {
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
                        steps: row.challenger_steps,
                        isCurrentUser: isChallenger
                    },
                    opponent: {
                        id: row.opponent_id,
                        name: row.opponent_name,
                        email: row.opponent_email,
                        steps: row.opponent_steps,
                        isCurrentUser: !isChallenger
                    },
                    winnerId: row.winner_id,
                    createdAt: row.created_at
                };
            });
            
            // 直接返回挑战列表数组
            res.json(challenges);
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
            const userId = req.user.id;
            const challengeId = req.params.challengeId;
            
            // 获取挑战详情
            const [rows] = await pool.query(`
                SELECT 
                    pc.*,
                    u1.username as challenger_name,
                    u1.email as challenger_email,
                    u2.username as opponent_name,
                    u2.email as opponent_email
                FROM 
                    pk_challenges pc
                JOIN 
                    users u1 ON pc.challenger_id = u1.id
                JOIN 
                    users u2 ON pc.opponent_id = u2.id
                WHERE 
                    pc.id = ? AND (pc.challenger_id = ? OR pc.opponent_id = ?)
            `, [challengeId, userId, userId]);
            
            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '挑战不存在或您无权访问'
                });
            }
            
            const challenge = rows[0];
            const isChallenger = challenge.challenger_id == userId;
            
            // 获取挑战历史记录
            const [historyRows] = await pool.query(`
                SELECT 
                    pch.*
                FROM 
                    pk_challenge_history pch
                WHERE 
                    pch.challenge_id = ?
                ORDER BY 
                    pch.date ASC
            `, [challengeId]);
            
            // 处理历史记录
            const history = historyRows.map(row => ({
                id: row.id,
                userId: row.user_id,
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
                    steps: challenge.challenger_steps,
                    isCurrentUser: isChallenger
                },
                opponent: {
                    id: challenge.opponent_id,
                    name: challenge.opponent_name,
                    email: challenge.opponent_email,
                    steps: challenge.opponent_steps,
                    isCurrentUser: !isChallenger
                },
                winnerId: challenge.winner_id,
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
     * 创建新的PK挑战
     */
    async createChallenge(req, res) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            const userId = req.user.id;
            const { opponentId, depositAmount, stepTarget, startDate, endDate } = req.body;
            
            // 验证输入
            if (!opponentId || !depositAmount || !stepTarget || !startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: '缺少必要参数'
                });
            }
            
            // 验证用户是否有PK权限
            const [userRows] = await connection.query(`
                SELECT pk_enabled FROM users WHERE id = ?
            `, [userId]);
            
            if (userRows.length === 0 || userRows[0].pk_enabled !== 1) {
                return res.status(403).json({
                    success: false,
                    message: '您没有PK挑战权限'
                });
            }
            
            // 验证对手是否存在且有PK权限
            const [opponentRows] = await connection.query(`
                SELECT id, pk_enabled FROM users WHERE id = ?
            `, [opponentId]);
            
            if (opponentRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '对手用户不存在'
                });
            }
            
            if (opponentRows[0].pk_enabled !== 1) {
                return res.status(403).json({
                    success: false,
                    message: '对方没有PK挑战权限'
                });
            }
            
            // 验证用户不能挑战自己
            if (parseInt(opponentId) === userId) {
                return res.status(400).json({
                    success: false,
                    message: '不能挑战自己'
                });
            }
            
            // 验证用户余额是否足够
            const [walletRows] = await connection.query(`
                SELECT balance FROM user_wallets WHERE user_id = ?
            `, [userId]);
            
            if (walletRows.length === 0 || parseFloat(walletRows[0].balance) < parseFloat(depositAmount)) {
                return res.status(400).json({
                    success: false,
                    message: '余额不足'
                });
            }
            
            // 扣除用户押金
            await connection.query(`
                UPDATE user_wallets SET 
                    balance = balance - ?,
                    frozen_balance = frozen_balance + ?
                WHERE user_id = ?
            `, [depositAmount, depositAmount, userId]);
            
            // 记录交易
            await connection.query(`
                INSERT INTO wallet_transactions (
                    user_id, transaction_type, amount, description, reference_id, reference_type
                ) VALUES (?, 'challenge_deposit', ?, 'PK挑战押金', ?, 'pk_challenge')
            `, [userId, depositAmount, challengeId]);
            
            // 创建PK挑战
            const [result] = await connection.query(`
                INSERT INTO pk_challenges (
                    challenger_id, opponent_id, status, start_date, end_date,
                    deposit_amount, reward_amount, step_target, challenger_steps,
                    opponent_steps, created_at
                ) VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, 0, 0, NOW())
            `, [userId, opponentId, startDate, endDate, depositAmount, depositAmount * 2, stepTarget]);
            
            const challengeId = result.insertId;
            
            // 创建挑战消息
            await connection.query(`
                INSERT INTO pk_challenge_messages (
                    challenge_id, sender_id, receiver_id, message, is_read, created_at
                ) VALUES (?, ?, ?, '邀请您参加PK挑战！', 0, NOW())
            `, [challengeId, userId, opponentId]);
            
            await connection.commit();
            
            res.json({
                success: true,
                data: {
                    challengeId,
                    status: 'pending'
                },
                message: 'PK挑战创建成功，等待对方接受'
            });
        } catch (error) {
            await connection.rollback();
            console.error('创建PK挑战失败:', error);
            res.status(500).json({
                success: false,
                message: '创建PK挑战失败',
                error: error.message
            });
        } finally {
            connection.release();
        }
    }
    
    /**
     * 接受PK挑战
     */
    async acceptChallenge(req, res) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            const userId = req.user.id;
            const challengeId = req.params.challengeId;
            
            // 验证挑战是否存在且用户是被挑战者
            const [challengeRows] = await connection.query(`
                SELECT * FROM pk_challenges 
                WHERE id = ? AND opponent_id = ? AND status = 'pending'
            `, [challengeId, userId]);
            
            if (challengeRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '挑战不存在或您无权接受'
                });
            }
            
            const challenge = challengeRows[0];
            
            // 验证用户余额是否足够
            const [walletRows] = await connection.query(`
                SELECT balance FROM user_wallets WHERE user_id = ?
            `, [userId]);
            
            if (walletRows.length === 0 || parseFloat(walletRows[0].balance) < parseFloat(challenge.deposit_amount)) {
                return res.status(400).json({
                    success: false,
                    message: '余额不足'
                });
            }
            
            // 扣除用户押金
            await connection.query(`
                UPDATE user_wallets SET 
                    balance = balance - ?,
                    frozen_balance = frozen_balance + ?
                WHERE user_id = ?
            `, [challenge.deposit_amount, challenge.deposit_amount, userId]);
            
            // 记录交易
            await connection.query(`
                INSERT INTO wallet_transactions (
                    user_id, transaction_type, amount, description, reference_id, reference_type
                ) VALUES (?, 'challenge_deposit', ?, 'PK挑战押金', ?, 'pk_challenge')
            `, [userId, challenge.deposit_amount, challengeId]);
            
            // 更新挑战状态
            await connection.query(`
                UPDATE pk_challenges SET status = 'accepted' WHERE id = ?
            `, [challengeId]);
            
            // 创建挑战消息
            await connection.query(`
                INSERT INTO pk_challenge_messages (
                    challenge_id, sender_id, receiver_id, message, is_read, created_at
                ) VALUES (?, ?, ?, '已接受您的PK挑战！', 0, NOW())
            `, [challengeId, userId, challenge.challenger_id]);
            
            await connection.commit();
            
            res.json({
                success: true,
                data: {
                    challengeId,
                    status: 'accepted'
                },
                message: '成功接受PK挑战'
            });
        } catch (error) {
            await connection.rollback();
            console.error('接受PK挑战失败:', error);
            res.status(500).json({
                success: false,
                message: '接受PK挑战失败',
                error: error.message
            });
        } finally {
            connection.release();
        }
    }
    
    /**
     * 拒绝PK挑战
     */
    async rejectChallenge(req, res) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            const userId = req.user.id;
            const challengeId = req.params.challengeId;
            
            // 验证挑战是否存在且用户是被挑战者
            const [challengeRows] = await connection.query(`
                SELECT * FROM pk_challenges 
                WHERE id = ? AND opponent_id = ? AND status = 'pending'
            `, [challengeId, userId]);
            
            if (challengeRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '挑战不存在或您无权拒绝'
                });
            }
            
            const challenge = challengeRows[0];
            
            // 更新挑战状态
            await connection.query(`
                UPDATE pk_challenges SET status = 'rejected' WHERE id = ?
            `, [challengeId]);
            
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
                    user_id, transaction_type, amount, description, reference_id, reference_type
                ) VALUES (?, 'challenge_refund', ?, 'PK挑战押金退还（对方拒绝）', ?, 'pk_challenge')
            `, [challenge.challenger_id, challenge.deposit_amount, challengeId]);
            
            // 创建挑战消息
            await connection.query(`
                INSERT INTO pk_challenge_messages (
                    challenge_id, sender_id, receiver_id, message, is_read, created_at
                ) VALUES (?, ?, ?, '已拒绝您的PK挑战', 0, NOW())
            `, [challengeId, userId, challenge.challenger_id]);
            
            await connection.commit();
            
            res.json({
                success: true,
                data: {
                    challengeId,
                    status: 'rejected'
                },
                message: '已拒绝PK挑战'
            });
        } catch (error) {
            await connection.rollback();
            console.error('拒绝PK挑战失败:', error);
            res.status(500).json({
                success: false,
                message: '拒绝PK挑战失败',
                error: error.message
            });
        } finally {
            connection.release();
        }
    }
    
    /**
     * 取消PK挑战（仅限挑战者在对方未接受前）
     */
    async cancelChallenge(req, res) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            const userId = req.user.id;
            const challengeId = req.params.challengeId;
            
            // 验证挑战是否存在且用户是挑战者
            const [challengeRows] = await connection.query(`
                SELECT * FROM pk_challenges 
                WHERE id = ? AND challenger_id = ? AND status = 'pending'
            `, [challengeId, userId]);
            
            if (challengeRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '挑战不存在或您无权取消'
                });
            }
            
            const challenge = challengeRows[0];
            
            // 更新挑战状态
            await connection.query(`
                UPDATE pk_challenges SET status = 'cancelled' WHERE id = ?
            `, [challengeId]);
            
            // 退还挑战者押金
            await connection.query(`
                UPDATE user_wallets SET 
                    balance = balance + ?,
                    frozen_balance = frozen_balance - ?
                WHERE user_id = ?
            `, [challenge.deposit_amount, challenge.deposit_amount, userId]);
            
            // 记录交易
            await connection.query(`
                INSERT INTO wallet_transactions (
                    user_id, transaction_type, amount, description, reference_id, reference_type
                ) VALUES (?, 'challenge_refund', ?, 'PK挑战押金退还（自行取消）', ?, 'pk_challenge')
            `, [userId, challenge.deposit_amount, challengeId]);
            
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
     * 提交步数
     */
    async submitSteps(req, res) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            const userId = req.user.id;
            const challengeId = req.params.challengeId;
            const { steps, date } = req.body;
            
            // 验证输入
            if (!steps || !date) {
                return res.status(400).json({
                    success: false,
                    message: '缺少必要参数'
                });
            }
            
            // 验证挑战是否存在且用户是参与者
            const [challengeRows] = await connection.query(`
                SELECT * FROM pk_challenges 
                WHERE id = ? AND (challenger_id = ? OR opponent_id = ?) AND status = 'accepted'
            `, [challengeId, userId, userId]);
            
            if (challengeRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '挑战不存在或您无权提交步数'
                });
            }
            
            const challenge = challengeRows[0];
            
            // 验证日期是否在挑战期间
            const startDate = new Date(challenge.start_date);
            const endDate = new Date(challenge.end_date);
            const submitDate = new Date(date);
            
            if (submitDate < startDate || submitDate > endDate) {
                return res.status(400).json({
                    success: false,
                    message: '提交日期不在挑战期间'
                });
            }
            
            // 检查是否已提交过该日期的步数
            const [existingRows] = await connection.query(`
                SELECT * FROM pk_challenge_history 
                WHERE challenge_id = ? AND user_id = ? AND date = ?
            `, [challengeId, userId, date]);
            
            if (existingRows.length > 0) {
                // 更新步数
                await connection.query(`
                    UPDATE pk_challenge_history 
                    SET steps = ?, updated_at = NOW()
                    WHERE challenge_id = ? AND user_id = ? AND date = ?
                `, [steps, challengeId, userId, date]);
            } else {
                // 插入新记录
                await connection.query(`
                    INSERT INTO pk_challenge_history (
                        challenge_id, user_id, date, steps, created_at
                    ) VALUES (?, ?, ?, ?, NOW())
                `, [challengeId, userId, date, steps]);
            }
            
            // 计算用户总步数
            const [totalStepsRows] = await connection.query(`
                SELECT SUM(steps) as total_steps 
                FROM pk_challenge_history 
                WHERE challenge_id = ? AND user_id = ?
            `, [challengeId, userId]);
            
            const totalSteps = totalStepsRows[0].total_steps || 0;
            
            // 更新挑战中的步数
            if (userId == challenge.challenger_id) {
                await connection.query(`
                    UPDATE pk_challenges SET challenger_steps = ? WHERE id = ?
                `, [totalSteps, challengeId]);
            } else {
                await connection.query(`
                    UPDATE pk_challenges SET opponent_steps = ? WHERE id = ?
                `, [totalSteps, challengeId]);
            }
            
            // 检查挑战是否已结束
            const now = new Date();
            if (now > endDate) {
                // 确定获胜者
                const [updatedChallenge] = await connection.query(`
                    SELECT * FROM pk_challenges WHERE id = ?
                `, [challengeId]);
                
                const { challenger_id, opponent_id, challenger_steps, opponent_steps, deposit_amount } = updatedChallenge[0];
                
                let winnerId = null;
                if (challenger_steps > opponent_steps) {
                    winnerId = challenger_id;
                } else if (opponent_steps > challenger_steps) {
                    winnerId = opponent_id;
                }
                
                // 更新挑战状态
                await connection.query(`
                    UPDATE pk_challenges SET status = 'completed', winner_id = ? WHERE id = ?
                `, [winnerId, challengeId]);
                
                // 处理奖励分配
                if (winnerId) {
                    // 获胜者获得所有押金
                    const totalReward = deposit_amount * 2;
                    
                    await connection.query(`
                        UPDATE user_wallets SET 
                            balance = balance + ?,
                            frozen_balance = frozen_balance - ?
                        WHERE user_id = ?
                    `, [totalReward, deposit_amount, winnerId]);
                    
                    // 记录交易
                    await connection.query(`
                        INSERT INTO wallet_transactions (
                            user_id, transaction_type, amount, description, reference_id, reference_type
                        ) VALUES (?, 'challenge_reward', ?, 'PK挑战获胜奖励', ?, 'pk_challenge')
                    `, [winnerId, totalReward, challengeId]);
                    
                    // 减少失败者的冻结余额
                    const loserId = winnerId == challenger_id ? opponent_id : challenger_id;
                    
                    await connection.query(`
                        UPDATE user_wallets SET 
                            frozen_balance = frozen_balance - ?
                        WHERE user_id = ?
                    `, [deposit_amount, loserId]);
                    
                    // 触发成就检查 - 获胜者
                    try {
                        await achievementService.updateUserAchievementProgress(winnerId);
                        const winnerAchievements = await achievementService.checkAndTriggerAchievements(winnerId);
                        
                        if (winnerAchievements.length > 0) {
                            console.log(`🎉 PK获胜者 ${winnerId} 完成 ${winnerAchievements.length} 个新成就`);
                        }
                    } catch (achievementError) {
                        console.error('获胜者成就检查失败:', achievementError);
                    }
                    
                    // 触发成就检查 - 失败者
                    try {
                        await achievementService.updateUserAchievementProgress(loserId);
                        const loserAchievements = await achievementService.checkAndTriggerAchievements(loserId);
                        
                        if (loserAchievements.length > 0) {
                            console.log(`🎉 PK失败者 ${loserId} 完成 ${loserAchievements.length} 个新成就`);
                        }
                    } catch (achievementError) {
                        console.error('失败者成就检查失败:', achievementError);
                    }
                } else {
                    // 平局，退还双方押金
                    await connection.query(`
                        UPDATE user_wallets SET 
                            balance = balance + ?,
                            frozen_balance = frozen_balance - ?
                        WHERE user_id = ? OR user_id = ?
                    `, [deposit_amount, deposit_amount, challenger_id, opponent_id]);
                    
                    // 记录交易
                    await connection.query(`
                        INSERT INTO wallet_transactions (
                            user_id, transaction_type, amount, description, reference_id, reference_type
                        ) VALUES (?, 'challenge_refund', ?, 'PK挑战平局退还押金', ?, 'pk_challenge')
                    `, [challenger_id, deposit_amount, challengeId]);
                    
                    await connection.query(`
                        INSERT INTO wallet_transactions (
                            user_id, transaction_type, amount, description, reference_id, reference_type
                        ) VALUES (?, 'challenge_refund', ?, 'PK挑战平局退还押金', ?, 'pk_challenge')
                    `, [opponent_id, deposit_amount, challengeId]);
                }
            }
            
            await connection.commit();
            
            res.json({
                success: true,
                data: {
                    challengeId,
                    steps,
                    date,
                    totalSteps
                },
                message: '步数提交成功'
            });
        } catch (error) {
            await connection.rollback();
            console.error('提交步数失败:', error);
            res.status(500).json({
                success: false,
                message: '提交步数失败',
                error: error.message
            });
        } finally {
            connection.release();
        }
    }
    
    /**
     * 发送消息
     */
    async sendMessage(req, res) {
        try {
            const userId = req.user.id;
            const challengeId = req.params.challengeId;
            const { message } = req.body;
            
            // 验证输入
            if (!message) {
                return res.status(400).json({
                    success: false,
                    message: '消息内容不能为空'
                });
            }
            
            // 验证挑战是否存在且用户是参与者
            const [challengeRows] = await pool.query(`
                SELECT * FROM pk_challenges 
                WHERE id = ? AND (challenger_id = ? OR opponent_id = ?)
            `, [challengeId, userId, userId]);
            
            if (challengeRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '挑战不存在或您无权发送消息'
                });
            }
            
            const challenge = challengeRows[0];
            
            // 确定接收者
            const receiverId = userId == challenge.challenger_id ? challenge.opponent_id : challenge.challenger_id;
            
            // 插入消息
            const [result] = await pool.query(`
                INSERT INTO pk_challenge_messages (
                    challenge_id, sender_id, receiver_id, message, is_read, created_at
                ) VALUES (?, ?, ?, ?, 0, NOW())
            `, [challengeId, userId, receiverId, message]);
            
            res.json({
                success: true,
                data: {
                    messageId: result.insertId,
                    challengeId,
                    senderId: userId,
                    receiverId,
                    message,
                    createdAt: new Date()
                },
                message: '消息发送成功'
            });
        } catch (error) {
            console.error('发送消息失败:', error);
            res.status(500).json({
                success: false,
                message: '发送消息失败',
                error: error.message
            });
        }
    }
    
    /**
     * 标记消息为已读
     */
    async markMessageRead(req, res) {
        try {
            const userId = req.user.id;
            const messageId = req.params.messageId;
            
            // 验证消息是否存在且用户是接收者
            const [messageRows] = await pool.query(`
                SELECT * FROM pk_challenge_messages 
                WHERE id = ? AND receiver_id = ?
            `, [messageId, userId]);
            
            if (messageRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '消息不存在或您无权标记'
                });
            }
            
            // 标记为已读
            await pool.query(`
                UPDATE pk_challenge_messages SET is_read = 1 WHERE id = ?
            `, [messageId]);
            
            res.json({
                success: true,
                data: {
                    messageId
                },
                message: '消息已标记为已读'
            });
        } catch (error) {
            console.error('标记消息失败:', error);
            res.status(500).json({
                success: false,
                message: '标记消息失败',
                error: error.message
            });
        }
    }
    
    /**
     * 搜索用户（用于创建挑战时选择对手）
     */
    async searchUsers(req, res) {
        try {
            const userId = req.user.id;
            const { keyword } = req.query;
            
            if (!keyword) {
                return res.status(400).json({
                    success: false,
                    message: '请输入用户ID或邮箱'
                });
            }
            
            let query;
            let params;
            
            // 判断是否为纯数字（ID）
            if (/^\d+$/.test(keyword)) {
                query = `
                    SELECT id, username, email 
                    FROM users 
                    WHERE id = ? AND id != ? AND pk_enabled = TRUE
                    LIMIT 1
                `;
                params = [keyword, userId];
            } else {
                // 按邮箱搜索
                query = `
                    SELECT id, username, email 
                    FROM users 
                    WHERE email LIKE ? AND id != ? AND pk_enabled = TRUE
                    LIMIT 10
                `;
                params = [`%${keyword}%`, userId];
            }
            
            // 搜索用户（排除自己，且只包含启用PK功能的用户）
            const [rows] = await pool.query(query, params);
            
            res.json({
                success: true,
                data: rows,
                message: '搜索用户成功'
            });
        } catch (error) {
            console.error('搜索用户失败:', error);
            res.status(500).json({
                success: false,
                message: '搜索用户失败',
                error: error.message
            });
        }
    }
}

module.exports = new PKChallengeController();
