-- 系统配置表
CREATE TABLE IF NOT EXISTS system_configs (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value TEXT NOT NULL,
    description TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 初始化签到配置
INSERT INTO system_configs (config_key, config_value, description) VALUES
('checkin_base_reward', '0.1', '基础签到奖励'),
('checkin_consecutive_reward_7', '0.1', '连续签到7天额外奖励'),
('checkin_consecutive_reward_30', '0.2', '连续签到30天额外奖励')
ON DUPLICATE KEY UPDATE config_value = VALUES(config_value), description = VALUES(description);
