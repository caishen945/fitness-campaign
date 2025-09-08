const { pool } = require('../config/database');

async function recordAdminAction(req, action, entityType, entityId, description) {
    try {
        const adminUserId = req?.user?.id;
        const ip = req?.ip || null;
        const userAgent = req?.headers?.['user-agent'] || null;
        if (!adminUserId) return;
        await pool.query(
            'INSERT INTO admin_audit_logs (admin_user_id, action, entity_type, entity_id, description, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
            [adminUserId, action, entityType || null, String(entityId || ''), description || null, ip, userAgent]
        );
    } catch (e) {
        // 审计失败不阻断主流程
    }
}

module.exports = { recordAdminAction };


