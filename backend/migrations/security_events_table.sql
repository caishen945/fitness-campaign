-- 安全事件表
CREATE TABLE IF NOT EXISTS security_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    details JSON,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    status ENUM('NEW', 'IN_PROGRESS', 'RESOLVED', 'IGNORED') DEFAULT 'NEW',
    resolved_by INT,
    resolved_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (resolved_by) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_event_type (event_type),
    INDEX idx_severity (severity),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- 安全配置表
CREATE TABLE IF NOT EXISTS security_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    description TEXT,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- 插入默认安全配置
INSERT IGNORE INTO security_config (config_key, config_value, description) VALUES
('failed_login_threshold', '5', '失败登录告警阈值'),
('suspicious_ip_threshold', '3', '可疑IP告警阈值'),
('rapid_request_threshold', '100', '快速请求告警阈值'),
('session_timeout_minutes', '1440', '会话超时时间（分钟）'),
('password_expiry_days', '90', '密码过期时间（天）'),
('max_concurrent_sessions', '3', '最大并发会话数'),
('enable_two_factor', 'false', '是否启用双因素认证'),
('enable_ip_whitelist', 'false', '是否启用IP白名单'),
('security_check_interval', '15', '安全检查间隔（分钟）'),
('alert_email_enabled', 'false', '是否启用邮件告警'),
('alert_sms_enabled', 'false', '是否启用短信告警');

-- 安全白名单表
CREATE TABLE IF NOT EXISTS security_whitelist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    description TEXT,
    added_by INT,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (added_by) REFERENCES admin_users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_ip (ip_address),
    INDEX idx_ip_address (ip_address),
    INDEX idx_expires_at (expires_at)
);

-- 安全黑名单表
CREATE TABLE IF NOT EXISTS security_blacklist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    reason TEXT,
    added_by INT,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (added_by) REFERENCES admin_users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_ip (ip_address),
    INDEX idx_ip_address (ip_address),
    INDEX idx_expires_at (expires_at)
);

-- 双因素认证表
CREATE TABLE IF NOT EXISTS admin_2fa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    secret_key VARCHAR(255) NOT NULL,
    backup_codes JSON,
    is_enabled BOOLEAN DEFAULT FALSE,
    last_used TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_admin (admin_id),
    INDEX idx_admin_id (admin_id)
);

-- 会话管理表
CREATE TABLE IF NOT EXISTS admin_sessions (
    id VARCHAR(255) PRIMARY KEY,
    admin_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    INDEX idx_admin_id (admin_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_is_active (is_active)
);

-- 创建清理过期数据的存储过程
DELIMITER //
CREATE PROCEDURE CleanupExpiredData()
BEGIN
    -- 清理过期的会话
    DELETE FROM admin_sessions WHERE expires_at < NOW();
    
    -- 清理过期的白名单
    DELETE FROM security_whitelist WHERE expires_at IS NOT NULL AND expires_at < NOW();
    
    -- 清理过期的黑名单
    DELETE FROM security_blacklist WHERE expires_at IS NOT NULL AND expires_at < NOW();
    
    -- 清理30天前的审计日志（保留最近30天）
    DELETE FROM admin_audit_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
    
    -- 清理90天前的安全事件（保留最近90天）
    DELETE FROM security_events WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
    
    SELECT 'Cleanup completed' as result;
END //
DELIMITER ;

-- 创建事件调度器（每天凌晨2点执行清理）
-- 注意：需要确保MySQL的event_scheduler是开启的
-- SET GLOBAL event_scheduler = ON;

-- CREATE EVENT IF NOT EXISTS daily_cleanup
-- ON SCHEDULE EVERY 1 DAY
-- STARTS CURRENT_TIMESTAMP
-- DO CALL CleanupExpiredData();
