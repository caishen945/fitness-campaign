-- 初始化签到配置
INSERT INTO system_configs (config_key, config_value, description) VALUES
('checkin_base_reward', '0.1', '基础签到奖励');

INSERT INTO system_configs (config_key, config_value, description) VALUES
('checkin_consecutive_reward_7', '0.1', '连续签到7天额外奖励');

INSERT INTO system_configs (config_key, config_value, description) VALUES
('checkin_consecutive_reward_30', '0.2', '连续签到30天额外奖励');
