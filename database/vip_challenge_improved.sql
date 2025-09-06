-- 改进后的VIP挑战系统数据库结构
-- 包含管理员可配置的处罚机制、连续挑战逻辑、第三方API预留等

-- ==========================================
-- VIP等级配置表（增强版）
-- ==========================================
CREATE TABLE IF NOT EXISTS vip_levels (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT '等级名称',
    description TEXT COMMENT '等级描述',
    deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '押金金额(USDT)',
    step_target INT NOT NULL DEFAULT 0 COMMENT '每日步数目标',
    max_challenges INT NOT NULL DEFAULT -1 COMMENT '每日挑战次数限制，-1表示无限制',
    duration INT NOT NULL DEFAULT 1 COMMENT '挑战持续时间（天）',
    icon VARCHAR(10) NOT NULL DEFAULT '🏆' COMMENT '等级图标',
    color VARCHAR(20) NOT NULL DEFAULT '#FFD700' COMMENT '等级颜色',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否激活',
    
    -- 连续挑战配置
    required_consecutive_days INT NOT NULL DEFAULT 1 COMMENT '需要连续完成的天数',
    max_failed_days INT NOT NULL DEFAULT 3 COMMENT '最大允许失败天数',
    
    -- 奖励配置
    daily_reward DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '每日完成奖励',
    final_reward DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '最终完成奖励（连续完成所有天数后）',
    bonus_reward DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '额外奖励（如全勤奖等）',
    
    -- 处罚配置（管理员可设置）
    deposit_deduct_ratio DECIMAL(3,2) NOT NULL DEFAULT 0.20 COMMENT '失败时押金扣除比例(0-1)',
    reward_deduct_ratio DECIMAL(3,2) NOT NULL DEFAULT 0.00 COMMENT '失败时奖励扣除比例(0-1)',
    partial_refund_ratio DECIMAL(3,2) NOT NULL DEFAULT 0.80 COMMENT '部分失败时的押金退还比例(0-1)',
    cancel_deduct_ratio DECIMAL(3,2) NOT NULL DEFAULT 0.05 COMMENT '主动取消挑战扣除比例(0-1)',
    timeout_deduct_ratio DECIMAL(3,2) NOT NULL DEFAULT 0.30 COMMENT '超时失败扣除比例(0-1)',
    
    -- 时间配置
    daily_deadline TIME NOT NULL DEFAULT '23:59:59' COMMENT '每日挑战截止时间',
    reward_delay_hours INT NOT NULL DEFAULT 24 COMMENT '奖励延迟发放时间（小时）',
    auto_timeout_hours INT NOT NULL DEFAULT 48 COMMENT '自动超时时间（小时）',
    
    -- 第三方API配置
    allow_third_party BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否允许第三方API数据',
    min_third_party_steps INT NOT NULL DEFAULT 100 COMMENT '第三方API最小步数要求',
    max_third_party_steps INT NOT NULL DEFAULT 50000 COMMENT '第三方API最大步数限制',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_name (name),
    INDEX idx_is_active (is_active),
    INDEX idx_deposit_amount (deposit_amount),
    INDEX idx_consecutive_days (required_consecutive_days)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='VIP等级配置表（增强版）';

-- ==========================================
-- VIP挑战记录表（增强版）
-- ==========================================
CREATE TABLE IF NOT EXISTS vip_challenges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '用户ID',
    vip_level_id INT NOT NULL COMMENT 'VIP等级ID',
    challenge_type ENUM('daily', 'weekly', 'monthly') NOT NULL DEFAULT 'daily' COMMENT '挑战类型',
    status ENUM('active', 'completed', 'failed', 'cancelled', 'timeout') NOT NULL DEFAULT 'active' COMMENT '挑战状态',
    
    -- 押金和奖励
    deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '押金金额',
    frozen_deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '冻结的押金金额',
    total_earned_reward DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '累计获得奖励',
    total_claimed_reward DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '累计领取奖励',
    
    -- 挑战进度
    required_consecutive_days INT NOT NULL DEFAULT 1 COMMENT '需要连续完成的天数',
    current_consecutive_days INT NOT NULL DEFAULT 0 COMMENT '当前连续完成的天数',
    failed_days INT NOT NULL DEFAULT 0 COMMENT '失败的天数',
    max_failed_days INT NOT NULL DEFAULT 3 COMMENT '最大允许失败天数',
    
    -- 时间管理
    start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '挑战开始时间',
    end_date TIMESTAMP NULL COMMENT '挑战结束时间',
    last_activity_date DATE NULL COMMENT '最后活动日期',
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    timeout_at TIMESTAMP NULL COMMENT '超时时间',
    
    -- 第三方API数据
    third_party_source ENUM('google_fit', 'ios_healthkit', 'manual', 'other') NOT NULL DEFAULT 'manual' COMMENT '数据来源',
    third_party_data JSON NULL COMMENT '第三方API原始数据',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vip_level_id) REFERENCES vip_levels(id) ON DELETE RESTRICT,
    
    INDEX idx_user_id (user_id),
    INDEX idx_vip_level_id (vip_level_id),
    INDEX idx_status (status),
    INDEX idx_challenge_type (challenge_type),
    INDEX idx_start_date (start_date),
    INDEX idx_end_date (end_date),
    INDEX idx_last_activity (last_activity_date),
    INDEX idx_consecutive_days (required_consecutive_days, current_consecutive_days),
    INDEX idx_third_party (third_party_source)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='VIP挑战记录表（增强版）';

-- ==========================================
-- VIP挑战每日记录表（新增）
-- ==========================================
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

-- ==========================================
-- VIP挑战处罚记录表（新增）
-- ==========================================
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

-- ==========================================
-- 第三方API配置表（新增）
-- ==========================================
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

-- ==========================================
-- 第三方API用户授权表（新增）
-- ==========================================
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
-- 插入改进后的默认VIP等级数据
-- ==========================================
INSERT INTO vip_levels (
    name, description, deposit_amount, step_target, max_challenges, duration,
    icon, color, is_active, required_consecutive_days, max_failed_days,
    daily_reward, final_reward, bonus_reward,
    deposit_deduct_ratio, reward_deduct_ratio, partial_refund_ratio,
    cancel_deduct_ratio, timeout_deduct_ratio,
    daily_deadline, reward_delay_hours, auto_timeout_hours,
    allow_third_party, min_third_party_steps, max_third_party_steps
) VALUES
(
    '青铜挑战', 
    '适合初学者的基础挑战，连续3天完成即可获得奖励，每天1000步目标',
    500.00, 1000, -1, 3,
    '🥉', '#CD7F32', TRUE, 3, 1,
    0.20, 0.50, 0.10,
    0.20, 0.00, 0.80,
    0.05, 0.30,
    '23:59:59', 24, 48,
    TRUE, 100, 50000
),
(
    '白银挑战', 
    '中等难度的进阶挑战，连续5天完成即可获得奖励，每天3000步目标',
    1000.00, 3000, -1, 5,
    '🥈', '#C0C0C0', TRUE, 5, 2,
    0.40, 1.50, 0.25,
    0.25, 0.00, 0.75,
    0.08, 0.35,
    '23:59:59', 24, 48,
    TRUE, 100, 50000
),
(
    '黄金挑战', 
    '高难度的精英挑战，连续7天完成即可获得奖励，每天5000步目标',
    2000.00, 5000, -1, 7,
    '🥇', '#FFD700', TRUE, 7, 3,
    0.60, 3.00, 0.50,
    0.30, 0.00, 0.70,
    0.10, 0.40,
    '23:59:59', 24, 48,
    TRUE, 100, 50000
)
ON DUPLICATE KEY UPDATE
    description = VALUES(description),
    deposit_amount = VALUES(deposit_amount),
    step_target = VALUES(step_target),
    required_consecutive_days = VALUES(required_consecutive_days),
    max_failed_days = VALUES(max_failed_days),
    daily_reward = VALUES(daily_reward),
    final_reward = VALUES(final_reward),
    bonus_reward = VALUES(bonus_reward),
    deposit_deduct_ratio = VALUES(deposit_deduct_ratio),
    reward_deduct_ratio = VALUES(reward_deduct_ratio),
    partial_refund_ratio = VALUES(partial_refund_ratio),
    cancel_deduct_ratio = VALUES(cancel_deduct_ratio),
    timeout_deduct_ratio = VALUES(timeout_deduct_ratio),
    daily_deadline = VALUES(daily_deadline),
    reward_delay_hours = VALUES(reward_delay_hours),
    auto_timeout_hours = VALUES(auto_timeout_hours),
    allow_third_party = VALUES(allow_third_party),
    min_third_party_steps = VALUES(min_third_party_steps),
    max_third_party_steps = VALUES(max_third_party_steps);

-- ==========================================
-- 插入第三方API配置
-- ==========================================
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
-- 创建改进后的视图
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

COMMIT;
