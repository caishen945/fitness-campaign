const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { pool } = require('../config/database');

const router = express.Router();
router.use(authenticateToken);

// 获取偏好
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await pool.query('SELECT user_id, channel_preferences, mute_all, timezone, quiet_hours_start, quiet_hours_end FROM user_notification_settings WHERE user_id = ? LIMIT 1', [userId]);
        return res.json({ success: true, data: rows && rows[0] ? rows[0] : null });
    } catch (e) {
        return res.status(500).json({ success: false, message: '获取偏好失败', error: e.message });
    }
});

// 更新偏好
router.put('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const { channel_preferences, mute_all, timezone, quiet_hours_start, quiet_hours_end } = req.body || {};
        const [rows] = await pool.query('SELECT user_id FROM user_notification_settings WHERE user_id = ? LIMIT 1', [userId]);
        if (rows && rows.length > 0) {
            await pool.query('UPDATE user_notification_settings SET channel_preferences = ?, mute_all = ?, timezone = ?, quiet_hours_start = ?, quiet_hours_end = ?, updated_at = NOW() WHERE user_id = ?', [channel_preferences ? JSON.stringify(channel_preferences) : null, !!mute_all, timezone || null, quiet_hours_start || null, quiet_hours_end || null, userId]);
        } else {
            await pool.query('INSERT INTO user_notification_settings (user_id, channel_preferences, mute_all, timezone, quiet_hours_start, quiet_hours_end, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())', [userId, channel_preferences ? JSON.stringify(channel_preferences) : null, !!mute_all, timezone || null, quiet_hours_start || null, quiet_hours_end || null]);
        }
        return res.json({ success: true, message: '偏好已更新' });
    } catch (e) {
        return res.status(500).json({ success: false, message: '更新偏好失败', error: e.message });
    }
});

module.exports = router;


