const express = require('express');
const router = express.Router();

// 团队配置
router.get('/config', async (req, res) => {
    try {
        // 模拟团队配置数据
        const config = {
            commissionRates: {
                level1: 0.05,  // 一级返佣比例 5%
                level2: 0.03,  // 二级返佣比例 3%
                level3: 0.01   // 三级返佣比例 1%
            },
            invitationRewards: {
                baseReward: 10.00,      // 基础邀请奖励
                vipBonus: 5.00,         // VIP用户额外奖励
                achievementBonus: 2.00   // 成就用户额外奖励
            },
            teamRequirements: {
                minTeamSize: 5,         // 最小团队规模
                minActiveMembers: 3,    // 最小活跃成员数
                minMonthlyVolume: 1000  // 最小月度交易量
            },
            isEnabled: true,
            updatedAt: new Date().toISOString()
        };
        
        res.json({
            success: true,
            data: config,
            message: '获取团队配置成功'
        });
        
    } catch (error) {
        console.error('获取团队配置失败:', error);
        res.status(500).json({
            success: false,
            message: '获取团队配置失败',
            error: error.message
        });
    }
});

// 更新团队配置
router.put('/config', async (req, res) => {
    try {
        const configData = req.body;
        
        // 实际应该更新数据库中的团队配置
        console.log('更新团队配置:', configData);
        
        res.json({
            success: true,
            message: '团队配置更新成功'
        });
        
    } catch (error) {
        console.error('更新团队配置失败:', error);
        res.status(500).json({
            success: false,
            message: '更新团队配置失败',
            error: error.message
        });
    }
});

// 返佣记录
router.get('/commissions', async (req, res) => {
    try {
        const { page = 1, limit = 20, status, userId, startDate, endDate } = req.query;
        
        // 模拟返佣记录数据
        const commissions = [
            {
                id: 1,
                userId: 123,
                username: '用户001',
                inviteeId: 456,
                inviteeName: '被邀请用户001',
                amount: 50.00,
                rate: 0.05,
                type: 'invitation',
                level: 1,
                status: 'paid',
                createdAt: new Date().toISOString(),
                paidAt: new Date().toISOString()
            },
            {
                id: 2,
                userId: 124,
                username: '用户002',
                inviteeId: 457,
                inviteeName: '被邀请用户002',
                amount: 30.00,
                rate: 0.03,
                type: 'commission',
                level: 2,
                status: 'pending',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                paidAt: null
            }
        ];
        
        res.json({
            success: true,
            data: commissions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: commissions.length,
                totalPages: Math.ceil(commissions.length / limit)
            },
            message: '获取返佣记录成功'
        });
        
    } catch (error) {
        console.error('获取返佣记录失败:', error);
        res.status(500).json({
            success: false,
            message: '获取返佣记录失败',
            error: error.message
        });
    }
});

// 邀请奖励记录
router.get('/invitation-rewards', async (req, res) => {
    try {
        const { page = 1, limit = 20, status, userId, startDate, endDate } = req.query;
        
        // 模拟邀请奖励记录数据
        const rewards = [
            {
                id: 1,
                userId: 123,
                username: '用户001',
                inviteeId: 456,
                inviteeName: '被邀请用户001',
                baseReward: 10.00,
                bonusReward: 5.00,
                totalReward: 15.00,
                status: 'paid',
                createdAt: new Date().toISOString(),
                paidAt: new Date().toISOString()
            },
            {
                id: 2,
                userId: 124,
                username: '用户002',
                inviteeId: 457,
                inviteeName: '被邀请用户002',
                baseReward: 10.00,
                bonusReward: 0.00,
                totalReward: 10.00,
                status: 'pending',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                paidAt: null
            }
        ];
        
        res.json({
            success: true,
            data: rewards,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: rewards.length,
                totalPages: Math.ceil(rewards.length / limit)
            },
            message: '获取邀请奖励记录成功'
        });
        
    } catch (error) {
        console.error('获取邀请奖励记录失败:', error);
        res.status(500).json({
            success: false,
            message: '获取邀请奖励记录失败',
            error: error.message
        });
    }
});

module.exports = router;