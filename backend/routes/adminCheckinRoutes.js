const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const adminCheckinController = require('../controllers/adminCheckinController');

const router = express.Router();

// 所有路由都需要管理员权限
router.use(authenticateToken, requireAdmin);

// 获取签到系统概览
router.get('/overview', adminCheckinController.getCheckinOverview);

// 获取所有用户的签到统计
router.get('/stats', adminCheckinController.getAllCheckinStats);

// 获取特定用户的签到详情
router.get('/user/:userId', adminCheckinController.getUserCheckinDetails);

// 手动为用户添加签到记录
router.post('/manual', adminCheckinController.addManualCheckin);

// 删除用户签到记录
router.delete('/:checkinId', adminCheckinController.deleteCheckin);

// 获取签到配置
router.get('/config', adminCheckinController.getCheckinConfig);

// 更新签到配置
router.put('/config', adminCheckinController.updateCheckinConfig);

module.exports = router;
