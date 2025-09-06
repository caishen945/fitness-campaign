-- 管理员认证系统数据库表结构

-- 管理员用户表
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
    permissions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active)
);

-- 管理员审计日志表
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    INDEX idx_admin_id (admin_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at),
    INDEX idx_ip_address (ip_address)
);

-- 管理员会话表（用于会话管理）
CREATE TABLE IF NOT EXISTS admin_sessions (
    id VARCHAR(255) PRIMARY KEY,
    admin_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    INDEX idx_admin_id (admin_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_is_active (is_active)
);

-- 管理员权限表
CREATE TABLE IF NOT EXISTS admin_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_category (category)
);

-- 管理员角色权限关联表
CREATE TABLE IF NOT EXISTS admin_role_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role ENUM('super_admin', 'admin', 'moderator') NOT NULL,
    permission_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (permission_id) REFERENCES admin_permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role, permission_id),
    INDEX idx_role (role),
    INDEX idx_permission_id (permission_id)
);

-- 插入默认权限数据
INSERT IGNORE INTO admin_permissions (name, description, category) VALUES
-- 用户管理权限
('user:read', '查看用户信息', 'user_management'),
('user:create', '创建用户', 'user_management'),
('user:update', '更新用户信息', 'user_management'),
('user:delete', '删除用户', 'user_management'),
('user:balance', '管理用户余额', 'user_management'),

-- VIP管理权限
('vip:read', '查看VIP信息', 'vip_management'),
('vip:create', '创建VIP等级', 'vip_management'),
('vip:update', '更新VIP等级', 'vip_management'),
('vip:delete', '删除VIP等级', 'vip_management'),

-- 钱包管理权限
('wallet:read', '查看钱包信息', 'wallet_management'),
('wallet:withdrawal', '处理提现申请', 'wallet_management'),
('wallet:deposit', '管理员充值', 'wallet_management'),
('wallet:reward', '发放奖励', 'wallet_management'),

-- 签到管理权限
('checkin:read', '查看签到信息', 'checkin_management'),
('checkin:create', '手动添加签到', 'checkin_management'),
('checkin:delete', '删除签到记录', 'checkin_management'),

-- PK挑战管理权限
('pk:read', '查看PK挑战', 'pk_management'),
('pk:cancel', '取消PK挑战', 'pk_management'),
('pk:settle', '结算PK挑战', 'pk_management'),

-- 成就管理权限
('achievement:read', '查看成就信息', 'achievement_management'),
('achievement:create', '创建成就', 'achievement_management'),
('achievement:update', '更新成就', 'achievement_management'),
('achievement:delete', '删除成就', 'achievement_management'),

-- 团队管理权限
('team:read', '查看团队信息', 'team_management'),
('team:config', '管理团队配置', 'team_management'),

-- 系统管理权限
('system:config', '系统配置', 'system_management'),
('system:logs', '查看系统日志', 'system_management'),
('admin:manage', '管理其他管理员', 'system_management');

-- 插入角色权限关联数据
INSERT IGNORE INTO admin_role_permissions (role, permission_id) 
SELECT 'super_admin', id FROM admin_permissions;

INSERT IGNORE INTO admin_role_permissions (role, permission_id) 
SELECT 'admin', id FROM admin_permissions 
WHERE category IN ('user_management', 'vip_management', 'wallet_management', 'checkin_management', 'pk_management', 'achievement_management', 'team_management');

INSERT IGNORE INTO admin_role_permissions (role, permission_id) 
SELECT 'moderator', id FROM admin_permissions 
WHERE category IN ('user_management', 'checkin_management', 'achievement_management') 
AND name LIKE '%:read%';

-- 创建默认超级管理员账户
-- 密码: Admin123!@# (使用bcrypt加密)
INSERT IGNORE INTO admin_users (username, password_hash, email, role, permissions) VALUES
('superadmin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/5KQqQqG', 'admin@fitchallenge.com', 'super_admin', '["*"]');

-- 创建默认管理员账户
-- 密码: Admin123!@# (使用bcrypt加密)
INSERT IGNORE INTO admin_users (username, password_hash, email, role, permissions) VALUES
('admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/5KQqQqG', 'admin@fitchallenge.com', 'admin', '["user:read","user:update","vip:read","wallet:read","wallet:withdrawal","checkin:read","pk:read","achievement:read","team:read"]');

-- 创建默认版主账户
-- 密码: Moderator123!@# (使用bcrypt加密)
INSERT IGNORE INTO admin_users (username, password_hash, email, role, permissions) VALUES
('moderator', '$2a$12$8KQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/5KQqQqG', 'moderator@fitchallenge.com', 'moderator', '["user:read","checkin:read","achievement:read"]');
