import VIPLevel from './models/VIPLevel.js';
import UserVIPStatus from './models/UserVIPStatus.js';
import VIPChallenge from './models/VIPChallenge.js';

class VIPChallengeService {
    constructor() {
        // 模拟数据库存储
        this.vipLevels = new Map();
        this.userVIPStatuses = new Map();
        this.vipChallenges = new Map();
        
        // 初始化默认VIP等级
        this.initializeDefaultVIPLevels();
    }

    // 初始化默认VIP等级
    initializeDefaultVIPLevels() {
        const defaultLevels = [
            {
                id: 1,
                name: '青铜挑战',
                description: '适合初学者的基础挑战',
                depositAmount: 500,
                stepTarget: 1000,
                rewardAmount: 0.5,
                maxChallenges: -1,
                duration: 1,
                icon: '🥉',
                color: '#CD7F32'
            },
            {
                id: 2,
                name: '白银挑战',
                description: '中等难度的进阶挑战',
                depositAmount: 1000,
                stepTarget: 3000,
                rewardAmount: 1.5,
                maxChallenges: 50,
                duration: 1,
                icon: '🥈',
                color: '#C0C0C0'
            },
            {
                id: 3,
                name: '黄金挑战',
                description: '高难度的精英挑战',
                depositAmount: 2000,
                stepTarget: 5000,
                rewardAmount: 3.0,
                maxChallenges: 30,
                duration: 1,
                icon: '🥇',
                color: '#FFD700'
            },
            {
                id: 4,
                name: '钻石挑战',
                description: '顶级难度的王者挑战',
                depositAmount: 5000,
                stepTarget: 8000,
                rewardAmount: 8.0,
                maxChallenges: 20,
                duration: 1,
                icon: '💎',
                color: '#B9F2FF'
            },
            {
                id: 5,
                name: '王者挑战',
                description: '终极难度的传奇挑战',
                depositAmount: 10000,
                stepTarget: 12000,
                rewardAmount: 18.0,
                maxChallenges: 10,
                duration: 1,
                icon: '👑',
                color: '#FF6B6B'
            }
        ];

        defaultLevels.forEach(levelData => {
            const level = new VIPLevel(levelData);
            this.vipLevels.set(level.id, level);
        });
    }

    // 获取所有VIP等级
    async getAllVIPLevels() {
        return Array.from(this.vipLevels.values()).map(level => level.getDisplayInfo());
    }

    // 根据ID获取VIP等级
    async getVIPLevelById(id) {
        const level = this.vipLevels.get(parseInt(id));
        return level ? level.getDisplayInfo() : null;
    }

    // 创建新的VIP等级
    async createVIPLevel(levelData) {
        const level = new VIPLevel(levelData);
        
        // 验证数据
        const errors = level.validate();
        if (errors.length > 0) {
            throw new Error(`VIP等级创建失败: ${errors.join(', ')}`);
        }

        // 生成新ID
        const newId = Math.max(...Array.from(this.vipLevels.keys())) + 1;
        level.id = newId;
        
        this.vipLevels.set(level.id, level);
        return level.getDisplayInfo();
    }

    // 更新VIP等级
    async updateVIPLevel(id, levelData) {
        const existingLevel = this.vipLevels.get(parseInt(id));
        if (!existingLevel) {
            throw new Error('VIP等级不存在');
        }

        // 更新数据
        Object.assign(existingLevel, levelData);
        existingLevel.updatedAt = new Date();
        
        // 验证更新后的数据
        const errors = existingLevel.validate();
        if (errors.length > 0) {
            throw new Error(`VIP等级更新失败: ${errors.join(', ')}`);
        }

        return existingLevel.getDisplayInfo();
    }

    // 删除VIP等级
    async deleteVIPLevel(id) {
        const level = this.vipLevels.get(parseInt(id));
        if (!level) {
            throw new Error('VIP等级不存在');
        }

        // 检查是否有用户正在使用此等级
        const activeUsers = Array.from(this.userVIPStatuses.values())
            .filter(status => status.vipLevelId === parseInt(id) && status.isActive);
        
        if (activeUsers.length > 0) {
            throw new Error('无法删除正在使用的VIP等级');
        }

        this.vipLevels.delete(parseInt(id));
        return true;
    }

    // 获取用户VIP状态
    async getUserVIPStatus(userId) {
        let status = this.userVIPStatuses.get(userId);
        
        if (!status) {
            // 创建默认状态
            status = new UserVIPStatus({
                userId,
                vipLevelId: null,
                isActive: false
            });
            this.userVIPStatuses.set(userId, status);
        }

        // 如果有关联的VIP等级，获取等级信息
        if (status.vipLevelId) {
            const vipLevel = this.vipLevels.get(status.vipLevelId);
            if (vipLevel) {
                status.vipLevel = vipLevel;
            }
        }

        return status;
    }

    // 用户升级VIP
    async upgradeVIP(userId, vipLevelId, depositAmount) {
        const vipLevel = this.vipLevels.get(parseInt(vipLevelId));
        if (!vipLevel) {
            throw new Error('VIP等级不存在');
        }

        if (!vipLevel.isActive) {
            throw new Error('该VIP等级已停用');
        }

        if (depositAmount < vipLevel.depositAmount) {
            throw new Error('押金金额不足');
        }

        let userStatus = this.userVIPStatuses.get(userId);
        if (!userStatus) {
            userStatus = new UserVIPStatus({ userId });
            this.userVIPStatuses.set(userId, userStatus);
        }

        // 升级VIP
        userStatus.vipLevelId = vipLevel.id;
        userStatus.depositAmount = depositAmount;
        userStatus.depositDate = new Date();
        userStatus.expireDate = new Date(Date.now() + vipLevel.duration * 24 * 60 * 60 * 1000);
        userStatus.isActive = true;
        userStatus.vipLevel = vipLevel;

        return userStatus;
    }

    // 用户续费VIP
    async renewVIP(userId, durationDays = 30) {
        const userStatus = this.userVIPStatuses.get(userId);
        if (!userStatus || !userStatus.isActive) {
            throw new Error('用户当前没有有效的VIP状态');
        }

        const vipLevel = this.vipLevels.get(userStatus.vipLevelId);
        if (!vipLevel) {
            throw new Error('VIP等级信息不存在');
        }

        // 续费
        userStatus.renewVIP(userStatus.depositAmount, durationDays);
        userStatus.vipLevel = vipLevel;

        return userStatus;
    }

    // 用户取消VIP
    async cancelVIP(userId) {
        const userStatus = this.userVIPStatuses.get(userId);
        if (!userStatus) {
            throw new Error('用户VIP状态不存在');
        }

        userStatus.cancelVIP();
        return userStatus;
    }

    // 创建VIP挑战
    async createVIPChallenge(userId, vipLevelId, challengeType = 'daily') {
        const userStatus = this.userVIPStatuses.get(userId);
        if (!userStatus || !userStatus.isActive) {
            throw new Error('用户需要先升级VIP才能参与挑战');
        }

        const vipLevel = this.vipLevels.get(parseInt(vipLevelId));
        if (!vipLevel) {
            throw new Error('VIP等级不存在');
        }

        // 检查用户是否可以参与挑战
        if (!userStatus.canParticipateChallenge()) {
            throw new Error('用户当前无法参与挑战');
        }

        // 检查每日挑战次数限制
        if (vipLevel.maxChallenges > 0) {
            const todayChallenges = Array.from(this.vipChallenges.values())
                .filter(challenge => 
                    challenge.userId === userId && 
                    challenge.vipLevelId === parseInt(vipLevelId) &&
                    challenge.createdAt.toDateString() === new Date().toDateString()
                ).length;
            
            if (todayChallenges >= vipLevel.maxChallenges) {
                throw new Error('今日挑战次数已达上限');
            }
        }

        // 创建挑战
        const challenge = VIPChallenge.createChallenge(userId, vipLevel, challengeType);
        challenge.id = Date.now(); // 生成临时ID
        
        this.vipChallenges.set(challenge.id, challenge);
        
        // 更新用户统计
        userStatus.updateChallengeStats(false, 0);
        
        return challenge;
    }

    // 获取用户挑战列表
    async getUserChallenges(userId, status = null) {
        let challenges = Array.from(this.vipChallenges.values())
            .filter(challenge => challenge.userId === userId);
        
        if (status) {
            challenges = challenges.filter(challenge => challenge.status === status);
        }

        // 按创建时间倒序排列
        challenges.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return challenges.map(challenge => {
            // 关联VIP等级信息
            if (challenge.vipLevelId) {
                const vipLevel = this.vipLevels.get(challenge.vipLevelId);
                if (vipLevel) {
                    challenge.vipLevel = vipLevel;
                }
            }
            return challenge.getDisplayInfo();
        });
    }

    // 更新挑战步数
    async updateChallengeSteps(challengeId, steps) {
        const challenge = this.vipChallenges.get(parseInt(challengeId));
        if (!challenge) {
            throw new Error('挑战不存在');
        }

        if (!challenge.isActive()) {
            throw new Error('挑战已结束，无法更新步数');
        }

        // 更新步数
        challenge.updateSteps(steps);
        
        // 如果挑战完成，处理奖励
        if (challenge.isCompleted()) {
            await this.processChallengeCompletion(challenge);
        }

        return challenge.getDisplayInfo();
    }

    // 处理挑战完成
    async processChallengeCompletion(challenge) {
        const userStatus = this.userVIPStatuses.get(challenge.userId);
        if (userStatus) {
            // 更新用户统计
            userStatus.updateChallengeStats(true, challenge.rewardAmount);
        }

        // 这里可以添加奖励发放逻辑
        // 例如：调用钱包服务发放USDT奖励
        console.log(`用户 ${challenge.userId} 完成挑战，获得奖励 ${challenge.rewardAmount} USDT`);
    }

    // 获取挑战统计
    async getChallengeStats(userId = null) {
        let challenges = Array.from(this.vipChallenges.values());
        
        if (userId) {
            challenges = challenges.filter(challenge => challenge.userId === userId);
        }

        const totalChallenges = challenges.length;
        const completedChallenges = challenges.filter(c => c.isCompleted()).length;
        const activeChallenges = challenges.filter(c => c.isActive()).length;
        const totalRewards = challenges
            .filter(c => c.isCompleted())
            .reduce((sum, c) => sum + c.rewardAmount, 0);

        return {
            totalChallenges,
            completedChallenges,
            activeChallenges,
            successRate: totalChallenges > 0 ? 
                ((completedChallenges / totalChallenges) * 100).toFixed(2) + '%' : '0%',
            totalRewards
        };
    }

    // 获取排行榜
    async getLeaderboard(limit = 10) {
        const userStats = new Map();
        
        // 统计每个用户的挑战数据
        Array.from(this.vipChallenges.values()).forEach(challenge => {
            if (!userStats.has(challenge.userId)) {
                userStats.set(challenge.userId, {
                    userId: challenge.userId,
                    totalChallenges: 0,
                    completedChallenges: 0,
                    totalRewards: 0,
                    currentStreak: 0
                });
            }
            
            const stats = userStats.get(challenge.userId);
            stats.totalChallenges++;
            
            if (challenge.isCompleted()) {
                stats.completedChallenges++;
                stats.totalRewards += challenge.rewardAmount;
            }
        });

        // 转换为数组并排序
        const leaderboard = Array.from(userStats.values())
            .map(stats => ({
                ...stats,
                successRate: stats.totalChallenges > 0 ? 
                    ((stats.completedChallenges / stats.totalChallenges) * 100).toFixed(2) + '%' : '0%'
            }))
            .sort((a, b) => b.totalRewards - a.totalRewards)
            .slice(0, limit);

        return leaderboard;
    }
}

export default VIPChallengeService;
