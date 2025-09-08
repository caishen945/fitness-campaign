const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const { pool } = require('../config/database');

const router = express.Router();
router.use(authenticateToken, requireAdmin);

// GET /admin/notification-deliveries
router.get('/deliveries', async (req, res) => {
    try {
        const { status, channel, notificationId, userId, page = 1, limit = 20 } = req.query;
        const where = [];
        const params = [];
        if (status) { where.push('d.status = ?'); params.push(status); }
        if (channel) { where.push('d.channel = ?'); params.push(channel); }
        if (notificationId) { where.push('d.notification_id = ?'); params.push(parseInt(notificationId)); }
        if (userId) { where.push('n.user_id = ?'); params.push(parseInt(userId)); }
        const whereClause = where.length ? ('WHERE ' + where.join(' AND ')) : '';
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const [countRows] = await pool.query(
            `SELECT COUNT(*) as total FROM notification_deliveries d JOIN notifications n ON d.notification_id = n.id ${whereClause}`,
            params
        );
        const total = countRows[0]?.total || 0;
        const [rows] = await pool.query(
            `SELECT d.*, n.user_id, n.title, n.message FROM notification_deliveries d JOIN notifications n ON d.notification_id = n.id ${whereClause} ORDER BY d.created_at DESC LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );
        return res.json({ success: true, data: { deliveries: rows, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } } });
    } catch (e) {
        return res.status(500).json({ success: false, message: '获取投递记录失败', error: e.message });
    }
});

// GET /admin/notification-batches/:id
router.get('/batches/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const [rows] = await pool.query('SELECT * FROM notification_batches WHERE id = ? LIMIT 1', [id]);
        return res.json({ success: true, data: rows && rows[0] ? rows[0] : null });
    } catch (e) {
        return res.status(500).json({ success: false, message: '获取批次失败', error: e.message });
    }
});

// GET /admin/notifications/stats
router.get('/stats', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT channel, status, COUNT(*) as count FROM notification_deliveries GROUP BY channel, status`
        );
        return res.json({ success: true, data: rows });
    } catch (e) {
        return res.status(500).json({ success: false, message: '获取统计失败', error: e.message });
    }
});

module.exports = router;


