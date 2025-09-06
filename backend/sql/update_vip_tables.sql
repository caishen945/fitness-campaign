-- VIP等级和挑战表结构更新脚本
-- 执行日期: 2025-01-14

-- 1. 更新vip_levels表，添加新字段
ALTER TABLE vip_levels 
ADD COLUMN IF NOT EXISTS max_challenges INT DEFAULT 1 COMMENT '每个账号总共可挑战次数',
ADD COLUMN IF NOT EXISTS cancel_deduct_ratio DECIMAL(5,4) DEFAULT 0.1000 COMMENT '取消挑战扣除押金比例',
ADD COLUMN IF NOT EXISTS cancel_reward_ratio DECIMAL(5,4) DEFAULT 0.0000 COMMENT '取消挑战是否可获得当日奖励',
ADD COLUMN IF NOT EXISTS partial_refund_ratio DECIMAL(5,4) DEFAULT 0.8000 COMMENT '连续挑战失败扣除押金比例',
ADD COLUMN IF NOT EXISTS max_failed_days INT DEFAULT 3 COMMENT '最大允许失败天数',
ADD COLUMN IF NOT EXISTS required_consecutive_days INT DEFAULT 1 COMMENT '需要连续完成的天数',
ADD COLUMN IF NOT EXISTS daily_reward DECIMAL(10,4) DEFAULT 0.0000 COMMENT '每日完成奖励',
ADD COLUMN IF NOT EXISTS final_reward DECIMAL(10,4) DEFAULT 0.0000 COMMENT '最终完成奖励';

-- 2. 更新vip_challenges表，添加新字段
ALTER TABLE vip_challenges 
ADD COLUMN IF NOT EXISTS max_challenges INT DEFAULT 1 COMMENT '每个账号总共可挑战次数',
ADD COLUMN IF NOT EXISTS cancel_deduct_ratio DECIMAL(5,4) DEFAULT 0.1000 COMMENT '取消挑战扣除押金比例',
ADD COLUMN IF NOT EXISTS cancel_reward_ratio DECIMAL(5,4) DEFAULT 0.0000 COMMENT '取消挑战是否可获得当日奖励',
ADD COLUMN IF NOT EXISTS partial_refund_ratio DECIMAL(5,4) DEFAULT 0.8000 COMMENT '连续挑战失败扣除押金比例',
ADD COLUMN IF NOT EXISTS max_failed_days INT DEFAULT 3 COMMENT '最大允许失败天数',
ADD COLUMN IF NOT EXISTS required_consecutive_days INT DEFAULT 1 COMMENT '需要连续完成的天数',
ADD COLUMN IF NOT EXISTS daily_reward DECIMAL(10,4) DEFAULT 0.0000 COMMENT '每日完成奖励',
ADD COLUMN IF NOT EXISTS final_reward DECIMAL(10,4) DEFAULT 0.0000 COMMENT '最终完成奖励';

-- 3. 为现有记录设置默认值
UPDATE vip_levels SET 
    max_challenges = 1,
    cancel_deduct_ratio = 0.1000,
    cancel_reward_ratio = 0.0000,
    partial_refund_ratio = 0.8000,
    max_failed_days = 3,
    required_consecutive_days = 1,
    daily_reward = reward_amount / 30,
    final_reward = reward_amount
WHERE max_challenges IS NULL;

-- 4. 为现有挑战记录设置默认值
UPDATE vip_challenges SET 
    max_challenges = 1,
    cancel_deduct_ratio = 0.1000,
    cancel_reward_ratio = 0.0000,
    partial_refund_ratio = 0.8000,
    max_failed_days = 3,
    required_consecutive_days = 1,
    daily_reward = reward_amount / 30,
    final_reward = reward_amount
WHERE max_challenges IS NULL;

-- 5. 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_vip_levels_max_challenges ON vip_levels(max_challenges);
CREATE INDEX IF NOT EXISTS idx_vip_challenges_user_max_challenges ON vip_challenges(user_id, max_challenges);
CREATE INDEX IF NOT EXISTS idx_vip_challenges_status_date ON vip_challenges(status, start_date);

-- 6. 验证表结构更新
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN ('vip_levels', 'vip_challenges')
AND COLUMN_NAME IN ('max_challenges', 'cancel_deduct_ratio', 'cancel_reward_ratio', 
                   'partial_refund_ratio', 'max_failed_days', 'required_consecutive_days', 
                   'daily_reward', 'final_reward')
ORDER BY TABLE_NAME, COLUMN_NAME;
