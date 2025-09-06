const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { verifyAdminToken } = require('../middleware/adminAuthMiddleware');

// ==================== 用户路由 ====================

// 获取用户团队信息
router.get('/info', authenticateToken, teamController.getTeamInfo);

// 获取团队成员列表
router.get('/members', authenticateToken, teamController.getTeamMembers);

// 获取返佣记录
router.get('/commissions', authenticateToken, teamController.getCommissionRecords);

// 获取邀请奖励记录
router.get('/invitation-rewards', authenticateToken, teamController.getInvitationRewards);

// ==================== 管理员路由 ====================

// 获取所有团队统计
router.get('/admin/statistics', verifyAdminToken, teamController.getAllTeamStatistics);

// 获取指定用户的团队详情
router.get('/admin/users/:userId', verifyAdminToken, teamController.getUserTeamDetail);

// 获取团队配置
router.get('/admin/config', verifyAdminToken, teamController.getTeamConfig);

// 更新团队配置
router.put('/admin/config', verifyAdminToken, teamController.updateTeamConfig);

// 获取所有返佣记录
router.get('/admin/commissions', verifyAdminToken, teamController.getAllCommissionRecords);

// 获取所有邀请奖励记录
router.get('/admin/invitation-rewards', verifyAdminToken, teamController.getAllInvitationRewards);

module.exports = router;
