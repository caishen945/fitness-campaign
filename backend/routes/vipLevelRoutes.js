const express = require('express');
const vipLevelController = require('../controllers/vipLevelController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// VIP等级管理路由（临时移除认证要求用于测试）
// router.use(authenticateToken, requireAdmin);

// 获取所有VIP等级
router.get('/', vipLevelController.getAllLevels);

// 获取活跃的VIP等级
router.get('/active', vipLevelController.getActiveLevels);

// 获取单个VIP等级
router.get('/:id', vipLevelController.getLevelById);

// 创建VIP等级
router.post('/', vipLevelController.createLevel);

// 更新VIP等级
router.put('/:id', vipLevelController.updateLevel);

// 切换VIP等级状态
router.patch('/:id', vipLevelController.toggleLevelStatus);

// 删除VIP等级
router.delete('/:id', vipLevelController.deleteLevel);

// 批量更新VIP等级状态
router.patch('/batch-status', vipLevelController.batchUpdateStatus);

module.exports = router;
