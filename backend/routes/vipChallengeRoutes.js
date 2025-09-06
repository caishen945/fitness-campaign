const express = require('express');
const vipChallengeController = require('../controllers/vipChallengeController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const vipChallengeModel = require('../models/VIPChallengeMySQL'); // Fixed import path

const router = express.Router();

// 管理员查询挑战记录路由（临时移除认证要求用于测试）
// router.use(authenticateToken, requireAdmin);

// 获取所有挑战记录（管理员查询）
router.get('/', vipChallengeController.getAllChallenges);

// 获取挑战统计信息
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // 获取挑战统计信息
        const stats = await vipChallengeModel.getUserChallengeStats(userId);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('获取挑战统计失败:', error);
        res.status(500).json({
            success: false,
            message: '获取挑战统计失败',
            error: error.message
        });
    }
});

// 获取用户挑战历史记录
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, status, levelId } = req.query;
        
        // 获取挑战历史记录
        const history = await vipChallengeModel.getUserChallengeHistory(userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            status,
            levelId: levelId ? parseInt(levelId) : undefined
        });
        
        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('获取挑战历史失败:', error);
        res.status(500).json({
            success: false,
            message: '获取挑战历史失败',
            error: error.message
        });
    }
});

// 获取用户挑战进度详情
router.get('/progress/:challengeId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const challengeId = parseInt(req.params.challengeId);
        
        // 验证挑战所有权
        const challenge = await vipChallengeModel.getById(challengeId);
        if (!challenge || challenge.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: '无权访问此挑战记录'
            });
        }
        
        // 获取挑战进度详情
        const progress = await vipChallengeModel.getChallengeProgress(challengeId);
        
        res.json({
            success: true,
            data: progress
        });
    } catch (error) {
        console.error('获取挑战进度失败:', error);
        res.status(500).json({
            success: false,
            message: '获取挑战进度失败',
            error: error.message
        });
    }
});

// 获取用户挑战趋势分析
router.get('/trends', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { period = '30' } = req.query; // 默认30天
        
        // 获取挑战趋势数据
        const trends = await vipChallengeModel.getUserChallengeTrends(userId, parseInt(period));
        
        res.json({
            success: true,
            data: trends
        });
    } catch (error) {
        console.error('获取挑战趋势失败:', error);
        res.status(500).json({
            success: false,
            message: '获取挑战趋势失败',
            error: error.message
        });
    }
});

// 获取用户挑战成就统计
router.get('/achievements', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // 获取挑战成就统计
        const achievements = await vipChallengeModel.getUserChallengeAchievements(userId);
        
        res.json({
            success: true,
            data: achievements
        });
    } catch (error) {
        console.error('获取挑战成就失败:', error);
        res.status(500).json({
            success: false,
            message: '获取挑战成就失败',
            error: error.message
        });
    }
});

// 获取单个挑战记录详情
router.get('/:id', vipChallengeController.getChallengeById);

// 获取用户挑战记录
router.get('/user/:userId', vipChallengeController.getUserChallenges);

// 管理员手动完成挑战
router.patch('/:id/complete', vipChallengeController.adminCompleteChallenge);

// 管理员手动取消挑战
router.patch('/:id/cancel', vipChallengeController.adminCancelChallenge);

module.exports = router;
