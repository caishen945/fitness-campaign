-- FitChallenge 数据库索引优化脚本
-- 提升查询性能，优化数据库结构

-- 1. VIP挑战相关索引优化
-- 为vip_challenges表添加复合索引
CREATE INDEX IF NOT EXISTS idx_vip_challenge_user_status ON vip_challenges(user_id, status);
CREATE INDEX IF NOT EXISTS idx_vip_challenge_level_status ON vip_challenges(vip_level_id, status);
CREATE INDEX IF NOT EXISTS idx_vip_challenge_date_range ON vip_challenges(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_vip_challenge_consecutive ON vip_challenges(user_id, current_consecutive_days, required_consecutive_days);

-- 2. 用户钱包相关索引优化
-- 为user_wallets表添加索引
CREATE INDEX IF NOT EXISTS idx_user_wallet_balance ON user_wallets(balance);
CREATE INDEX IF NOT EXISTS idx_user_wallet_frozen ON user_wallets(frozen_balance);

-- 3. 钱包交易相关索引优化
-- 为wallet_transactions表添加索引
CREATE INDEX IF NOT EXISTS idx_wallet_trans_user_type ON wallet_transactions(user_id, transaction_type);
CREATE INDEX IF NOT EXISTS idx_wallet_trans_date ON wallet_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_wallet_trans_amount ON wallet_transactions(amount);

-- 4. 签到相关索引优化
-- 为checkin_records表添加索引
CREATE INDEX IF NOT EXISTS idx_checkin_user_date ON checkin_records(user_id, checkin_date);
CREATE INDEX IF NOT EXISTS idx_checkin_consecutive ON checkin_records(user_id, consecutive_days);

-- 5. 用户步数相关索引优化
-- 为user_steps表添加索引
CREATE INDEX IF NOT EXISTS idx_user_steps_date_range ON user_steps(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_steps_source ON user_steps(source);

-- 6. 成就相关索引优化
-- 为achievements表添加索引
CREATE INDEX IF NOT EXISTS idx_achievement_user_type ON achievements(user_id, achievement_type);
CREATE INDEX IF NOT EXISTS idx_achievement_date ON achievements(earned_at);

-- 7. 团队相关索引优化
-- 为team_members表添加索引
CREATE INDEX IF NOT EXISTS idx_team_member_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_member_team ON team_members(team_id);

-- 8. PK挑战相关索引优化
-- 为pk_challenges表添加索引
CREATE INDEX IF NOT EXISTS idx_pk_challenge_status ON pk_challenges(status);
CREATE INDEX IF NOT EXISTS idx_pk_challenge_date ON pk_challenges(created_at);

-- 9. 系统配置相关索引优化
-- 为system_configs表添加索引
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_configs(config_key);

-- 10. 分析表性能
-- 查看表的大小和索引使用情况
SELECT 
    table_name,
    table_rows,
    data_length,
    index_length,
    (data_length + index_length) as total_size
FROM information_schema.tables 
WHERE table_schema = 'fitchallenge'
ORDER BY total_size DESC;

-- 11. 查看索引使用统计
SELECT 
    table_name,
    index_name,
    cardinality,
    sub_part,
    packed,
    null,
    index_type
FROM information_schema.statistics 
WHERE table_schema = 'fitchallenge'
ORDER BY table_name, index_name;

-- 12. 优化表结构
-- 对主要表进行优化
OPTIMIZE TABLE vip_challenges;
OPTIMIZE TABLE user_wallets;
OPTIMIZE TABLE wallet_transactions;
OPTIMIZE TABLE checkin_records;
OPTIMIZE TABLE user_steps;
OPTIMIZE TABLE achievements;
OPTIMIZE TABLE team_members;
OPTIMIZE TABLE pk_challenges;

-- 13. 更新表统计信息
ANALYZE TABLE vip_challenges;
ANALYZE TABLE user_wallets;
ANALYZE TABLE wallet_transactions;
ANALYZE TABLE checkin_records;
ANALYZE TABLE user_steps;
ANALYZE TABLE achievements;
ANALYZE TABLE team_members;
ANALYZE TABLE pk_challenges;
