const mysql = require('mysql2/promise');
const dbConfig = require('../config/database');

class SecurityMonitor {
    constructor() {
        this.pool = mysql.createPool(dbConfig);
        this.alertThresholds = {
            failedLogins: 5, // 5次失败登录
            suspiciousIPs: 3, // 3个不同IP
            rapidRequests: 100, // 100次请求/分钟
            unusualHours: ['23:00', '06:00'] // 异常时间
        };
    }

    // 监控登录失败
    async monitorFailedLogins(timeWindow = 15) {
        const connection = await this.pool.getConnection();
        try {
            const [rows] = await connection.execute(`
                SELECT 
                    ip_address,
                    COUNT(*) as failed_count,
                    MAX(created_at) as last_attempt
                FROM admin_audit_logs 
                WHERE action = 'ADMIN_LOGIN_FAILED' 
                AND created_at >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
                GROUP BY ip_address
                HAVING failed_count >= ?
            `, [timeWindow, this.alertThresholds.failedLogins]);

            return rows.map(row => ({
                type: 'FAILED_LOGIN_ALERT',
                ip: row.ip_address,
                failedCount: row.failed_count,
                lastAttempt: row.last_attempt,
                severity: row.failed_count >= 10 ? 'HIGH' : 'MEDIUM'
            }));
        } finally {
            connection.release();
        }
    }

    // 监控可疑IP地址
    async monitorSuspiciousIPs(timeWindow = 60) {
        const connection = await this.pool.getConnection();
        try {
            const [rows] = await connection.execute(`
                SELECT 
                    admin_id,
                    COUNT(DISTINCT ip_address) as unique_ips,
                    GROUP_CONCAT(DISTINCT ip_address) as ip_list
                FROM admin_audit_logs 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
                GROUP BY admin_id
                HAVING unique_ips >= ?
            `, [timeWindow, this.alertThresholds.suspiciousIPs]);

            return rows.map(row => ({
                type: 'SUSPICIOUS_IP_ALERT',
                adminId: row.admin_id,
                uniqueIPs: row.unique_ips,
                ipList: row.ip_list.split(','),
                severity: row.unique_ips >= 5 ? 'HIGH' : 'MEDIUM'
            }));
        } finally {
            connection.release();
        }
    }

    // 监控异常时间访问
    async monitorUnusualHours(timeWindow = 24) {
        const connection = await this.pool.getConnection();
        try {
            const [rows] = await connection.execute(`
                SELECT 
                    admin_id,
                    ip_address,
                    created_at,
                    action
                FROM admin_audit_logs 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
                AND (
                    HOUR(created_at) >= 23 OR HOUR(created_at) <= 6
                )
                ORDER BY created_at DESC
            `, [timeWindow]);

            return rows.map(row => ({
                type: 'UNUSUAL_HOURS_ALERT',
                adminId: row.admin_id,
                ip: row.ip_address,
                action: row.action,
                timestamp: row.created_at,
                severity: 'LOW'
            }));
        } finally {
            connection.release();
        }
    }

    // 监控权限提升尝试
    async monitorPrivilegeEscalation(timeWindow = 24) {
        const connection = await this.pool.getConnection();
        try {
            const [rows] = await connection.execute(`
                SELECT 
                    a1.admin_id,
                    a1.action,
                    a1.created_at,
                    au.role
                FROM admin_audit_logs a1
                JOIN admin_users au ON a1.admin_id = au.id
                WHERE a1.created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
                AND a1.action IN ('ADMIN_CREATE', 'ADMIN_UPDATE', 'PERMISSION_CHANGE')
                AND au.role != 'super_admin'
            `, [timeWindow]);

            return rows.map(row => ({
                type: 'PRIVILEGE_ESCALATION_ALERT',
                adminId: row.admin_id,
                action: row.action,
                role: row.role,
                timestamp: row.created_at,
                severity: 'HIGH'
            }));
        } finally {
            connection.release();
        }
    }

    // 生成安全报告
    async generateSecurityReport(days = 7) {
        const connection = await this.pool.getConnection();
        try {
            // 获取基本统计信息
            const [stats] = await connection.execute(`
                SELECT 
                    COUNT(*) as total_actions,
                    COUNT(DISTINCT admin_id) as unique_admins,
                    COUNT(DISTINCT ip_address) as unique_ips,
                    COUNT(CASE WHEN action = 'ADMIN_LOGIN' THEN 1 END) as successful_logins,
                    COUNT(CASE WHEN action = 'ADMIN_LOGIN_FAILED' THEN 1 END) as failed_logins,
                    COUNT(CASE WHEN action = 'PASSWORD_CHANGE' THEN 1 END) as password_changes
                FROM admin_audit_logs 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            `, [days]);

            // 获取最活跃的管理员
            const [activeAdmins] = await connection.execute(`
                SELECT 
                    au.username,
                    au.role,
                    COUNT(*) as action_count
                FROM admin_audit_logs aal
                JOIN admin_users au ON aal.admin_id = au.id
                WHERE aal.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                GROUP BY aal.admin_id
                ORDER BY action_count DESC
                LIMIT 10
            `, [days]);

            // 获取最活跃的IP地址
            const [activeIPs] = await connection.execute(`
                SELECT 
                    ip_address,
                    COUNT(*) as request_count,
                    COUNT(DISTINCT admin_id) as unique_admins
                FROM admin_audit_logs 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                GROUP BY ip_address
                ORDER BY request_count DESC
                LIMIT 10
            `, [days]);

            // 获取异常行为
            const alerts = await this.getAllAlerts(days);

            return {
                period: `${days}天`,
                generatedAt: new Date().toISOString(),
                statistics: stats[0],
                activeAdmins,
                activeIPs,
                alerts,
                riskScore: this.calculateRiskScore(stats[0], alerts)
            };
        } finally {
            connection.release();
        }
    }

    // 获取所有告警
    async getAllAlerts(days = 1) {
        const [failedLogins, suspiciousIPs, unusualHours, privilegeEscalation] = await Promise.all([
            this.monitorFailedLogins(15),
            this.monitorSuspiciousIPs(60),
            this.monitorUnusualHours(24),
            this.monitorPrivilegeEscalation(24)
        ]);

        return {
            failedLogins,
            suspiciousIPs,
            unusualHours,
            privilegeEscalation,
            total: failedLogins.length + suspiciousIPs.length + unusualHours.length + privilegeEscalation.length
        };
    }

    // 计算风险评分
    calculateRiskScore(stats, alerts) {
        let score = 0;

        // 基于失败登录次数
        if (stats.failed_logins > 10) score += 30;
        else if (stats.failed_logins > 5) score += 15;

        // 基于告警数量
        score += alerts.total * 10;

        // 基于高风险告警
        const highRiskAlerts = alerts.failedLogins.filter(a => a.severity === 'HIGH').length +
                              alerts.suspiciousIPs.filter(a => a.severity === 'HIGH').length +
                              alerts.privilegeEscalation.filter(a => a.severity === 'HIGH').length;
        score += highRiskAlerts * 20;

        return Math.min(score, 100); // 最高100分
    }

    // 记录安全事件
    async logSecurityEvent(event) {
        const connection = await this.pool.getConnection();
        try {
            await connection.execute(`
                INSERT INTO security_events (event_type, details, severity, created_at) 
                VALUES (?, ?, ?, NOW())
            `, [event.type, JSON.stringify(event), event.severity]);
        } finally {
            connection.release();
        }
    }

    // 发送安全告警
    async sendSecurityAlert(alert) {
        // 这里可以集成邮件、短信或其他通知方式
        console.log('🚨 安全告警:', alert);
        
        // 记录到数据库
        await this.logSecurityEvent(alert);
        
        // 可以根据需要发送邮件或短信
        // await this.sendEmail(alert);
        // await this.sendSMS(alert);
    }

    // 定期安全检查
    async runSecurityCheck() {
        try {
            const alerts = await this.getAllAlerts();
            
            // 处理告警
            for (const alertType in alerts) {
                if (Array.isArray(alerts[alertType])) {
                    for (const alert of alerts[alertType]) {
                        await this.sendSecurityAlert(alert);
                    }
                }
            }

            console.log(`✅ 安全检查完成，发现 ${alerts.total} 个告警`);
        } catch (error) {
            console.error('❌ 安全检查失败:', error);
        }
    }
}

module.exports = SecurityMonitor;
