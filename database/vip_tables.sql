-- VIP等级表
CREATE TABLE IF NOT EXISTS vip_levels (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT '等级名称',
    description TEXT COMMENT '等级描述',
    deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '押金金额(USDT)',
    step_target INT NOT NULL DEFAULT 0 COMMENT '步数目标',
    reward_amount DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '奖励金额(USDT)',
    max_challenges INT NOT NULL DEFAULT -1 COMMENT '每日挑战次数限制，-1表示无限制',
    duration INT NOT NULL DEFAULT 1 COMMENT '挑战持续时间（天）',
    icon VARCHAR(10) NOT NULL DEFAULT '🏆' COMMENT '等级图标',
    color VARCHAR(20) NOT NULL DEFAULT '#FFD700' COMMENT '等级颜色',
    cancel_deduct_ratio DECIMAL(3,2) NOT NULL DEFAULT 0.05 COMMENT '取消挑战扣除比例',
    cancel_reward_ratio DECIMAL(3,2) NOT NULL DEFAULT 0.02 COMMENT '取消挑战奖励比例',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否激活',
    
    -- 新增字段：连续挑战配置
    required_consecutive_days INT NOT NULL DEFAULT 1 COMMENT '需要连续完成的天数',
    max_failed_days INT NOT NULL DEFAULT 3 COMMENT '最大允许失败天数',
    daily_reward DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '每日完成奖励',
    final_reward DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '最终完成奖励',
    partial_refund_ratio DECIMAL(3,2) NOT NULL DEFAULT 0.80 COMMENT '部分失败时的押金退还比例',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_name (name),
    INDEX idx_is_active (is_active),
    INDEX idx_deposit_amount (deposit_amount)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='VIP等级配置表';

-- VIP挑战记录表
CREATE TABLE IF NOT EXISTS vip_challenges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '用户ID',
    vip_level_id INT NOT NULL COMMENT 'VIP等级ID',
    challenge_type ENUM('daily', 'weekly', 'monthly') NOT NULL DEFAULT 'daily' COMMENT '挑战类型',
    step_target INT NOT NULL DEFAULT 0 COMMENT '步数目标',
    current_steps INT NOT NULL DEFAULT 0 COMMENT '当前步数',
    start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '挑战开始时间',
    end_date TIMESTAMP NULL COMMENT '挑战结束时间',
    status ENUM('active', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'active' COMMENT '挑战状态',
    deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '押金金额',
    reward_amount DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '奖励金额',
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    -- 新增字段：连续挑战支持
    required_consecutive_days INT NOT NULL DEFAULT 1 COMMENT '需要连续完成的天数',
    current_consecutive_days INT NOT NULL DEFAULT 0 COMMENT '当前连续完成的天数',
    failed_days INT NOT NULL DEFAULT 0 COMMENT '失败的天数',
    max_failed_days INT NOT NULL DEFAULT 3 COMMENT '最大允许失败天数',
    daily_reward DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '每日完成奖励',
    final_reward DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '最终完成奖励',
    partial_refund_ratio DECIMAL(3,2) NOT NULL DEFAULT 0.80 COMMENT '部分失败时的押金退还比例',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vip_level_id) REFERENCES vip_levels(id) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id),
    INDEX idx_vip_level_id (vip_level_id),
    INDEX idx_status (status),
    INDEX idx_challenge_type (challenge_type),
    INDEX idx_start_date (start_date),
    INDEX idx_end_date (end_date),
    INDEX idx_created_at (created_at),
    INDEX idx_consecutive_days (required_consecutive_days, current_consecutive_days)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='VIP挑战记录表';

-- 插入默认VIP等级数据
INSERT INTO vip_levels (name, description, deposit_amount, step_target, reward_amount, max_challenges, duration, icon, color, cancel_deduct_ratio, cancel_reward_ratio, required_consecutive_days, max_failed_days, daily_reward, final_reward, partial_refund_ratio) VALUES
('青铜挑战', '适合初学者的基础挑战，连续3天完成即可获得奖励', 500.00, 1000, 0.50, -1, 1, '🥉', '#CD7F32', 0.05, 0.02, 3, 2, 0.20, 0.50, 0.80),
('白银挑战', '中等难度的进阶挑战，连续5天完成即可获得奖励', 1000.00, 3000, 1.50, -1, 1, '🥈', '#C0C0C0', 0.05, 0.02, 5, 3, 0.40, 1.50, 0.75),
('黄金挑战', '高难度的精英挑战，连续7天完成即可获得奖励', 2000.00, 5000, 3.00, -1, 1, '🥇', '#FFD700', 0.05, 0.02, 7, 4, 0.60, 3.00, 0.70)
ON DUPLICATE KEY UPDATE
    description = VALUES(description),
    deposit_amount = VALUES(deposit_amount),
    step_target = VALUES(step_target),
    reward_amount = VALUES(reward_amount),
    icon = VALUES(icon),
    color = VALUES(color),
    required_consecutive_days = VALUES(required_consecutive_days),
    max_failed_days = VALUES(max_failed_days),
    daily_reward = VALUES(daily_reward),
    final_reward = VALUES(final_reward),
    partial_refund_ratio = VALUES(partial_refund_ratio);

-- 创建视图：VIP挑战详情视图
CREATE OR REPLACE VIEW vip_challenge_details AS
SELECT 
    vc.id,
    vc.user_id,
    vc.vip_level_id,
    vc.challenge_type,
    vc.step_target,
    vc.current_steps,
    vc.start_date,
    vc.end_date,
    vc.status,
    vc.deposit_amount,
    vc.reward_amount,
    vc.completed_at,
    vc.created_at,
    vc.updated_at,
    -- 用户信息
    u.username,
    u.email,
    u.created_at as user_created_at,
    -- VIP等级信息
    vl.name as level_name,
    vl.description as level_description,
    vl.icon as level_icon,
    vl.color as level_color,
    vl.cancel_deduct_ratio,
    vl.cancel_reward_ratio,
    -- 计算字段
    CASE 
        WHEN vc.step_target > 0 THEN ROUND((vc.current_steps / vc.step_target) * 100, 2)
        ELSE 0 
    END as progress_percentage,
    CASE 
        WHEN vc.step_target > vc.current_steps THEN vc.step_target - vc.current_steps
        ELSE 0 
    END as remaining_steps,
    CASE 
        WHEN vc.end_date > NOW() THEN TIMESTAMPDIFF(DAY, NOW(), vc.end_date)
        ELSE 0 
    END as remaining_days,
    CASE 
        WHEN vc.deposit_amount > 0 THEN ROUND(((vc.reward_amount - vc.deposit_amount) / vc.deposit_amount) * 100, 2)
        ELSE 0 
    END as roi_percentage
FROM vip_challenges vc
LEFT JOIN users u ON vc.user_id = u.id
LEFT JOIN vip_levels vl ON vc.vip_level_id = vl.id;

-- 创建视图：VIP挑战统计视图
CREATE OR REPLACE VIEW vip_challenge_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_challenges,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_challenges,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_challenges,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_challenges,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_challenges,
    SUM(deposit_amount) as total_deposits,
    SUM(reward_amount) as total_rewards,
    SUM(CASE WHEN status = 'completed' THEN reward_amount ELSE 0 END) as completed_rewards,
    ROUND(AVG(CASE WHEN status = 'completed' THEN (reward_amount - deposit_amount) / deposit_amount * 100 ELSE NULL END), 2) as avg_roi
FROM vip_challenges
GROUP BY DATE(created_at)
ORDER BY date DESC;
