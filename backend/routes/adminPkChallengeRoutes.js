const express = require('express');
const router = express.Router();
const adminPkChallengeController = require('../controllers/adminPkChallengeController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// 所有路由都需要认证和管理员权限
router.use(authenticateToken);
router.use(requireAdmin);

// 获取所有PK挑战
router.get('/challenges', adminPkChallengeController.getAllChallenges);

// 获取单个PK挑战详情
router.get('/challenges/:challengeId', adminPkChallengeController.getChallengeDetails);

// 取消PK挑战
router.post('/challenges/:challengeId/cancel', adminPkChallengeController.cancelChallenge);

// 手动结算PK挑战
router.post('/challenges/:challengeId/settle', adminPkChallengeController.settleChallenge);

// 管理用户PK权限
router.put('/users/:userId/pk-permission', adminPkChallengeController.managePkPermission);

module.exports = router;
