/**
 * VIP挑战MySQL数据模型
 * 替代原有的Mongoose模型，提供相同的API接口
 */

const { pool } = require('../config/database');
const logger = require('../utils/logger');

class VIPChallengeMySQL {
    constructor(data = {}) {
        // 处理snake_case属性名
        this.id = data.id || data.id || null;
        this.userId = data.userId || data.user_id || null;
        this.vipLevelId = data.vipLevelId || data.vip_level_id || null;
        this.challengeType = data.challengeType || data.challenge_type || 'daily'; // daily, weekly, monthly
        this.stepTarget = data.stepTarget || data.step_target || 0; // 步数目标
        this.currentSteps = data.currentSteps || data.current_steps || 0; // 当前步数
        this.startDate = data.startDate || data.start_date || new Date(); // 挑战开始时间
        this.endDate = data.endDate || data.end_date || null; // 挑战结束时间
        this.status = data.status || 'active'; // active, completed, failed, cancelled
        this.depositAmount = data.depositAmount || data.deposit_amount || 0; // 押金金额
        this.rewardAmount = data.rewardAmount || data.reward_amount || 0; // 奖励金额
        this.completedAt = data.completedAt || data.completed_at || null; // 完成时间
        this.createdAt = data.createdAt || data.created_at || new Date();
        this.updatedAt = data.updatedAt || data.updated_at || new Date();
        
        // 新增字段：连续挑战支持
        this.requiredConsecutiveDays = data.requiredConsecutiveDays || data.required_consecutive_days || 1; // 需要连续完成的天数
        this.currentConsecutiveDays = data.currentConsecutiveDays || data.current_consecutive_days || 0; // 当前连续完成的天数
        this.failedDays = data.failedDays || data.failed_days || 0; // 失败的天数
        this.maxFailedDays = data.maxFailedDays || data.max_failed_days || 3; // 最大允许失败天数
        this.dailyReward = data.dailyReward || data.daily_reward || 0; // 每日完成奖励
        this.finalReward = data.finalReward || data.final_reward || 0; // 最终完成奖励（连续完成所有天数后）
        this.partialRefundRatio = data.partialRefundRatio || data.partial_refund_ratio || 0.8; // 部分失败时的押金退还比例
        
        // 新增字段：挑战限制和取消设置
        this.maxChallenges = data.maxChallenges || data.max_challenges || 1; // 每个账号总共可挑战次数
        this.cancelDeductRatio = data.cancelDeductRatio || data.cancel_deduct_ratio || 0.1; // 取消挑战扣除押金比例
        this.cancelRewardRatio = data.cancelRewardRatio || data.cancel_reward_ratio || 0; // 取消挑战是否可获得当日奖励
        
        // 关联信息
        this.vipLevel = data.vipLevel || data.vip_level || null;
        this.user = data.user || null;
    }

    // 验证挑战数据
    validate() {
        const errors = [];
        
        if (!this.userId) {
            errors.push('用户ID不能为空');
        }
        
        if (!this.vipLevelId) {
            errors.push('VIP等级ID不能为空');
        }
        
        if (this.stepTarget <= 0) {
            errors.push('步数目标必须大于0');
        }
        
        if (this.depositAmount <= 0) {
            errors.push('押金金额必须大于0');
        }
        
        return errors;
    }

    // 检查挑战是否进行中（与当前时间无关，避免单测受系统时间影响）
    isActive() {
        if (this.status !== 'active') return false;
        const start = this.startDate ? new Date(this.startDate) : null;
        const end = this.endDate ? new Date(this.endDate) : null;
        // 若存在结束时间且早于开始时间，则视为无效/过期
        if (start && end && end < start) return false;
        return true;
    }

    // 检查挑战是否已完成
    isCompleted() {
        return this.status === 'completed';
    }

    // 检查挑战是否失败
    isFailed() {
        return this.status === 'failed';
    }

    // 检查挑战是否已取消
    isCancelled() {
        return this.status === 'cancelled';
    }

    // 获取挑战进度
    getProgress() {
        if (this.stepTarget <= 0) return 0;
        return Math.min((this.currentSteps / this.stepTarget) * 100, 100);
    }

    // 获取剩余步数
    getRemainingSteps() {
        return Math.max(this.stepTarget - this.currentSteps, 0);
    }

    // 获取剩余时间
    getRemainingTime() {
        if (!this.endDate) return 0;
        const now = new Date();
        const end = new Date(this.endDate);
        return Math.max(end - now, 0);
    }

    // 获取剩余天数
    getRemainingDays() {
        const remainingTime = this.getRemainingTime();
        return Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
    }

    // 更新步数
    updateSteps(steps) {
        this.currentSteps = Math.max(steps, 0);
        this.updatedAt = new Date();
        
        // 检查是否完成挑战
        if (this.currentSteps >= this.stepTarget && this.status === 'active') {
            this.completeChallenge();
        }
        
        return this;
    }

    // 完成挑战
    completeChallenge() {
        this.status = 'completed';
        this.completedAt = new Date();
        this.updatedAt = new Date();
        return this;
    }

    // 失败挑战
    failChallenge() {
        this.status = 'failed';
        this.updatedAt = new Date();
        return this;
    }

    // 取消挑战
    cancelChallenge() {
        this.status = 'cancelled';
        this.updatedAt = new Date();
        return this;
    }

    // 获取挑战统计信息
    getStats() {
        return {
            progress: this.getProgress(),
            remainingSteps: this.getRemainingSteps(),
            remainingDays: this.getRemainingDays(),
            isActive: this.isActive(),
            isCompleted: this.isCompleted(),
            isFailed: this.isFailed(),
            isCancelled: this.isCancelled(),
            duration: this.endDate ? 
                Math.ceil((new Date(this.endDate) - new Date(this.startDate)) / (1000 * 60 * 60 * 24)) : 0
        };
    }

    // 获取挑战显示信息
    getDisplayInfo() {
        const stats = this.getStats();
        return {
            id: this.id,
            challengeType: this.challengeType,
            stepTarget: this.stepTarget,
            currentSteps: this.currentSteps,
            progress: stats.progress,
            remainingSteps: stats.remainingSteps,
            remainingDays: stats.remainingDays,
            status: this.status,
            depositAmount: this.depositAmount,
            rewardAmount: this.rewardAmount,
            startDate: this.startDate,
            endDate: this.endDate,
            completedAt: this.completedAt,
            stats: stats,
            // 计算属性
            potentialProfit: this.rewardAmount - this.depositAmount,
            roi: (() => {
                const depositAmount = parseFloat(this.depositAmount) || 0;
                const rewardAmount = parseFloat(this.rewardAmount) || 0;
                return depositAmount > 0 ? 
                    ((rewardAmount - depositAmount) / depositAmount * 100).toFixed(2) + '%' : '0%';
            })(),
            // 关联信息
            vipLevel: this.vipLevel,
            user: this.user
        };
    }

    // 转换为数据库格式
    toDatabase() {
        return {
            id: this.id,
            user_id: this.userId,
            vip_level_id: this.vipLevelId,
            challenge_type: this.challengeType,
            step_target: this.stepTarget,
            current_steps: this.currentSteps,
            start_date: this.startDate,
            end_date: this.endDate,
            status: this.status,
            deposit_amount: this.depositAmount,
            reward_amount: this.rewardAmount,
            completed_at: this.completedAt,
            created_at: this.createdAt,
            updated_at: this.updatedAt,
            required_consecutive_days: this.requiredConsecutiveDays,
            current_consecutive_days: this.currentConsecutiveDays,
            failed_days: this.failedDays,
            max_failed_days: this.maxFailedDays,
            daily_reward: this.dailyReward,
            final_reward: this.finalReward,
            partial_refund_ratio: this.partialRefundRatio,
            max_challenges: this.maxChallenges,
            cancel_deduct_ratio: this.cancelDeductRatio,
            cancel_reward_ratio: this.cancelRewardRatio
        };
    }

    // 从数据库记录创建实例
    static fromDatabase(data) {
        return new VIPChallengeMySQL({
            id: data.id,
            userId: data.user_id,
            vipLevelId: data.vip_level_id,
            challengeType: data.challenge_type || 'daily',
            stepTarget: data.step_target || 0,
            currentSteps: data.current_steps || data.steps || 0,
            startDate: data.start_date || data.created_at,
            endDate: data.end_date,
            status: data.status,
            depositAmount: data.deposit_amount,
            rewardAmount: data.reward_amount,
            completedAt: data.completed_at,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            requiredConsecutiveDays: data.required_consecutive_days,
            currentConsecutiveDays: data.current_consecutive_days,
            failedDays: data.failed_days,
            maxFailedDays: data.max_failed_days,
            dailyReward: data.daily_reward,
            finalReward: data.final_reward,
            partialRefundRatio: data.partial_refund_ratio,
            maxChallenges: data.max_challenges,
            cancelDeductRatio: data.cancel_deduct_ratio,
            cancelRewardRatio: data.cancel_reward_ratio
        });
    }

    // 创建新的挑战
    static createChallenge(userId, vipLevel, challengeType = 'daily') {
        const now = new Date();
        let endDate;
        
        switch (challengeType) {
            case 'daily':
                endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24小时后
                break;
            case 'weekly':
                endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7天后
                break;
            case 'monthly':
                endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30天后
                break;
            default:
                endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        }
        
        return new VIPChallengeMySQL({
            userId,
            vipLevelId: vipLevel.id,
            challengeType,
            stepTarget: vipLevel.stepTarget,
            depositAmount: vipLevel.depositAmount,
            rewardAmount: vipLevel.rewardAmount,
            startDate: now,
            endDate,
            status: 'active'
        });
    }

    // 根据ID查找挑战
    static async findById(id) {
        try {
            logger.debug('根据ID查询VIP挑战', { id });
            const [rows] = await pool.execute('SELECT * FROM vip_challenges WHERE id = ?', [id]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return VIPChallengeMySQL.fromDatabase(rows[0]);
        } catch (error) {
            logger.error('查询VIP挑战失败', { error, id });
            throw error;
        }
    }

    // 查找用户的活跃挑战
    static async findActiveByUserId(userId) {
        try {
            logger.debug('查询用户活跃挑战', { userId });
            const [rows] = await pool.execute(
                'SELECT * FROM vip_challenges WHERE user_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1',
                [userId, 'active']
            );
            
            if (rows.length === 0) {
                return null;
            }
            
            return VIPChallengeMySQL.fromDatabase(rows[0]);
        } catch (error) {
            logger.error('查询用户活跃挑战失败', { error, userId });
            throw error;
        }
    }

    // 查找用户的所有挑战
    static async findByUserId(userId, options = {}) {
        try {
            const { status, limit = 20, offset = 0 } = options;
            
            let query = 'SELECT * FROM vip_challenges WHERE user_id = ?';
            const params = [userId];
            
            if (status) {
                query += ' AND status = ?';
                params.push(status);
            }
            
            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);
            
            logger.debug('查询用户挑战列表', { userId, options });
            const [rows] = await pool.execute(query, params);
            
            return rows.map(row => VIPChallengeMySQL.fromDatabase(row));
        } catch (error) {
            logger.error('查询用户挑战列表失败', { error, userId, options });
            throw error;
        }
    }

    // 统计用户挑战数量
    static async countByUserId(userId, status = null) {
        try {
            let query = 'SELECT COUNT(*) as count FROM vip_challenges WHERE user_id = ?';
            const params = [userId];
            
            if (status) {
                query += ' AND status = ?';
                params.push(status);
            }
            
            const [rows] = await pool.execute(query, params);
            return rows[0].count;
        } catch (error) {
            logger.error('统计用户挑战数量失败', { error, userId, status });
            throw error;
        }
    }

    // 保存VIP挑战记录
    async save(connection = null) {
        try {
            const dbConnection = connection || pool;
            
            if (this.id) {
                // 更新现有记录
                await dbConnection.execute(
                    `UPDATE vip_challenges SET 
                    user_id = ?, vip_level_id = ?, challenge_type = ?,
                    step_target = ?, current_steps = ?, start_date = ?,
                    end_date = ?, status = ?, deposit_amount = ?,
                    reward_amount = ?, completed_at = ?, 
                    required_consecutive_days = ?, current_consecutive_days = ?,
                    failed_days = ?, max_failed_days = ?, daily_reward = ?,
                    final_reward = ?, partial_refund_ratio = ?, max_challenges = ?,
                    cancel_deduct_ratio = ?, cancel_reward_ratio = ?,
                    updated_at = NOW()
                    WHERE id = ?`,
                    [
                        this.userId, this.vipLevelId, this.challengeType,
                        this.stepTarget, this.currentSteps, this.startDate,
                        this.endDate, this.status, this.depositAmount,
                        this.rewardAmount, this.completedAt,
                        this.requiredConsecutiveDays, this.currentConsecutiveDays,
                        this.failedDays, this.maxFailedDays, this.dailyReward,
                        this.finalReward, this.partialRefundRatio, this.maxChallenges,
                        this.cancelDeductRatio, this.cancelRewardRatio, this.id
                    ]
                );
                
                // 更新成功后直接返回当前实例
                return this;
            } else {
                // 创建新记录
                const [result] = await dbConnection.execute(
                    `INSERT INTO vip_challenges (
                        user_id, vip_level_id, challenge_type, step_target,
                        current_steps, start_date, end_date, status,
                        deposit_amount, reward_amount, completed_at,
                        required_consecutive_days, current_consecutive_days,
                        failed_days, max_failed_days, daily_reward,
                        final_reward, partial_refund_ratio, max_challenges,
                        cancel_deduct_ratio, cancel_reward_ratio,
                        created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                    [
                        this.userId, this.vipLevelId, this.challengeType,
                        this.stepTarget, this.currentSteps, this.startDate,
                        this.endDate, this.status, this.depositAmount,
                        this.rewardAmount, this.completedAt,
                        this.requiredConsecutiveDays, this.currentConsecutiveDays,
                        this.failedDays, this.maxFailedDays, this.dailyReward,
                        this.finalReward, this.partialRefundRatio, this.maxChallenges,
                        this.cancelDeductRatio, this.cancelRewardRatio
                    ]
                );
                
                this.id = result.insertId;
                return this;
            }
        } catch (error) {
            logger.error('保存VIP挑战记录失败', { error });
            throw error;
        }
    }

    // 更新挑战步数
    async updateSteps(steps, connection = null) {
        try {
            const dbConnection = connection || pool;
            
            if (!this.id) {
                throw new Error('无法更新未保存的挑战记录');
            }
            
            this.currentSteps = steps;
            this.updatedAt = new Date();
            
            await dbConnection.execute(
                'UPDATE vip_challenges SET current_steps = ?, updated_at = NOW() WHERE id = ?',
                [steps, this.id]
            );
            
            return this;
        } catch (error) {
            logger.error('更新挑战步数失败', { error, challengeId: this.id, steps });
            throw error;
        }
    }

    // 完成挑战
    async complete(connection = null) {
        try {
            const dbConnection = connection || pool;
            
            if (!this.id) {
                throw new Error('无法完成未保存的挑战记录');
            }
            
            this.status = 'completed';
            this.completedAt = new Date();
            this.updatedAt = new Date();
            
            await dbConnection.execute(
                'UPDATE vip_challenges SET status = ?, completed_at = ?, updated_at = NOW() WHERE id = ?',
                ['completed', this.completedAt, this.id]
            );
            
            return this;
        } catch (error) {
            logger.error('完成挑战失败', { error, challengeId: this.id });
            throw error;
        }
    }

    // 取消挑战
    async cancel(connection = null) {
        try {
            const dbConnection = connection || pool;
            
            if (!this.id) {
                throw new Error('无法取消未保存的挑战记录');
            }
            
            this.status = 'cancelled';
            this.updatedAt = new Date();
            
            await dbConnection.execute(
                'UPDATE vip_challenges SET status = ?, updated_at = NOW() WHERE id = ?',
                ['cancelled', this.id]
            );
            
            return this;
        } catch (error) {
            logger.error('取消挑战失败', { error, challengeId: this.id });
            throw error;
        }
    }

    /**
     * 获取用户挑战统计信息
     * @param {number} userId 用户ID
     * @returns {Promise<Object>} 统计信息
     */
    static async getUserChallengeStats(userId) {
        try {
            const connection = await pool.getConnection();
            
            try {
                // 基础统计查询
                const [basicStats] = await connection.execute(`
                    SELECT 
                        COUNT(*) as totalChallenges,
                        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successfulChallenges,
                        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failedChallenges,
                        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelledChallenges,
                        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeChallenges,
                        SUM(CASE WHEN status = 'completed' THEN reward_amount ELSE 0 END) as totalRewards,
                        AVG(CASE WHEN status = 'completed' THEN reward_amount ELSE NULL END) as avgReward,
                        MAX(CASE WHEN status = 'completed' THEN reward_amount ELSE 0 END) as maxReward
                    FROM vip_challenges 
                    WHERE user_id = ?
                `, [userId]);

                // 成功率计算
                const totalChallenges = parseInt(basicStats[0].totalChallenges) || 0;
                const successfulChallenges = parseInt(basicStats[0].successfulChallenges) || 0;
                const failedChallenges = parseInt(basicStats[0].failedChallenges) || 0;
                const cancelledChallenges = parseInt(basicStats[0].cancelledChallenges) || 0;
                const activeChallenges = parseInt(basicStats[0].activeChallenges) || 0;
                const successRate = totalChallenges > 0 ? (successfulChallenges / totalChallenges * 100) : 0;

                // 等级分布统计
                const [levelStats] = await connection.execute(`
                    SELECT 
                        vl.name as levelName,
                        vl.icon as levelIcon,
                        vl.color as levelColor,
                        COUNT(*) as challengeCount,
                        SUM(CASE WHEN vc.status = 'completed' THEN 1 ELSE 0 END) as successCount,
                        AVG(CASE WHEN vc.status = 'completed' THEN vc.reward_amount ELSE NULL END) as avgReward
                    FROM vip_challenges vc
                    JOIN vip_levels vl ON vc.vip_level_id = vl.id
                    WHERE vc.user_id = ?
                    GROUP BY vl.id, vl.name, vl.icon, vl.color
                    ORDER BY vl.deposit_amount ASC
                `, [userId]);

                // 月度统计
                const [monthlyStats] = await connection.execute(`
                    SELECT 
                        DATE_FORMAT(created_at, '%Y-%m') as month,
                        COUNT(*) as challengeCount,
                        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successCount,
                        SUM(CASE WHEN status = 'completed' THEN reward_amount ELSE 0 END) as totalRewards
                    FROM vip_challenges 
                    WHERE user_id = ? 
                    AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                    ORDER BY month DESC
                `, [userId]);

                // 连续挑战统计
                const [consecutiveStats] = await connection.execute(`
                    SELECT 
                        MAX(current_consecutive_days) as maxConsecutiveDays,
                        AVG(current_consecutive_days) as avgConsecutiveDays
                    FROM vip_challenges 
                    WHERE user_id = ? AND status = 'completed'
                `, [userId]);

                return {
                    basic: {
                        totalChallenges,
                        successfulChallenges,
                        failedChallenges,
                        cancelledChallenges,
                        activeChallenges,
                        totalRewards: parseFloat(basicStats[0].totalRewards || 0),
                        avgReward: parseFloat(basicStats[0].avgReward || 0),
                        maxReward: parseFloat(basicStats[0].maxReward || 0),
                        successRate: parseFloat(successRate.toFixed(2))
                    },
                    byLevel: levelStats.map(stat => ({
                        levelName: stat.levelName,
                        levelIcon: stat.levelIcon,
                        levelColor: stat.levelColor,
                        challengeCount: stat.challengeCount,
                        successCount: stat.successCount,
                        avgReward: parseFloat(stat.avgReward || 0)
                    })),
                    monthly: monthlyStats.map(stat => ({
                        month: stat.month,
                        challengeCount: stat.challengeCount,
                        successCount: stat.successCount,
                        totalRewards: parseFloat(stat.totalRewards || 0)
                    })),
                    consecutive: {
                        maxConsecutiveDays: consecutiveStats[0].maxConsecutiveDays || 0,
                        avgConsecutiveDays: parseFloat(consecutiveStats[0].avgConsecutiveDays || 0).toFixed(1)
                    }
                };

            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('获取用户挑战统计失败:', error);
            throw error;
        }
    }

    /**
     * 获取用户挑战历史记录
     * @param {number} userId 用户ID
     * @param {Object} options 查询选项
     * @returns {Promise<Object>} 历史记录
     */
    static async getUserChallengeHistory(userId, options = {}) {
        try {
            const connection = await pool.getConnection();
            
            try {
                const { page = 1, limit = 10, status, levelId } = options;
                const offset = (page - 1) * limit;

                // 构建查询条件
                let whereClause = 'WHERE vc.user_id = ?';
                const queryParams = [userId];

                if (status) {
                    whereClause += ' AND vc.status = ?';
                    queryParams.push(status);
                }

                if (levelId) {
                    whereClause += ' AND vc.vip_level_id = ?';
                    queryParams.push(levelId);
                }

                // 获取总记录数
                const [countResult] = await connection.execute(`
                    SELECT COUNT(*) as total
                    FROM vip_challenges vc
                    ${whereClause}
                `, queryParams);

                const totalRecords = countResult[0].total;

                // 获取分页数据
                const [records] = await connection.execute(`
                    SELECT 
                        vc.*,
                        vl.name as levelName,
                        vl.icon as levelIcon,
                        vl.color as levelColor,
                        vl.deposit_amount as levelDepositAmount,
                        vl.step_target as levelStepTarget
                    FROM vip_challenges vc
                    JOIN vip_levels vl ON vc.vip_level_id = vl.id
                    ${whereClause}
                    ORDER BY vc.created_at DESC
                    LIMIT ? OFFSET ?
                `, [...queryParams, limit, offset]);

                // 格式化数据
                const formattedRecords = records.map(record => ({
                    id: record.id,
                    levelName: record.levelName,
                    levelIcon: record.levelIcon,
                    levelColor: record.levelColor,
                    status: record.status,
                    stepTarget: record.step_target,
                    currentSteps: record.current_steps,
                    depositAmount: parseFloat(record.deposit_amount),
                    rewardAmount: parseFloat(record.reward_amount),
                    startDate: record.start_date,
                    endDate: record.end_date,
                    completedAt: record.completed_at,
                    createdAt: record.created_at,
                    progress: record.step_target > 0 ? Math.min((record.current_steps / record.step_target) * 100, 100) : 0
                }));

                return {
                    records: formattedRecords,
                    pagination: {
                        page,
                        limit,
                        totalRecords,
                        totalPages: Math.ceil(totalRecords / limit),
                        hasNext: page * limit < totalRecords,
                        hasPrev: page > 1
                    }
                };

            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('获取用户挑战历史失败:', error);
            throw error;
        }
    }

    /**
     * 获取挑战进度详情
     * @param {number} challengeId 挑战ID
     * @returns {Promise<Object>} 进度详情
     */
    static async getChallengeProgress(challengeId) {
        try {
            const connection = await pool.getConnection();
            
            try {
                // 获取挑战基本信息
                const [challengeInfo] = await connection.execute(`
                    SELECT 
                        vc.*,
                        vl.name as levelName,
                        vl.icon as levelIcon,
                        vl.color as levelColor,
                        vl.required_consecutive_days,
                        vl.max_failed_days
                    FROM vip_challenges vc
                    JOIN vip_levels vl ON vc.vip_level_id = vl.id
                    WHERE vc.id = ?
                `, [challengeId]);

                if (challengeInfo.length === 0) {
                    throw new Error('挑战记录不存在');
                }

                const challenge = challengeInfo[0];

                // 计算进度信息
                const progress = {
                    challengeId: challenge.id,
                    levelName: challenge.levelName,
                    levelIcon: challenge.levelIcon,
                    levelColor: challenge.levelColor,
                    status: challenge.status,
                    stepTarget: challenge.step_target,
                    currentSteps: challenge.current_steps,
                    progressPercentage: challenge.step_target > 0 ? Math.min((challenge.current_steps / challenge.step_target) * 100, 100) : 0,
                    remainingSteps: Math.max(0, challenge.step_target - challenge.current_steps),
                    startDate: challenge.start_date,
                    endDate: challenge.end_date,
                    daysElapsed: challenge.start_date ? Math.floor((new Date() - new Date(challenge.start_date)) / (1000 * 60 * 60 * 24)) : 0,
                    requiredDays: challenge.required_consecutive_days,
                    maxFailedDays: challenge.max_failed_days,
                    currentFailedDays: challenge.failed_days || 0,
                    currentConsecutiveDays: challenge.current_consecutive_days || 0,
                    depositAmount: parseFloat(challenge.deposit_amount),
                    rewardAmount: parseFloat(challenge.reward_amount),
                    dailyReward: parseFloat(challenge.daily_reward || 0),
                    finalReward: parseFloat(challenge.final_reward || 0)
                };

                // 计算预估完成时间
                if (progress.status === 'active' && progress.currentSteps > 0) {
                    const avgDailySteps = progress.currentSteps / Math.max(1, progress.daysElapsed);
                    const remainingSteps = progress.remainingSteps;
                    progress.estimatedCompletionDays = Math.ceil(remainingSteps / avgDailySteps);
                }

                return progress;

            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('获取挑战进度失败:', error);
            throw error;
        }
    }

    /**
     * 获取用户挑战趋势分析
     * @param {number} userId 用户ID
     * @param {number} period 分析周期（天）
     * @returns {Promise<Object>} 趋势数据
     */
    static async getUserChallengeTrends(userId, period = 30) {
        try {
            const connection = await pool.getConnection();
            
            try {
                // 获取每日挑战数据
                const [dailyData] = await connection.execute(`
                    SELECT 
                        DATE(created_at) as date,
                        COUNT(*) as challengeCount,
                        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successCount,
                        SUM(CASE WHEN status = 'completed' THEN reward_amount ELSE 0 END) as dailyRewards,
                        AVG(CASE WHEN status = 'completed' THEN reward_amount ELSE NULL END) as avgReward
                    FROM vip_challenges 
                    WHERE user_id = ? 
                    AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                    GROUP BY DATE(created_at)
                    ORDER BY date ASC
                `, [userId, period]);

                // 获取每周挑战数据
                const [weeklyData] = await connection.execute(`
                    SELECT 
                        YEARWEEK(created_at) as week,
                        COUNT(*) as challengeCount,
                        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successCount,
                        SUM(CASE WHEN status = 'completed' THEN reward_amount ELSE 0 END) as weeklyRewards
                    FROM vip_challenges 
                    WHERE user_id = ? 
                    AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                    GROUP BY YEARWEEK(created_at)
                    ORDER BY week ASC
                `, [userId, period]);

                // 计算趋势指标
                const trends = {
                    daily: dailyData.map(day => ({
                        date: day.date,
                        challengeCount: day.challengeCount,
                        successCount: day.successCount,
                        dailyRewards: parseFloat(day.dailyRewards || 0),
                        avgReward: parseFloat(day.avgReward || 0),
                        successRate: day.challengeCount > 0 ? (day.successCount / day.challengeCount * 100) : 0
                    })),
                    weekly: weeklyData.map(week => ({
                        week: week.week,
                        challengeCount: week.challengeCount,
                        successCount: week.successCount,
                        weeklyRewards: parseFloat(week.weeklyRewards || 0),
                        successRate: week.challengeCount > 0 ? (week.successCount / week.challengeCount * 100) : 0
                    })),
                    summary: {
                        totalPeriod: period,
                        totalChallenges: dailyData.reduce((sum, day) => sum + day.challengeCount, 0),
                        totalSuccess: dailyData.reduce((sum, day) => sum + day.successCount, 0),
                        totalRewards: dailyData.reduce((sum, day) => sum + parseFloat(day.dailyRewards || 0), 0),
                        avgDailyChallenges: (dailyData.reduce((sum, day) => sum + day.challengeCount, 0) / Math.max(1, dailyData.length)).toFixed(2),
                        avgSuccessRate: dailyData.length > 0 ? (dailyData.reduce((sum, day) => sum + (day.successCount / day.challengeCount * 100), 0) / dailyData.length).toFixed(2) : 0
                    }
                };

                return trends;

            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('获取挑战趋势失败:', error);
            throw error;
        }
    }

    /**
     * 获取用户挑战成就统计
     * @param {number} userId 用户ID
     * @returns {Promise<Object>} 成就统计
     */
    static async getUserChallengeAchievements(userId) {
        try {
            const connection = await pool.getConnection();
            
            try {
                // 获取各种成就数据
                const [achievements] = await connection.execute(`
                    SELECT 
                        -- 连续挑战成就
                        MAX(current_consecutive_days) as maxConsecutiveDays,
                        COUNT(CASE WHEN current_consecutive_days >= 7 THEN 1 END) as weekChallenges,
                        COUNT(CASE WHEN current_consecutive_days >= 30 THEN 1 END) as monthChallenges,
                        
                        -- 挑战次数成就
                        COUNT(*) as totalChallenges,
                        COUNT(CASE WHEN status = 'completed' THEN 1 END) as totalCompletions,
                        
                        -- 收益成就
                        SUM(CASE WHEN status = 'completed' THEN reward_amount ELSE 0 END) as totalEarnings,
                        MAX(CASE WHEN status = 'completed' THEN reward_amount ELSE 0 END) as maxSingleReward,
                        
                        -- 等级成就
                        COUNT(DISTINCT vip_level_id) as levelsAttempted,
                        COUNT(CASE WHEN status = 'completed' THEN vip_level_id END) as levelsCompleted
                    FROM vip_challenges 
                    WHERE user_id = ?
                `, [userId]);

                const achievement = achievements[0];

                // 计算成就等级
                const calculateAchievementLevel = (value, thresholds) => {
                    for (let i = thresholds.length - 1; i >= 0; i--) {
                        if (value >= thresholds[i]) {
                            return ['Bronze', 'Silver', 'Gold', 'Diamond', 'King'][i];
                        }
                    }
                    return 'None';
                };

                const achievementsData = {
                    consecutive: {
                        maxDays: achievement.maxConsecutiveDays || 0,
                        weekChallenges: achievement.weekChallenges || 0,
                        monthChallenges: achievement.monthChallenges || 0,
                        level: calculateAchievementLevel(achievement.maxConsecutiveDays || 0, [1, 7, 14, 30, 60])
                    },
                    completion: {
                        totalChallenges: achievement.totalChallenges || 0,
                        totalCompletions: achievement.totalCompletions || 0,
                        completionRate: achievement.totalChallenges > 0 ? (achievement.totalCompletions / achievement.totalChallenges * 100).toFixed(1) : 0,
                        level: calculateAchievementLevel(achievement.totalCompletions || 0, [1, 10, 25, 50, 100])
                    },
                    earnings: {
                        totalEarnings: parseFloat(achievement.totalEarnings || 0),
                        maxSingleReward: parseFloat(achievement.maxSingleReward || 0),
                        avgReward: achievement.totalCompletions > 0 ? (parseFloat(achievement.totalEarnings || 0) / achievement.totalCompletions).toFixed(2) : 0,
                        level: calculateAchievementLevel(parseFloat(achievement.totalEarnings || 0), [10, 50, 100, 500, 1000])
                    },
                    levels: {
                        attempted: achievement.levelsAttempted || 0,
                        completed: achievement.levelsCompleted || 0,
                        completionRate: achievement.levelsAttempted > 0 ? (achievement.levelsCompleted / achievement.levelsAttempted * 100).toFixed(1) : 0,
                        level: calculateAchievementLevel(achievement.levelsCompleted || 0, [1, 3, 5, 7, 10])
                    }
                };

                return achievementsData;

            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('获取挑战成就失败:', error);
            throw error;
        }
    }
}

module.exports = VIPChallengeMySQL;
