class VIPChallenge {
    constructor(data = {}) {
        this.id = data.id || null;
        this.userId = data.userId || null;
        this.vipLevelId = data.vipLevelId || null;
        this.challengeType = data.challengeType || 'daily'; // daily, weekly, monthly
        this.stepTarget = data.stepTarget || 0; // 步数目标
        this.currentSteps = data.currentSteps || 0; // 当前步数
        this.startDate = data.startDate || new Date(); // 挑战开始时间
        this.endDate = data.endDate || null; // 挑战结束时间
        this.status = data.status || 'active'; // active, completed, failed, cancelled
        this.depositAmount = data.depositAmount || 0; // 押金金额
        this.rewardAmount = data.rewardAmount || 0; // 奖励金额
        this.completedAt = data.completedAt || null; // 完成时间
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
        
        // 新增字段：连续挑战支持
        this.requiredConsecutiveDays = data.requiredConsecutiveDays || 1; // 需要连续完成的天数
        this.currentConsecutiveDays = data.currentConsecutiveDays || 0; // 当前连续完成的天数
        this.failedDays = data.failedDays || 0; // 失败的天数
        this.maxFailedDays = data.maxFailedDays || 3; // 最大允许失败天数
        this.dailyReward = data.dailyReward || 0; // 每日完成奖励
        this.finalReward = data.finalReward || 0; // 最终完成奖励（连续完成所有天数后）
        this.partialRefundRatio = data.partialRefundRatio || 0.8; // 部分失败时的押金退还比例
        
        // 关联信息
        this.vipLevel = data.vipLevel || null;
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

    // 检查挑战是否进行中
    isActive() {
        return this.status === 'active' && new Date() <= new Date(this.endDate);
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
            roi: this.depositAmount > 0 ? 
                ((this.rewardAmount - this.depositAmount) / this.depositAmount * 100).toFixed(2) + '%' : '0%'
        };
    }

    // 转换为数据库记录
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
            updated_at: this.updatedAt
        };
    }

    // 从数据库记录创建实例
    static fromDatabase(data) {
        return new VIPChallenge({
            id: data.id,
            userId: data.user_id,
            vipLevelId: data.vip_level_id,
            challengeType: data.challenge_type,
            stepTarget: data.step_target,
            currentSteps: data.current_steps,
            startDate: data.start_date,
            endDate: data.end_date,
            status: data.status,
            depositAmount: data.deposit_amount,
            rewardAmount: data.reward_amount,
            completedAt: data.completed_at,
            createdAt: data.created_at,
            updatedAt: data.updated_at
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
        
        return new VIPChallenge({
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
}

module.exports = VIPChallenge;
