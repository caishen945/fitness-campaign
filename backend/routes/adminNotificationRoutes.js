const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const { pool } = require('../config/database');
const notificationService = require('../services/notificationService');
const { recordAdminAction } = require('../services/auditService');
const ExcelJS = require('exceljs');
const { resolveTemplate, renderMessage } = require('../services/templateService');
const { isRedisEnabled } = require('../config/featureFlags');
const { getQueue } = require('../services/notificationQueueService');

const router = express.Router();

// 所有管理员通知路由均需认证与管理员权限
router.use(authenticateToken, requireAdmin);

// 工具：通过邮箱解析用户ID（若提供email）
async function resolveUserIdByEmail(email) {
    if (!email) return null;
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    return rows && rows.length > 0 ? rows[0].id : null;
}

// GET /admin/notifications 查询通知（支持 userId/email/isRead/page/limit）
router.get('/', async (req, res) => {
    try {
        const { userId, email, isRead, page = 1, limit = 20, from, to, channel, status, keyword } = req.query;

        let resolvedUserId = userId ? parseInt(userId) : null;
        if (!resolvedUserId && email) {
            resolvedUserId = await resolveUserIdByEmail(email);
            if (!resolvedUserId) {
                return res.json({
                    success: true,
                    data: { notifications: [], pagination: { page: parseInt(page), limit: parseInt(limit), total: 0, pages: 0 } },
                    message: '未找到匹配邮箱的用户'
                });
            }
        }

        const where = [];
        const params = [];
        if (resolvedUserId) { where.push('n.user_id = ?'); params.push(resolvedUserId); }
        if (typeof isRead !== 'undefined') { where.push('n.is_read = ?'); params.push(isRead === 'true' ? 1 : 0); }
        if (from) { where.push('n.created_at >= ?'); params.push(from); }
        if (to) { where.push('n.created_at <= ?'); params.push(to); }
        if (keyword) { where.push('(n.title LIKE ? OR n.message LIKE ?)'); params.push(`%${keyword}%`, `%${keyword}%`); }
        if (channel) { where.push('EXISTS (SELECT 1 FROM notification_deliveries d WHERE d.notification_id = n.id AND d.channel = ?)'); params.push(channel); }
        if (status) { where.push('EXISTS (SELECT 1 FROM notification_deliveries d2 WHERE d2.notification_id = n.id AND d2.status = ?)'); params.push(status); }

        const whereClause = where.length > 0 ? ('WHERE ' + where.join(' AND ')) : '';
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM notifications n ${whereClause}`, params);
        const total = countRows[0]?.total || 0;

        const [rows] = await pool.query(
            `SELECT n.id, n.user_id, n.title, n.message, n.is_read, n.created_at
             FROM notifications n
             ${whereClause}
             ORDER BY n.created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        return res.json({
            success: true,
            data: {
                notifications: rows || [],
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            },
            message: '获取通知列表成功'
        });
    } catch (error) {
        console.error('管理员获取通知列表失败:', error);
        return res.status(500).json({ success: false, message: '获取通知列表失败', error: error.message });
    }
});

// POST /admin/notifications 发送单用户通知
router.post('/', async (req, res) => {
    try {
        const { userId, title, message, email } = req.body || {};

        let targetUserId = userId ? parseInt(userId) : null;
        if (!targetUserId && email) {
            targetUserId = await resolveUserIdByEmail(email);
        }

        if (!targetUserId || !title || !message) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数',
                required: ['userId 或 email', 'title', 'message']
            });
        }

        // 校验用户是否存在
        const [userRows] = await pool.query('SELECT id FROM users WHERE id = ? LIMIT 1', [targetUserId]);
        if (!userRows || userRows.length === 0) {
            return res.status(404).json({ success: false, message: '用户不存在' });
        }

        // 使用通知服务统一入队与限流
        const result = await notificationService.sendToUser(targetUserId, title, message, { channels: ['web'] });
        if (!result.queued) {
            return res.status(429).json({ success: false, message: '通知被限流' });
        }
        await recordAdminAction(req, 'admin_send_notification', 'notification', result.jobId, `title=${title}`);
        return res.status(202).json({ success: true, message: '通知已入队处理', data: { jobId: result.jobId, userId: targetUserId, title, message } });
    } catch (error) {
        console.error('管理员发送通知失败:', error);
        return res.status(500).json({ success: false, message: '发送通知失败', error: error.message });
    }
});

// 批量发送（模板 + 渠道 + 人群）
router.post('/send', async (req, res) => {
    try {
        const { channels, template_key, variables = {}, target } = req.body || {};
        if (!Array.isArray(channels) || channels.length === 0) {
            return res.status(400).json({ success: false, message: '缺少或无效的 channels' });
        }
        if (!template_key) {
            return res.status(400).json({ success: false, message: '缺少 template_key' });
        }

        // 检查队列可用
        if (!isRedisEnabled()) {
            return res.status(503).json({ success: false, message: '队列不可用（Redis 未启用）' });
        }
        // 触发连接初始化（若抛错由下方捕获）
        getQueue();

        // 解析用户集合
        let userIds = [];
        if (target?.user_ids && Array.isArray(target.user_ids)) {
            userIds = target.user_ids.filter((v) => Number.isFinite(Number(v))).map((v) => Number(v));
        } else if (target?.filters) {
            const filters = target.filters;
            const where = [];
            const params = [];
            if (filters.created_at_from) { where.push('u.created_at >= ?'); params.push(filters.created_at_from); }
            if (filters.created_at_to) { where.push('u.created_at <= ?'); params.push(filters.created_at_to); }
            if (typeof filters.is_active !== 'undefined') { where.push('u.is_active = ?'); params.push(filters.is_active ? 1 : 0); }
            if (filters.has_telegram === true) { where.push('u.telegram_id IS NOT NULL'); }
            const whereClause = where.length ? ('WHERE ' + where.join(' AND ')) : '';
            const [rows] = await pool.query(`SELECT u.id FROM users u ${whereClause}` , params);
            userIds = rows.map(r => r.id);
        } else {
            return res.status(400).json({ success: false, message: '缺少 target（user_ids 或 filters）' });
        }
        if (userIds.length === 0) {
            return res.status(400).json({ success: false, message: '目标人群为空' });
        }

        // 预取一次模板（仅用于校验存在性）；实际按用户语言在 Worker 中再解析
        const anyTpl = await resolveTemplate({ templateKey: template_key, channel: channels[0] });
        if (!anyTpl) {
            return res.status(404).json({ success: false, message: '未找到任何可用模板（请检查激活状态/语言/渠道）' });
        }

        // 入队每个用户 × 渠道
        const enqueueResults = await Promise.all(userIds.flatMap((uid) => channels.map(async (ch) => {
            return notificationService.sendToUser(uid, `{{${template_key}}}`, `{{${template_key}}}`, {
                channels: [ch],
                metadata: { template_key, variables }
            });
        })));

        const queued = enqueueResults.filter(r => r.queued).length;
        const failed = enqueueResults.length - queued;

        await recordAdminAction(req, 'admin_batch_send_notifications', 'notification_template', null, `template_key=${template_key}; channels=${channels.join(',')}; users=${userIds.length}`);

        return res.status(202).json({ success: true, message: '任务已入队', data: { totalJobs: enqueueResults.length, queued, failed, users: userIds.length } });
    } catch (error) {
        console.error('管理员批量发送失败:', error);
        return res.status(500).json({ success: false, message: '批量发送失败', error: error.message });
    }
});

// 导出当前筛选 XLSX
router.get('/export', async (req, res) => {
    try {
        const { userId, email, isRead, from, to, channel, status, keyword } = req.query;

        let resolvedUserId = userId ? parseInt(userId) : null;
        if (!resolvedUserId && email) {
            const [rows] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
            resolvedUserId = rows && rows.length > 0 ? rows[0].id : null;
        }

        const where = [];
        const params = [];
        if (resolvedUserId) { where.push('n.user_id = ?'); params.push(resolvedUserId); }
        if (typeof isRead !== 'undefined') { where.push('n.is_read = ?'); params.push(isRead === 'true' ? 1 : 0); }
        if (from) { where.push('n.created_at >= ?'); params.push(from); }
        if (to) { where.push('n.created_at <= ?'); params.push(to); }
        if (keyword) { where.push('(n.title LIKE ? OR n.message LIKE ?)'); params.push(`%${keyword}%`, `%${keyword}%`); }
        if (channel) { where.push('EXISTS (SELECT 1 FROM notification_deliveries d WHERE d.notification_id = n.id AND d.channel = ?)'); params.push(channel); }
        if (status) { where.push('EXISTS (SELECT 1 FROM notification_deliveries d2 WHERE d2.notification_id = n.id AND d2.status = ?)'); params.push(status); }

        const whereClause = where.length > 0 ? ('WHERE ' + where.join(' AND ')) : '';

        const [rows] = await pool.query(
            `SELECT n.id, n.user_id, n.title, n.message, n.is_read, n.created_at
             FROM notifications n
             ${whereClause}
             ORDER BY n.created_at DESC`,
            params
        );

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Notifications');
        sheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'User ID', key: 'user_id', width: 12 },
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Message', key: 'message', width: 60 },
            { header: 'Is Read', key: 'is_read', width: 10 },
            { header: 'Created At', key: 'created_at', width: 24 }
        ];
        rows.forEach(r => sheet.addRow({
            id: r.id,
            user_id: r.user_id,
            title: r.title,
            message: r.message,
            is_read: r.is_read ? 'YES' : 'NO',
            created_at: r.created_at
        }));

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="notifications.xlsx"');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('导出通知失败:', error);
        return res.status(500).json({ success: false, message: '导出失败', error: error.message });
    }
});

// PUT /admin/notifications/:id/read 标记已读
router.put('/:id/read', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (!id) {
            return res.status(400).json({ success: false, message: '无效的通知ID' });
        }

        const [result] = await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '通知不存在' });
        }
        return res.json({ success: true, message: '标记已读成功' });
    } catch (error) {
        console.error('管理员标记通知已读失败:', error);
        return res.status(500).json({ success: false, message: '标记已读失败', error: error.message });
    }
});

// DELETE /admin/notifications/:id 删除通知
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (!id) {
            return res.status(400).json({ success: false, message: '无效的通知ID' });
        }

        const [result] = await pool.query('DELETE FROM notifications WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '通知不存在' });
        }
        return res.json({ success: true, message: '删除通知成功' });
    } catch (error) {
        console.error('管理员删除通知失败:', error);
        return res.status(500).json({ success: false, message: '删除通知失败', error: error.message });
    }
});

module.exports = router;


