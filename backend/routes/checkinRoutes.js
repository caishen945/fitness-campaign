const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const checkinController = require('../controllers/checkinController');

const router = express.Router();

// 获取签到信息
router.get('/info', authenticateToken, checkinController.getUserCheckinInfo);

// 用户签到
router.post('/', authenticateToken, checkinController.checkin);

module.exports = router;
