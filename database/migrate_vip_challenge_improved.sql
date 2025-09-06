-- VIP挑战系统数据库迁移脚本
-- 将现有表结构升级到改进版本

-- 开始事务
START TRANSACTION;

-- ==========================================
-- 1. 备份现有数据
-- ==========================================

-- 创建备份表
CREATE TABLE IF NOT EXISTS vip_levels_backup AS SELECT * FROM vip_levels;
CREATE TABLE IF NOT EXISTS vip_challenges_backup AS SELECT * FROM vip_challenges;

-- ==========================================
-- 2. 更新VIP等级表结构
-- ==========================================

-- 添加新字段
ALTER TABLE vip_levels 
ADD COLUMN IF NOT EXISTS bonus_reward DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '额外奖励（如全勤奖等）' AFTER final_reward,
ADD COLUMN IF NOT EXISTS deposit_deduct_ratio DECIMAL(3,2) NOT NULL DEFAULT 0.20 COMMENT '失败时押金扣除比例(0-1)' AFTER partial_refund_ratio,
ADD COLUMN IF NOT EXISTS reward_deduct_ratio DECIMAL(3,2) NOT NULL DEFAULT 0.00 COMMENT '失败时奖励扣除比例(0-1)' AFTER deposit_deduct_ratio,
ADD COLUMN IF NOT EXISTS cancel_deduct_ratio DECIMAL(3,2) NOT NULL DEFAULT 0.05 COMMENT '主动取消挑战扣除比例(0-1)' AFTER reward_deduct_ratio,
ADD COLUMN IF NOT EXISTS timeout_deduct_ratio DECIMAL(3,2) NOT NULL DEFAULT 0.30 COMMENT '超时失败扣除比例(0-1)' AFTER cancel_deduct_ratio,
ADD COLUMN IF NOT EXISTS daily_deadline TIME NOT NULL DEFAULT '23:59:59' COMMENT '每日挑战截止时间' AFTER timeout_deduct_ratio,
ADD COLUMN IF NOT EXISTS reward_delay_hours INT NOT NULL DEFAULT 24 COMMENT '奖励延迟发放时间（小时）' AFTER daily_deadline,
ADD COLUMN IF NOT EXISTS auto_timeout_hours INT NOT NULL DEFAULT 48 COMMENT '自动超时时间（小时）' AFTER reward_delay_hours,
ADD COLUMN IF NOT EXISTS allow_third_party BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否允许第三方API数据' AFTER auto_timeout_hours,
ADD COLUMN IF NOT EXISTS min_third_party_steps INT NOT NULL DEFAULT 100 COMMENT '第三方API最小步数要求' AFTER allow_third_party,
ADD COLUMN IF NOT EXISTS max_third_party_steps INT NOT NULL DEFAULT 50000 COMMENT '第三方API最大步数限制' AFTER min_third_party_steps;

-- 更新现有数据的默认值
UPDATE vip_levels SET 
    bonus_reward = CASE 
        WHEN name = '青铜挑战' THEN 0.10
        WHEN name = '白银挑战' THEN 0.25
        WHEN name = '黄金挑战' THEN 0.50
        ELSE 0.00
    END,
    deposit_deduct_ratio = CASE 
        WHEN name = '青铜挑战' THEN 0.20
        WHEN name = '白银挑战' THEN 0.25
        WHEN name = '黄金挑战' THEN 0.30
        ELSE 0.20
    END,
    reward_deduct_ratio = 0.00,
    cancel_deduct_ratio = 0.05,
    timeout_deduct_ratio = CASE 
        WHEN name = '青铜挑战' THEN 0.30
        WHEN name = '白银挑战' THEN 0.35
        WHEN name = '黄金挑战' THEN 0.40
        ELSE 0.30
    END,
    daily_deadline = '23:59:59',
    reward_delay_hours = 24,
    auto_timeout_hours = 48,
    allow_third_party = TRUE,
    min_third_party_steps = 100,
    max_third_party_steps = 50000;

-- ==========================================
-- 3. 更新VIP挑战表结构
-- ==========================================

-- 添加新字段
ALTER TABLE vip_challenges 
ADD COLUMN IF NOT EXISTS frozen_deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '冻结的押金金额' AFTER deposit_amount,
ADD COLUMN IF NOT EXISTS total_earned_reward DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '累计获得奖励' AFTER frozen_deposit_amount,
ADD COLUMN IF NOT EXISTS total_claimed_reward DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '累计领取奖励' AFTER total_earned_reward,
ADD COLUMN IF NOT EXISTS last_activity_date DATE NULL COMMENT '最后活动日期' AFTER end_date,
ADD COLUMN IF NOT EXISTS timeout_at TIMESTAMP NULL COMMENT '超时时间' AFTER completed_at,
ADD COLUMN IF NOT EXISTS third_party_source ENUM('google_fit', 'ios_healthkit', 'manual', 'other') NOT NULL DEFAULT 'manual' COMMENT '数据来源' AFTER timeout_at,
ADD COLUMN IF NOT EXISTS third_party_data JSON NULL COMMENT '第三方API原始数据' AFTER third_party_source;

-- 更新状态枚举
ALTER TABLE vip_challenges 
MODIFY COLUMN status ENUM('active', 'completed', 'failed', 'cancelled', 'timeout') NOT NULL DEFAULT 'active' COMMENT '挑战状态';

-- 初始化新字段的值
UPDATE vip_challenges SET 
    frozen_deposit_amount = deposit_amount,
    total_earned_reward = CASE WHEN status = 'completed' THEN reward_amount ELSE 0 END,
    total_claimed_reward = CASE WHEN status = 'completed' THEN reward_amount ELSE 0 END,
    last_activity_date = DATE(created_at),
    third_party_source = 'manual';

-- ==========================================
-- 4. 创建新的表
-- ==========================================

-- 创建VIP挑战每日记录表
CREATE TABLE IF NOT EXISTS vip_challenge_daily_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    challenge_id INT NOT NULL COMMENT '挑战ID',
    user_id INT NOT NULL COMMENT '用户ID',
    vip_level_id INT NOT NULL COMMENT 'VIP等级ID',
    record_date DATE NOT NULL COMMENT '记录日期',
    
    -- 步数数据
    step_target INT NOT NULL DEFAULT 0 COMMENT '当日步数目标',
    actual_steps INT NOT NULL DEFAULT 0 COMMENT '实际步数',
    is_completed BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否完成',
    completion_time TIMESTAMP NULL COMMENT '完成时间',
    
    -- 奖励状态
    daily_reward DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '当日奖励金额',
    is_reward_available BOOLEAN NOT NULL DEFAULT FALSE COMMENT '奖励是否可领取',
    reward_available_at TIMESTAMP NULL COMMENT '奖励可领取时间',
    is_reward_claimed BOOLEAN NOT NULL DEFAULT FALSE COMMENT '奖励是否已领取',
    reward_claimed_at TIMESTAMP NULL COMMENT '奖励领取时间',
    
    -- 数据来源
    data_source ENUM('google_fit', 'ios_healthkit', 'manual', 'other') NOT NULL DEFAULT 'manual' COMMENT '数据来源',
    source_data JSON NULL COMMENT '来源数据详情',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE COMMENT '数据是否已验证',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    FOREIGN KEY (challenge_id) REFERENCES vip_challenges(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vip_level_id) REFERENCES vip_levels(id) ON DELETE CASCADE,
    
    UNIQUE KEY uk_challenge_date (challenge_id, record_date),
    INDEX idx_user_date (user_id, record_date),
    INDEX idx_challenge_date (challenge_id, record_date),
    INDEX idx_completion_status (is_completed, is_reward_available, is_reward_claimed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='VIP挑战每日记录表';

-- 创建VIP挑战处罚记录表
CREATE TABLE IF NOT EXISTS vip_challenge_penalties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    challenge_id INT NOT NULL COMMENT '挑战ID',
    user_id INT NOT NULL COMMENT '用户ID',
    vip_level_id INT NOT NULL COMMENT 'VIP等级ID',
    
    -- 处罚信息
    penalty_type ENUM('deposit_deduct', 'reward_deduct', 'challenge_fail', 'timeout', 'cancel', 'other') NOT NULL COMMENT '处罚类型',
    penalty_reason VARCHAR(255) NOT NULL COMMENT '处罚原因',
    penalty_amount DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '处罚金额',
    penalty_ratio DECIMAL(3,2) NOT NULL DEFAULT 0 COMMENT '处罚比例',
    
    -- 处罚状态
    status ENUM('pending', 'executed', 'cancelled', 'appealed') NOT NULL DEFAULT 'pending' COMMENT '处罚状态',
    executed_at TIMESTAMP NULL COMMENT '执行时间',
    cancelled_at TIMESTAMP NULL COMMENT '取消时间',
    cancelled_reason VARCHAR(255) NULL COMMENT '取消原因',
    
    -- 申诉信息
    appeal_reason TEXT NULL COMMENT '申诉理由',
    appeal_status ENUM('none', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'none' COMMENT '申诉状态',
    appeal_result TEXT NULL COMMENT '申诉结果',
    appeal_processed_at TIMESTAMP NULL COMMENT '申诉处理时间',
    appeal_processed_by INT NULL COMMENT '申诉处理人ID',
    
    -- 管理员信息
    created_by INT NULL COMMENT '创建人ID（管理员）',
    notes TEXT NULL COMMENT '管理员备注',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    FOREIGN KEY (challenge_id) REFERENCES vip_challenges(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vip_level_id) REFERENCES vip_levels(id) ON DELETE CASCADE,
    FOREIGN KEY (appeal_processed_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_challenge_id (challenge_id),
    INDEX idx_user_id (user_id),
    INDEX idx_penalty_type (penalty_type),
    INDEX idx_status (status),
    INDEX idx_appeal_status (appeal_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='VIP挑战处罚记录表';

-- 创建第三方API配置表
CREATE TABLE IF NOT EXISTS third_party_api_configs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    api_name ENUM('google_fit', 'ios_healthkit', 'other') NOT NULL COMMENT 'API名称',
    api_version VARCHAR(20) NOT NULL DEFAULT '1.0' COMMENT 'API版本',
    is_active BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否激活',
    
    -- API配置
    api_key VARCHAR(255) NULL COMMENT 'API密钥',
    api_secret VARCHAR(255) NULL COMMENT 'API密钥',
    base_url VARCHAR(255) NULL COMMENT 'API基础URL',
    auth_url VARCHAR(255) NULL COMMENT '认证URL',
    token_url VARCHAR(255) NULL COMMENT 'Token获取URL',
    
    -- 数据配置
    data_types JSON NULL COMMENT '支持的数据类型',
    sync_interval_minutes INT NOT NULL DEFAULT 60 COMMENT '同步间隔（分钟）',
    max_retry_count INT NOT NULL DEFAULT 3 COMMENT '最大重试次数',
    
    -- 验证配置
    require_verification BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否需要验证',
    verification_method ENUM('webhook', 'polling', 'push') NOT NULL DEFAULT 'webhook' COMMENT '验证方法',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    UNIQUE KEY uk_api_name_version (api_name, api_version),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='第三方API配置表';

-- 创建第三方API用户授权表
CREATE TABLE IF NOT EXISTS third_party_user_auths (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '用户ID',
    api_name ENUM('google_fit', 'ios_healthkit', 'other') NOT NULL COMMENT 'API名称',
    
    -- 授权信息
    auth_token VARCHAR(500) NULL COMMENT '授权Token',
    refresh_token VARCHAR(500) NULL COMMENT '刷新Token',
    token_expires_at TIMESTAMP NULL COMMENT 'Token过期时间',
    
    -- 用户信息
    third_party_user_id VARCHAR(255) NULL COMMENT '第三方平台用户ID',
    third_party_email VARCHAR(255) NULL COMMENT '第三方平台邮箱',
    third_party_name VARCHAR(255) NULL COMMENT '第三方平台用户名',
    
    -- 授权状态
    is_authorized BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否已授权',
    last_sync_at TIMESTAMP NULL COMMENT '最后同步时间',
    sync_status ENUM('success', 'failed', 'pending') NOT NULL DEFAULT 'pending' COMMENT '同步状态',
    sync_error_message TEXT NULL COMMENT '同步错误信息',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY uk_user_api (user_id, api_name),
    INDEX idx_api_name (api_name),
    INDEX idx_is_authorized (is_authorized),
    INDEX idx_sync_status (sync_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='第三方API用户授权表';

-- ==========================================
-- 5. 插入初始数据
-- ==========================================

-- 插入第三方API配置
INSERT INTO third_party_api_configs (
    api_name, api_version, is_active, data_types, sync_interval_minutes,
    require_verification, verification_method
) VALUES
(
    'google_fit', '1.0', FALSE,
    '["steps", "distance", "calories", "heart_rate"]',
    60, TRUE, 'webhook'
),
(
    'ios_healthkit', '1.0', FALSE,
    '["steps", "distance", "calories", "heart_rate"]',
    60, TRUE, 'webhook'
)
ON DUPLICATE KEY UPDATE
    data_types = VALUES(data_types),
    sync_interval_minutes = VALUES(sync_interval_minutes),
    require_verification = VALUES(require_verification),
    verification_method = VALUES(verification_method);

-- ==========================================
-- 6. 创建改进后的视图
-- ==========================================

-- VIP挑战详情视图（增强版）
CREATE OR REPLACE VIEW vip_challenge_details_enhanced AS
SELECT 
    vc.id,
    vc.user_id,
    vc.vip_level_id,
    vc.challenge_type,
    vc.status,
    vc.deposit_amount,
    vc.frozen_deposit_amount,
    vc.total_earned_reward,
    vc.total_claimed_reward,
    vc.required_consecutive_days,
    vc.current_consecutive_days,
    vc.failed_days,
    vc.max_failed_days,
    vc.start_date,
    vc.end_date,
    vc.last_activity_date,
    vc.completed_at,
    vc.timeout_at,
    vc.third_party_source,
    
    -- 用户信息
    u.username,
    u.email,
    
    -- VIP等级信息
    vl.name as level_name,
    vl.description as level_description,
    vl.icon as level_icon,
    vl.color as level_color,
    vl.step_target,
    vl.daily_reward,
    vl.final_reward,
    vl.bonus_reward,
    
    -- 计算字段
    CASE 
        WHEN vc.status = 'active' THEN 
            CASE 
                WHEN vc.failed_days > vc.max_failed_days THEN 'failed'
                WHEN vc.current_consecutive_days >= vc.required_consecutive_days THEN 'completed'
                ELSE 'active'
            END
        ELSE vc.status
    END as calculated_status,
    
    CASE 
        WHEN vc.status = 'active' THEN 
            ROUND((vc.current_consecutive_days / vc.required_consecutive_days) * 100, 2)
        ELSE 0 
    END as progress_percentage,
    
    CASE 
        WHEN vc.status = 'active' THEN 
            vc.required_consecutive_days - vc.current_consecutive_days
        ELSE 0 
    END as remaining_days,
    
    CASE 
        WHEN vc.status = 'active' THEN 
            CASE 
                WHEN vc.failed_days > vc.max_failed_days THEN 'challenge_failed'
                WHEN vc.current_consecutive_days >= vc.required_consecutive_days THEN 'challenge_completed'
                ELSE 'in_progress'
            END
        ELSE 'not_active'
    END as challenge_status,
    
    CASE 
        WHEN vc.deposit_amount > 0 THEN 
            ROUND(((vc.total_earned_reward - vc.deposit_amount) / vc.deposit_amount) * 100, 2)
        ELSE 0 
    END as roi_percentage
    
FROM vip_challenges vc
LEFT JOIN users u ON vc.user_id = u.id
LEFT JOIN vip_levels vl ON vc.vip_level_id = vl.id;

-- VIP挑战每日统计视图
CREATE OR REPLACE VIEW vip_challenge_daily_stats AS
SELECT 
    DATE(created_at) as date,
    vip_level_id,
    COUNT(*) as total_challenges,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_challenges,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_challenges,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_challenges,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_challenges,
    COUNT(CASE WHEN status = 'timeout' THEN 1 END) as timeout_challenges,
    SUM(deposit_amount) as total_deposits,
    SUM(frozen_deposit_amount) as total_frozen_deposits,
    SUM(total_earned_reward) as total_earned_rewards,
    SUM(total_claimed_reward) as total_claimed_rewards,
    ROUND(AVG(CASE WHEN status = 'completed' THEN (total_earned_reward - deposit_amount) / deposit_amount * 100 ELSE NULL END), 2) as avg_roi
FROM vip_challenges
GROUP BY DATE(created_at), vip_level_id
ORDER BY date DESC, vip_level_id;

-- 用户挑战统计视图
CREATE OR REPLACE VIEW user_challenge_stats AS
SELECT 
    u.id as user_id,
    u.username,
    u.email,
    COUNT(vc.id) as total_challenges,
    COUNT(CASE WHEN vc.status = 'completed' THEN 1 END) as completed_challenges,
    COUNT(CASE WHEN vc.status = 'failed' THEN 1 END) as failed_challenges,
    COUNT(CASE WHEN vc.status = 'timeout' THEN 1 END) as timeout_challenges,
    SUM(vc.deposit_amount) as total_deposits,
    SUM(vc.total_earned_reward) as total_earned_rewards,
    SUM(vc.total_claimed_reward) as total_claimed_rewards,
    ROUND(AVG(CASE WHEN vc.status = 'completed' THEN (vc.total_earned_reward - vc.deposit_amount) / vc.deposit_amount * 100 ELSE NULL END), 2) as avg_roi,
    MAX(vc.created_at) as last_challenge_date,
    SUM(vc.current_consecutive_days) as total_consecutive_days,
    SUM(vc.failed_days) as total_failed_days
FROM users u
LEFT JOIN vip_challenges vc ON u.id = vc.user_id
GROUP BY u.id, u.username, u.email;

-- ==========================================
-- 7. 验证迁移结果
-- ==========================================

-- 检查表结构
SELECT 'vip_levels' as table_name, COUNT(*) as column_count 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vip_levels'
UNION ALL
SELECT 'vip_challenges' as table_name, COUNT(*) as column_count 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vip_challenges'
UNION ALL
SELECT 'vip_challenge_daily_records' as table_name, COUNT(*) as column_count 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vip_challenge_daily_records'
UNION ALL
SELECT 'vip_challenge_penalties' as table_name, COUNT(*) as column_count 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vip_challenge_penalties'
UNION ALL
SELECT 'third_party_api_configs' as table_name, COUNT(*) as column_count 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'third_party_api_configs'
UNION ALL
SELECT 'third_party_user_auths' as table_name, COUNT(*) as column_count 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'third_party_user_auths';

-- 检查数据完整性
SELECT 'vip_levels' as table_name, COUNT(*) as record_count FROM vip_levels
UNION ALL
SELECT 'vip_challenges' as table_name, COUNT(*) as record_count FROM vip_challenges
UNION ALL
SELECT 'third_party_api_configs' as table_name, COUNT(*) as record_count FROM third_party_api_configs;

-- 提交事务
COMMIT;

-- 输出迁移完成信息
SELECT 'VIP挑战系统数据库迁移完成！' as message;
SELECT '新功能包括：' as feature;
SELECT '1. 管理员可配置的处罚机制' as detail;
SELECT '2. 连续挑战逻辑优化' as detail;
SELECT '3. 第三方API接口预留' as detail;
SELECT '4. 每日记录和统计功能' as detail;
SELECT '5. 超时检查和自动处理' as detail;
