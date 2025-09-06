class UserVIPStatus {
    constructor(data = {}) {
        this.id = data.id || null;
        this.userId = data.userId || null;
        this.vipLevelId = data.vipLevelId || null;
        this.depositAmount = data.depositAmount || 0; // 已缴纳的押金
        this.depositDate = data.depositDate || null; // 押金缴纳时间
        this.expireDate = data.expireDate || null; // VIP到期时间
        this.isActive = data.isActive !== undefined ? data.isActive : false;
        this.totalChallenges = data.totalChallenges || 0; // 总挑战次数
        this.completedChallenges = data.completedChallenges || 0; // 完成挑战次数
        this.totalRewards = data.totalRewards || 0; // 总获得奖励
        this.currentStreak = data.currentStreak || 0; // 当前连续完成天数
        this.longestStreak = data.longestStreak || 0; // 最长连续完成天数
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
        
        // 关联的VIP等级信息
        this.vipLevel = data.vipLevel || null;
    }

    // 验证VIP状态
    validate() {
        const errors = [];
        
        if (!this.userId) {
            errors.push('用户ID不能为空');
        }
        
        if (!this.vipLevelId) {
            errors.push('VIP等级ID不能为空');
        }
        
        if (this.depositAmount < 0) {
            errors.push('押金金额不能为负数');
        }
        
        return errors;
    }

    // 检查VIP是否有效
    isVIPValid() {
        if (!this.isActive) return false;
        if (!this.expireDate) return false;
        return new Date() <= new Date(this.expireDate);
    }

    // 检查是否可以参与挑战
    canParticipateChallenge() {
        if (!this.isVIPValid()) return false;
        
        // 检查每日挑战次数限制
        if (this.vipLevel && this.vipLevel.maxChallenges > 0) {
            // 这里需要结合具体的挑战记录来判断今日是否已达到限制
            // 暂时返回true，具体逻辑在服务层实现
            return true;
        }
        
        return true;
    }

    // 计算VIP等级的投资回报率
    calculateROI() {
        if (this.depositAmount <= 0) return 0;
        return ((this.totalRewards - this.depositAmount) / this.depositAmount * 100);
    }

    // 获取VIP状态统计
    getStats() {
        return {
            totalChallenges: this.totalChallenges,
            completedChallenges: this.completedChallenges,
            successRate: this.totalChallenges > 0 ? 
                ((this.completedChallenges / this.totalChallenges) * 100).toFixed(2) + '%' : '0%',
            totalRewards: this.totalRewards,
            currentStreak: this.currentStreak,
            longestStreak: this.longestStreak,
            roi: this.calculateROI().toFixed(2) + '%',
            isActive: this.isVIPValid()
        };
    }

    // 转换为数据库记录
    toDatabase() {
        return {
            id: this.id,
            user_id: this.userId,
            vip_level_id: this.vipLevelId,
            deposit_amount: this.depositAmount,
            deposit_date: this.depositDate,
            expire_date: this.expireDate,
            is_active: this.isActive,
            total_challenges: this.totalChallenges,
            completed_challenges: this.completedChallenges,
            total_rewards: this.totalRewards,
            current_streak: this.currentStreak,
            longest_streak: this.longestStreak,
            created_at: this.createdAt,
            updated_at: this.updatedAt
        };
    }

    // 从数据库记录创建实例
    static fromDatabase(data) {
        return new UserVIPStatus({
            id: data.id,
            userId: data.user_id,
            vipLevelId: data.vip_level_id,
            depositAmount: data.deposit_amount,
            depositDate: data.deposit_date,
            expireDate: data.expire_date,
            isActive: data.is_active,
            totalChallenges: data.total_challenges,
            completedChallenges: data.completed_challenges,
            totalRewards: data.total_rewards,
            currentStreak: data.current_streak,
            longestStreak: data.longest_streak,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        });
    }

    // 更新挑战统计
    updateChallengeStats(completed, reward = 0) {
        this.totalChallenges++;
        if (completed) {
            this.completedChallenges++;
            this.currentStreak++;
            this.totalRewards += reward;
            
            // 更新最长连续记录
            if (this.currentStreak > this.longestStreak) {
                this.longestStreak = this.currentStreak;
            }
        } else {
            this.currentStreak = 0;
        }
        
        this.updatedAt = new Date();
    }

    // 续费VIP
    renewVIP(depositAmount, durationDays) {
        this.depositAmount = depositAmount;
        this.depositDate = new Date();
        this.expireDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
        this.isActive = true;
        this.updatedAt = new Date();
    }

    // 取消VIP
    cancelVIP() {
        this.isActive = false;
        this.expireDate = new Date();
        this.updatedAt = new Date();
    }
}

export default UserVIPStatus;
