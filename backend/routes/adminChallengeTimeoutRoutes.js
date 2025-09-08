const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const challengeTimeoutService = require('../services/challengeTimeoutService');

const router = express.Router();

// 所有路由需管理员鉴权
router.use(authenticateToken, requireAdmin);

// 获取服务状态
router.get('/status', (req, res) => {
    try {
        return res.json({ success: true, data: challengeTimeoutService.getStatus() });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

// 启动服务
router.post('/start', (req, res) => {
    try {
        challengeTimeoutService.start();
        return res.json({ success: true, message: '服务已启动', data: challengeTimeoutService.getStatus() });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

// 停止服务
router.post('/stop', (req, res) => {
    try {
        challengeTimeoutService.stop();
        return res.json({ success: true, message: '服务已停止', data: challengeTimeoutService.getStatus() });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

// 手动执行一次检查
router.post('/run-once', async (req, res) => {
    try {
        await challengeTimeoutService.manualCheck();
        return res.json({ success: true, message: '已手动执行检查', data: challengeTimeoutService.getStatus() });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

// 更新配置（仅允许修改间隔）
router.post('/config', (req, res) => {
    try {
        const { intervalMs } = req.body || {};
        if (!Number.isFinite(Number(intervalMs)) || Number(intervalMs) <= 0) {
            return res.status(400).json({ success: false, message: 'intervalMs 必须为正数' });
        }
        challengeTimeoutService.setCheckInterval(Number(intervalMs));
        return res.json({ success: true, message: '配置已更新', data: challengeTimeoutService.getStatus() });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

module.exports = router;


