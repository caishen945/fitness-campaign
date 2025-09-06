const express = require('express');
const router = express.Router();
const pkChallengeController = require('../controllers/pkChallengeController');
const { authenticateToken } = require('../middleware/authMiddleware');

// 所有PK挑战路由都需要认证
router.use(authenticateToken);

// 获取用户的PK挑战列表
router.get('/challenges', pkChallengeController.getUserChallenges);

// 获取单个PK挑战详情
router.get('/challenges/:challengeId', pkChallengeController.getChallengeDetails);

// 创建新的PK挑战
router.post('/challenges', pkChallengeController.createChallenge);

// 接受PK挑战
router.post('/challenges/:challengeId/accept', pkChallengeController.acceptChallenge);

// 拒绝PK挑战
router.post('/challenges/:challengeId/reject', pkChallengeController.rejectChallenge);

// 取消PK挑战
router.post('/challenges/:challengeId/cancel', pkChallengeController.cancelChallenge);

// 提交步数
router.post('/challenges/:challengeId/steps', pkChallengeController.submitSteps);

// 发送消息
router.post('/challenges/:challengeId/messages', pkChallengeController.sendMessage);

// 标记消息为已读
router.post('/messages/:messageId/read', pkChallengeController.markMessageRead);

// 搜索用户（用于创建挑战时选择对手）
router.get('/users/search', pkChallengeController.searchUsers);

module.exports = router;
