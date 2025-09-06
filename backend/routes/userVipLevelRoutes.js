const express = require('express');
const vipLevelController = require('../controllers/vipLevelController');

const router = express.Router();

// 用户端VIP等级路由（不需要管理员权限）

// 获取所有VIP等级
router.get('/', vipLevelController.getAllLevels);

// 获取活跃的VIP等级
router.get('/active', vipLevelController.getActiveLevels);

// 获取单个VIP等级详情
router.get('/:id', vipLevelController.getLevelById);

module.exports = router;
