const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const { pool } = require('../config/database');
const { resolveTemplate, renderMessage } = require('../services/templateService');

const router = express.Router();

router.use(authenticateToken, requireAdmin);

// 创建/更新模板
router.post('/', async (req, res) => {
    try {
        const { template_key, locale = 'en', channel = 'web', name, subject, body, is_active = true } = req.body || {};
        const allowedChannels = new Set(['web','email','telegram','push','sms']);
        const normalizedChannel = typeof channel === 'string' ? channel.trim().toLowerCase() : 'web';
        if (!allowedChannels.has(normalizedChannel)) {
            return res.status(400).json({ success: false, message: '非法渠道。允许: web,email,telegram,push,sms' });
        }
        if (!template_key || !body) {
            return res.status(400).json({ success: false, message: '缺少必填字段: template_key, body' });
        }
        // 版本+1
        const [row] = await pool.query('SELECT MAX(version) as v FROM notification_templates WHERE template_key = ? AND locale = ? AND channel = ?',[template_key, locale, normalizedChannel]);
        const nextVersion = (row?.[0]?.v || 0) + 1;
        const [result] = await pool.query(
            'INSERT INTO notification_templates (template_key, locale, channel, version, name, subject, body, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [template_key, locale, normalizedChannel, nextVersion, name || null, subject || null, body, !!is_active]
        );
        return res.status(201).json({ success: true, message: '模板创建成功', data: { id: result.insertId, version: nextVersion } });
    } catch (e) {
        return res.status(500).json({ success: false, message: '模板创建失败', error: e.message });
    }
});

// 查询模板（支持分页）
router.get('/', async (req, res) => {
    try {
        const { template_key, locale, channel, active } = req.query;
        const page = Math.max(parseInt(req.query.page || '1', 10), 1);
        const pageSize = Math.max(parseInt(req.query.page_size || '20', 10), 1);

        const where = [];
        const params = [];
        if (template_key) { where.push('template_key = ?'); params.push(template_key); }
        if (locale) { where.push('locale = ?'); params.push(locale); }
        if (channel) { where.push('channel = ?'); params.push(channel); }
        if (typeof active !== 'undefined') { where.push('is_active = ?'); params.push(active === 'true'); }
        const whereClause = where.length ? ('WHERE ' + where.join(' AND ')) : '';

        // total count
        const [countRows] = await pool.query(`SELECT COUNT(1) as total FROM notification_templates ${whereClause}`, params);
        const total = countRows?.[0]?.total || 0;

        // data rows
        const offset = (page - 1) * pageSize;
        const dataSql = `SELECT * FROM notification_templates ${whereClause} ORDER BY template_key, locale, channel, version DESC LIMIT ? OFFSET ?`;
        const [rows] = await pool.query(dataSql, [...params, pageSize, offset]);

        return res.json({ success: true, data: rows, pagination: { total, page, page_size: pageSize } });
    } catch (e) {
        return res.status(500).json({ success: false, message: '获取模板失败', error: e.message });
    }
});

// 获取最新激活模板
router.get('/latest', async (req, res) => {
    try {
        const { template_key, locale, channel = 'web' } = req.query || {};
        const allowedChannels = new Set(['web','email','telegram','push','sms']);
        const normalizedChannel = typeof channel === 'string' ? channel.trim().toLowerCase() : 'web';
        if (!allowedChannels.has(normalizedChannel)) {
            return res.status(400).json({ success: false, message: '非法渠道。允许: web,email,telegram,push,sms' });
        }
        if (!template_key) {
            return res.status(400).json({ success: false, message: '缺少必填字段: template_key' });
        }
        const tpl = await resolveTemplate({ templateKey: template_key, language: locale, channel: normalizedChannel });
        if (!tpl) return res.json({ success: true, data: null, message: '未找到匹配模板' });
        return res.json({ success: true, data: tpl });
    } catch (e) {
        return res.status(500).json({ success: false, message: '获取最新模板失败', error: e.message });
    }
});

// 激活/禁用模板
router.patch('/:id/activate', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        let { is_active } = req.body || {};
        if (!Number.isFinite(id)) {
            return res.status(400).json({ success: false, message: '参数错误: id' });
        }
        if (typeof is_active === 'string') {
            if (is_active === 'true') is_active = true; else if (is_active === 'false') is_active = false;
        }
        if (typeof is_active !== 'boolean') {
            return res.status(400).json({ success: false, message: '缺少参数: id 或 is_active' });
        }
        const [r] = await pool.query('UPDATE notification_templates SET is_active = ?, updated_at = NOW() WHERE id = ?', [is_active, id]);
        if (r.affectedRows === 0) return res.status(404).json({ success: false, message: '模板不存在' });
        return res.json({ success: true, message: '模板状态已更新', data: { id, is_active } });
    } catch (e) {
        return res.status(500).json({ success: false, message: '更新模板状态失败', error: e.message });
    }
});

// 预览模板渲染
router.post('/preview', async (req, res) => {
    try {
        const { template_key, locale, channel = 'web', variables = {} } = req.body || {};
        const allowedChannels = new Set(['web','email','telegram','push','sms']);
        const normalizedChannel = typeof channel === 'string' ? channel.trim().toLowerCase() : 'web';
        if (!allowedChannels.has(normalizedChannel)) {
            return res.status(400).json({ success: false, message: '非法渠道。允许: web,email,telegram,push,sms' });
        }
        if (!template_key) {
            return res.status(400).json({ success: false, message: '缺少必填字段: template_key' });
        }
        const tpl = await resolveTemplate({ templateKey: template_key, language: locale, channel: normalizedChannel });
        if (!tpl) return res.status(404).json({ success: false, message: '未找到匹配模板' });
        const rendered = renderMessage({ subject: tpl.subject, body: tpl.body, variables });
        return res.json({ success: true, data: { template: tpl, rendered } });
    } catch (e) {
        return res.status(500).json({ success: false, message: '模板预览失败', error: e.message });
    }
});

// 预览模板渲染（GET 版本，便于前端以查询参数调用）
router.get('/preview', async (req, res) => {
    try {
        const { template_key, locale, channel = 'web', variables } = req.query || {};
        const allowedChannels = new Set(['web','email','telegram','push','sms']);
        const normalizedChannel = typeof channel === 'string' ? channel.trim().toLowerCase() : 'web';
        if (!allowedChannels.has(normalizedChannel)) {
            return res.status(400).json({ success: false, message: '非法渠道。允许: web,email,telegram,push,sms' });
        }
        if (!template_key) {
            return res.status(400).json({ success: false, message: '缺少必填字段: template_key' });
        }
        let vars = {};
        if (typeof variables === 'string') {
            try { vars = JSON.parse(variables); } catch (_) { vars = {}; }
        }
        const tpl = await resolveTemplate({ templateKey: template_key, language: locale, channel: normalizedChannel });
        if (!tpl) return res.status(404).json({ success: false, message: '未找到匹配模板' });
        const rendered = renderMessage({ subject: tpl.subject, body: tpl.body, variables: vars });
        return res.json({ success: true, data: { template: tpl, rendered } });
    } catch (e) {
        return res.status(500).json({ success: false, message: '模板预览失败', error: e.message });
    }
});

module.exports = router;

// =========== 以下为本次新增：就地编辑与删除模板版本 ===========
// 就地编辑（仅允许更新非关键字段）
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (!Number.isFinite(id)) {
            return res.status(400).json({ success: false, message: '参数错误: id' });
        }

        const { name, subject, body, is_active } = req.body || {};
        const fields = [];
        const params = [];
        if (typeof name !== 'undefined') { fields.push('name = ?'); params.push(name); }
        if (typeof subject !== 'undefined') { fields.push('subject = ?'); params.push(subject); }
        if (typeof body !== 'undefined') { fields.push('body = ?'); params.push(body); }
        if (typeof is_active !== 'undefined') { fields.push('is_active = ?'); params.push(!!is_active); }

        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: '没有可更新的字段' });
        }

        fields.push('updated_at = NOW()');
        const sql = `UPDATE notification_templates SET ${fields.join(', ')} WHERE id = ?`;
        params.push(id);
        const [r] = await pool.query(sql, params);
        if (r.affectedRows === 0) return res.status(404).json({ success: false, message: '模板不存在' });
        return res.json({ success: true, message: '更新成功', data: { id } });
    } catch (e) {
        return res.status(500).json({ success: false, message: '更新模板失败', error: e.message });
    }
});

// 删除模板版本（禁止删除激活版本）
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (!Number.isFinite(id)) {
            return res.status(400).json({ success: false, message: '参数错误: id' });
        }

        const [rows] = await pool.query('SELECT is_active FROM notification_templates WHERE id = ? LIMIT 1', [id]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: '模板不存在' });
        }
        if (rows[0].is_active) {
            return res.status(400).json({ success: false, message: '激活版本不可删除，请先禁用或切换版本' });
        }

        const [r] = await pool.query('DELETE FROM notification_templates WHERE id = ?', [id]);
        if (r.affectedRows === 0) return res.status(404).json({ success: false, message: '模板不存在' });
        return res.json({ success: true, message: '删除成功' });
    } catch (e) {
        return res.status(500).json({ success: false, message: '删除模板失败', error: e.message });
    }
});


