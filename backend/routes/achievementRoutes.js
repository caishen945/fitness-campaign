const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// ==================== 用户端路由 ====================

// 获取用户成就列表
router.get('/user/achievements', authenticateToken, achievementController.getUserAchievements);

// 领取成就奖励
router.post('/user/claim/:achievementId', authenticateToken, achievementController.claimAchievement);

// 获取用户成就进度
router.get('/user/progress', authenticateToken, achievementController.getUserProgress);

// ==================== 管理员路由 ====================

// 获取成就类型列表
router.get('/admin/types', authenticateToken, requireAdmin, achievementController.getAchievementTypes);

// 获取所有成就
router.get('/admin/achievements', authenticateToken, requireAdmin, achievementController.getAllAchievements);

// 创建新成就
router.post('/admin/achievements', authenticateToken, requireAdmin, achievementController.createAchievement);

// 更新成就
router.put('/admin/achievements/:id', authenticateToken, requireAdmin, achievementController.updateAchievement);

// 删除成就
router.delete('/admin/achievements/:id', authenticateToken, requireAdmin, achievementController.deleteAchievement);

// 切换成就启用状态
router.put('/admin/achievements/:id/toggle', authenticateToken, requireAdmin, achievementController.toggleAchievement);

// 获取成就统计信息
router.get('/admin/stats', authenticateToken, requireAdmin, achievementController.getAchievementStats);

// 管理员查看指定用户的成就
router.get('/admin/users/:userId/achievements', authenticateToken, requireAdmin, achievementController.getUserAchievementsByAdmin);

module.exports = router;
