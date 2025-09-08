const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const { pool } = require('../config/database');
const notificationService = require('../services/notificationService');

const router = express.Router();
router.use(authenticateToken, requireAdmin);

// 创建批次（草稿）
router.post('/', async (req, res) => {
    try {
        const { name, description, filters } = req.body || {};
        if (!name) return res.status(400).json({ success: false, message: '缺少批次名称' });
        const [r] = await pool.query('INSERT INTO notification_batches (name, description, creator_admin_id, status, filters, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())', [name, description || null, req.user.id, 'draft', JSON.stringify(filters || {})]);
        return res.status(201).json({ success: true, message: '批次创建成功', data: { id: r.insertId } });
    } catch (e) {
        return res.status(500).json({ success: false, message: '批次创建失败', error: e.message });
    }
});

// 预览（基于简单过滤 user_id 列表）
router.post('/:id/preview', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { userIds = [] } = req.body || {};
        if (!id) return res.status(400).json({ success: false, message: '无效批次ID' });
        return res.json({ success: true, data: { userIds, totalRecipients: userIds.length } });
    } catch (e) {
        return res.status(500).json({ success: false, message: '生成预览失败', error: e.message });
    }
});

// 调度批次发送（直接入队多个任务）
router.post('/:id/schedule', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { title, message, userIds = [] } = req.body || {};
        if (!id) return res.status(400).json({ success: false, message: '无效批次ID' });
        if (!title || !message) return res.status(400).json({ success: false, message: '缺少标题或内容' });
        if (!Array.isArray(userIds) || userIds.length === 0) return res.status(400).json({ success: false, message: '缺少用户列表' });

        // 标记处理中
        await pool.query('UPDATE notification_batches SET status = ?, total_recipients = ?, updated_at = NOW() WHERE id = ?', ['processing', userIds.length, id]);

        // 并发入队
        const results = await Promise.all(userIds.map(uid => notificationService.sendToUser(uid, title, message, { channels: ['web'] })));
        const sent = results.filter(r => r.queued).length;
        const failed = results.length - sent;
        await pool.query('UPDATE notification_batches SET status = ?, sent_count = ?, failed_count = ?, updated_at = NOW() WHERE id = ?', ['completed', sent, failed, id]);

        return res.json({ success: true, message: '批次已调度', data: { id, sent, failed } });
    } catch (e) {
        return res.status(500).json({ success: false, message: '批次调度失败', error: e.message });
    }
});

module.exports = router;


