const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const vipChallengeController = require('../controllers/vipChallengeController');

const router = express.Router();

// 用户端VIP挑战路由（需要用户认证）

// 获取用户当前挑战
router.get('/current', authenticateToken, vipChallengeController.getCurrentChallenge);

// 开始VIP挑战
router.post('/start', authenticateToken, vipChallengeController.startChallenge);

// 取消VIP挑战
router.put('/:challengeId/cancel', authenticateToken, vipChallengeController.cancelChallenge);

// 完成VIP挑战
router.put('/:challengeId/complete', authenticateToken, vipChallengeController.completeChallenge);

// 获取用户挑战历史
router.get('/history', authenticateToken, vipChallengeController.getUserChallenges);

// 获取挑战统计信息
router.get('/stats', authenticateToken, vipChallengeController.getChallengeStats);

module.exports = router;
