const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// 用户管理路由需要认证和管理员权限
router.use(authenticateToken, requireAdmin);

// 获取所有用户
router.get('/', userController.getAllUsers);

// 获取单个用户
router.get('/:id', userController.getUserById);

// 创建用户
router.post('/', userController.createUser);

// 更新用户
router.put('/:id', userController.updateUser);

// 删除用户
router.delete('/:id', userController.deleteUser);

// 批量更新用户状态
router.patch('/batch-status', userController.batchUpdateStatus);

// ==========================================
// 用户余额管理接口
// ==========================================

// 为用户增加余额
router.post('/balance/add', userController.addUserBalance);

// 为用户减少余额
router.post('/balance/subtract', userController.subtractUserBalance);

// 冻结用户余额
router.post('/balance/freeze', userController.freezeUserBalance);

// 解冻用户余额
router.post('/balance/unfreeze', userController.unfreezeUserBalance);

module.exports = router;
