const { pool } = require('../config/database');
const crypto = require('crypto');

class TeamService {
    /**
     * 生成邀请码
     */
    generateInvitationCode(userId) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const hash = crypto.createHash('md5').update(`${userId}${timestamp}${random}`).digest('hex');
        return `INV${userId.toString().padStart(6, '0')}${hash.substring(0, 8).toUpperCase()}`;
    }

    /**
     * 获取或创建用户邀请码
     */
    async getUserInvitationCode(userId) {
        try {
            // 检查是否已有邀请码
            const [existing] = await pool.execute(
                'SELECT invitation_code FROM user_invitation_codes WHERE user_id = ?',
                [userId]
            );

            if (existing.length > 0) {
                return existing[0].invitation_code;
            }

            // 生成新邀请码
            const invitationCode = this.generateInvitationCode(userId);
            
            await pool.execute(
                'INSERT INTO user_invitation_codes (user_id, invitation_code) VALUES (?, ?)',
                [userId, invitationCode]
            );

            return invitationCode;
        } catch (error) {
            console.error('获取用户邀请码失败:', error);
            throw error;
        }
    }

    /**
     * 通过邀请码查找邀请人
     */
    async findInviterByCode(invitationCode) {
        try {
            const [result] = await pool.execute(
                'SELECT user_id FROM user_invitation_codes WHERE invitation_code = ? AND is_active = TRUE',
                [invitationCode]
            );

            return result.length > 0 ? result[0].user_id : null;
        } catch (error) {
            console.error('通过邀请码查找邀请人失败:', error);
            throw error;
        }
    }

    /**
     * 建立团队关系
     */
    async establishTeamRelationship(inviterId, inviteeId) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. 建立1级关系（邀请人 -> 被邀请人）
            await connection.execute(
                'INSERT INTO team_relationships (user_id, parent_id, level) VALUES (?, ?, 1)',
                [inviteeId, inviterId]
            );

            // 2. 查找邀请人的上级，建立2级关系
            const [level1Parents] = await connection.execute(
                'SELECT parent_id FROM team_relationships WHERE user_id = ? AND level = 1',
                [inviterId]
            );

            for (const parent of level1Parents) {
                await connection.execute(
                    'INSERT INTO team_relationships (user_id, parent_id, level) VALUES (?, ?, 2)',
                    [inviteeId, parent.parent_id]
                );
            }

            // 3. 查找邀请人的2级上级，建立3级关系
            const [level2Parents] = await connection.execute(
                'SELECT parent_id FROM team_relationships WHERE user_id = ? AND level = 2',
                [inviterId]
            );

            for (const parent of level2Parents) {
                await connection.execute(
                    'INSERT INTO team_relationships (user_id, parent_id, level) VALUES (?, ?, 3)',
                    [inviteeId, parent.parent_id]
                );
            }

            // 4. 记录邀请
            await connection.execute(
                'INSERT INTO invitation_records (inviter_id, invitee_id, invitation_code, status, completed_at) VALUES (?, ?, ?, "completed", NOW())',
                [inviterId, inviteeId, await this.getUserInvitationCode(inviterId)]
            );

            // 5. 更新团队统计
            await this.updateTeamStatistics(inviterId);
            for (const parent of level1Parents) {
                await this.updateTeamStatistics(parent.parent_id);
            }
            for (const parent of level2Parents) {
                await this.updateTeamStatistics(parent.parent_id);
            }

            await connection.commit();
            console.log(`✅ 团队关系建立成功: ${inviterId} -> ${inviteeId}`);
        } catch (error) {
            await connection.rollback();
            console.error('建立团队关系失败:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * 获取用户团队统计
     */
    async getTeamStatistics(userId) {
        try {
            const [result] = await pool.execute(
                'SELECT * FROM team_statistics WHERE user_id = ?',
                [userId]
            );

            if (result.length === 0) {
                // 如果没有统计记录，创建一条
                await this.updateTeamStatistics(userId);
                const [newResult] = await pool.execute(
                    'SELECT * FROM team_statistics WHERE user_id = ?',
                    [userId]
                );
                return newResult[0] || this.getDefaultStatistics();
            }

            return result[0] || this.getDefaultStatistics();
        } catch (error) {
            console.error('获取团队统计失败:', error);
            // 返回默认统计
            return this.getDefaultStatistics();
        }
    }

    /**
     * 获取默认统计
     */
    getDefaultStatistics() {
        return {
            user_id: 0,
            level1_count: 0,
            level2_count: 0,
            level3_count: 0,
            total_commission: 0,
            total_invitation_rewards: 0,
            created_at: new Date(),
            last_updated: new Date()
        };
    }

    /**
     * 更新团队统计
     */
    async updateTeamStatistics(userId) {
        try {
            // 计算各级成员数量
            const [level1Count] = await pool.execute(
                'SELECT COUNT(*) as count FROM team_relationships WHERE parent_id = ? AND level = 1',
                [userId]
            );

            const [level2Count] = await pool.execute(
                'SELECT COUNT(*) as count FROM team_relationships WHERE parent_id = ? AND level = 2',
                [userId]
            );

            const [level3Count] = await pool.execute(
                'SELECT COUNT(*) as count FROM team_relationships WHERE parent_id = ? AND level = 3',
                [userId]
            );

            // 计算累计返佣
            const [totalCommission] = await pool.execute(
                'SELECT COALESCE(SUM(commission_amount), 0) as total FROM commission_records WHERE user_id = ? AND status = "paid"',
                [userId]
            );

            // 计算累计邀请奖励
            const [totalInvitationRewards] = await pool.execute(
                'SELECT COALESCE(SUM(reward_amount), 0) as total FROM invitation_rewards WHERE user_id = ? AND status = "paid"',
                [userId]
            );

            // 更新或插入统计记录
            await pool.execute(`
                INSERT INTO team_statistics (user_id, level1_count, level2_count, level3_count, total_commission, total_invitation_rewards)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                level1_count = VALUES(level1_count),
                level2_count = VALUES(level2_count),
                level3_count = VALUES(level3_count),
                total_commission = VALUES(total_commission),
                total_invitation_rewards = VALUES(total_invitation_rewards),
                last_updated = NOW()
            `, [
                userId,
                level1Count[0].count,
                level2Count[0].count,
                level3Count[0].count,
                totalCommission[0].total,
                totalInvitationRewards[0].total
            ]);

        } catch (error) {
            console.error('更新团队统计失败:', error);
            throw error;
        }
    }

    /**
     * 获取用户团队成员列表
     */
    async getTeamMembers(userId, level = null) {
        try {
            let query = `
                SELECT 
                    tr.level,
                    u.id,
                    u.username,
                    u.email,
                    u.created_at as join_date,
                    ts.level1_count,
                    ts.level2_count,
                    ts.level3_count
                FROM team_relationships tr
                JOIN users u ON tr.user_id = u.id
                LEFT JOIN team_statistics ts ON u.id = ts.user_id
                WHERE tr.parent_id = ?
            `;

            const params = [userId];

            if (level) {
                query += ' AND tr.level = ?';
                params.push(level);
            }

            query += ' ORDER BY tr.level, u.created_at DESC';

            const [members] = await pool.execute(query, params);
            return members;
        } catch (error) {
            console.error('获取团队成员失败:', error);
            throw error;
        }
    }

    /**
     * 处理VIP挑战返佣
     */
    async processVipChallengeCommission(userId, vipChallengeId, challengeReward) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 获取返佣配置
            const [config] = await connection.execute('SELECT config_key, config_value FROM team_config WHERE config_key LIKE "level%_commission_rate"');
            const commissionRates = {};
            config.forEach(item => {
                const level = item.config_key.match(/level(\d+)/)[1];
                commissionRates[level] = parseFloat(item.config_value);
            });

            // 查找用户的上级
            const [superiors] = await connection.execute(
                'SELECT parent_id, level FROM team_relationships WHERE user_id = ? ORDER BY level',
                [userId]
            );

            // 为每个上级计算返佣
            for (const superior of superiors) {
                const rate = commissionRates[superior.level];
                if (rate && rate > 0) {
                    const commissionAmount = Math.round(challengeReward * rate * 100) / 100; // 保留2位小数

                    if (commissionAmount > 0) {
                        // 记录返佣
                        await connection.execute(`
                            INSERT INTO commission_records 
                            (user_id, from_user_id, vip_challenge_id, challenge_reward, commission_rate, commission_amount, level, status)
                            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
                        `, [
                            superior.parent_id,
                            userId,
                            vipChallengeId,
                            challengeReward,
                            rate,
                            commissionAmount,
                            superior.level
                        ]);

                        // 更新用户钱包余额
                        await connection.execute(
                            'UPDATE user_wallets SET balance = balance + ? WHERE user_id = ?',
                            [commissionAmount, superior.parent_id]
                        );

                        // 记录钱包交易
                        await connection.execute(`
                            INSERT INTO wallet_transactions 
                            (user_id, amount, transaction_type, description, created_at)
                            VALUES (?, ?, 'team_commission', ?, NOW())
                        `, [
                            superior.parent_id,
                            commissionAmount,
                            `${superior.level}级成员VIP挑战返佣`
                        ]);

                        // 更新返佣状态为已发放
                        await connection.execute(
                            'UPDATE commission_records SET status = "paid", paid_at = NOW() WHERE user_id = ? AND from_user_id = ? AND vip_challenge_id = ?',
                            [superior.parent_id, userId, vipChallengeId]
                        );

                        // 更新团队统计
                        await this.updateTeamStatistics(superior.parent_id);
                    }
                }
            }

            await connection.commit();
            console.log(`✅ VIP挑战返佣处理完成: 用户${userId}, 挑战${vipChallengeId}`);
        } catch (error) {
            await connection.rollback();
            console.error('处理VIP挑战返佣失败:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * 处理邀请奖励（当被邀请用户充值达到门槛时）
     */
    async processInvitationReward(inviterId, inviteeId, rechargeAmount) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 获取邀请奖励配置
            const [rewardConfig] = await connection.execute(
                'SELECT config_value FROM team_config WHERE config_key = "invitation_reward_amount"'
            );
            const [thresholdConfig] = await connection.execute(
                'SELECT config_value FROM team_config WHERE config_key = "invitation_recharge_threshold"'
            );

            const rewardAmount = parseFloat(rewardConfig[0].config_value);
            const threshold = parseFloat(thresholdConfig[0].config_value);

            // 检查是否达到门槛
            if (rechargeAmount >= threshold) {
                // 检查是否已经发放过奖励
                const [existing] = await connection.execute(
                    'SELECT id FROM invitation_rewards WHERE user_id = ? AND invited_user_id = ? AND status = "paid"',
                    [inviterId, inviteeId]
                );

                if (existing.length === 0) {
                    // 记录邀请奖励
                    await connection.execute(`
                        INSERT INTO invitation_rewards 
                        (user_id, invited_user_id, reward_amount, recharge_amount, status)
                        VALUES (?, ?, ?, ?, 'pending')
                    `, [inviterId, inviteeId, rewardAmount, rechargeAmount]);

                    // 更新用户钱包余额
                    await connection.execute(
                        'UPDATE user_wallets SET balance = balance + ? WHERE user_id = ?',
                        [rewardAmount, inviterId]
                    );

                    // 记录钱包交易
                    await connection.execute(`
                        INSERT INTO wallet_transactions 
                        (user_id, amount, transaction_type, description, created_at)
                        VALUES (?, ?, 'invitation_reward', ?, NOW())
                    `, [inviterId, rewardAmount, '邀请有效成员奖励']);

                    // 更新奖励状态为已发放
                    await connection.execute(
                        'UPDATE invitation_rewards SET status = "paid", paid_at = NOW() WHERE user_id = ? AND invited_user_id = ?',
                        [inviterId, inviteeId]
                    );

                    // 更新团队统计
                    await this.updateTeamStatistics(inviterId);

                    console.log(`✅ 邀请奖励发放成功: ${inviterId} -> ${inviteeId}, 金额: ${rewardAmount}`);
                }
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            console.error('处理邀请奖励失败:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * 获取团队配置
     */
    async getTeamConfig() {
        try {
            const [config] = await pool.execute('SELECT * FROM team_config ORDER BY config_key');
            const configMap = {};
            config.forEach(item => {
                configMap[item.config_key] = {
                    value: item.config_value,
                    description: item.description
                };
            });
            return configMap;
        } catch (error) {
            console.error('获取团队配置失败:', error);
            throw error;
        }
    }

    /**
     * 更新团队配置
     */
    async updateTeamConfig(configKey, configValue) {
        try {
            await pool.execute(
                'UPDATE team_config SET config_value = ?, updated_at = NOW() WHERE config_key = ?',
                [configValue, configKey]
            );
            console.log(`✅ 团队配置更新成功: ${configKey} = ${configValue}`);
        } catch (error) {
            console.error('更新团队配置失败:', error);
            throw error;
        }
    }
}

module.exports = new TeamService();
