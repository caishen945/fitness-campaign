-- ========================================
-- FitChallenge 钱包系统数据库结构升级脚本
-- 升级时间: 2025-01-14
-- 目标: 将旧版简化表结构升级到完整业务架构
-- ========================================

-- 重要提示: 在执行此脚本前，请确保已备份数据库！

-- 1. 备份现有数据到临时表
CREATE TABLE wallet_transactions_backup AS SELECT * FROM wallet_transactions;
CREATE TABLE user_wallets_backup AS SELECT * FROM user_wallets;

-- 显示备份确认
SELECT COUNT(*) as backed_up_transactions FROM wallet_transactions_backup;
SELECT COUNT(*) as backed_up_wallets FROM user_wallets_backup;

-- 2. 删除现有 wallet_transactions 表（因为枚举值需要重新定义）
DROP TABLE IF EXISTS wallet_transactions;

-- 3. 创建新的 wallet_transactions 表（基于最新schema）
CREATE TABLE wallet_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    transaction_type ENUM(
        'deposit',           -- 充值
        'withdrawal',        -- 提现
        'reward',            -- 奖励
        'challenge_deposit', -- 挑战押金
        'challenge_refund',  -- 挑战退款
        'challenge_reward',  -- 挑战奖励
        'challenge_penalty', -- 挑战罚金
        'checkin_reward',    -- 签到奖励
        'admin_adjust',      -- 管理员调整
        'system_deduct',     -- 系统扣除
        'referral_reward'    -- 推荐奖励
    ) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    balance_before DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2) NOT NULL,
    description TEXT,
    reference_id VARCHAR(100),
    reference_type VARCHAR(50),
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'completed',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_reference (reference_type, reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='钱包交易记录表';

-- 4. 升级 user_wallets 表结构（添加缺失字段）
ALTER TABLE user_wallets 
ADD COLUMN IF NOT EXISTS total_rewarded DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT '累计奖励金额' AFTER total_withdrawn,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at,
MODIFY COLUMN balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT '可用余额',
MODIFY COLUMN frozen_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT '冻结余额',
MODIFY COLUMN total_deposited DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT '累计充值',
MODIFY COLUMN total_withdrawn DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT '累计提现';

-- 5. 数据迁移逻辑
-- 5.1 迁移旧交易记录，并修正数据类型
INSERT INTO wallet_transactions (
    user_id, 
    transaction_type, 
    amount, 
    balance_before, 
    balance_after, 
    description,
    status,
    created_at
)
SELECT 
    user_id,
    -- 修正交易类型：将错误标记为reward的管理员操作改为admin_adjust
    CASE 
        WHEN transaction_type = 'reward' AND description LIKE '%管理员%' THEN 'admin_adjust'
        ELSE transaction_type 
    END,
    amount,
    -- 由于原始数据缺少balance_before/after，使用合理估算
    -- 这里需要根据用户当前余额和交易时间倒推
    0.00 as balance_before,  -- 临时占位，后续通过计算修正
    0.00 as balance_after,   -- 临时占位，后续通过计算修正
    CASE 
        WHEN description LIKE '%管理员%' THEN REPLACE(description, '管理员增加余额', '管理员余额调整')
        ELSE description 
    END,
    'completed',
    created_at
FROM wallet_transactions_backup
ORDER BY created_at ASC;

-- 6. 重新计算并修正 balance_before 和 balance_after
-- 这是一个复杂的过程，需要按时间顺序重新计算每个用户的余额变化

-- 创建临时存储过程来处理余额计算
DELIMITER //
CREATE PROCEDURE RecalculateBalances()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE current_user_id INT;
    DECLARE running_balance DECIMAL(15,2) DEFAULT 0.00;
    
    -- 声明游标来遍历所有用户
    DECLARE user_cursor CURSOR FOR 
        SELECT DISTINCT user_id FROM wallet_transactions ORDER BY user_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN user_cursor;
    
    user_loop: LOOP
        FETCH user_cursor INTO current_user_id;
        IF done THEN
            LEAVE user_loop;
        END IF;
        
        -- 获取用户当前余额作为起点
        SELECT COALESCE(balance, 0) INTO running_balance 
        FROM user_wallets 
        WHERE user_id = current_user_id;
        
        -- 倒序处理该用户的交易记录以重建历史余额
        BEGIN
            DECLARE tx_done INT DEFAULT FALSE;
            DECLARE tx_id INT;
            DECLARE tx_amount DECIMAL(15,2);
            DECLARE tx_type VARCHAR(20);
            
            DECLARE tx_cursor CURSOR FOR 
                SELECT id, amount, transaction_type 
                FROM wallet_transactions 
                WHERE user_id = current_user_id 
                ORDER BY created_at DESC, id DESC;
            DECLARE CONTINUE HANDLER FOR NOT FOUND SET tx_done = TRUE;
            
            OPEN tx_cursor;
            
            tx_loop: LOOP
                FETCH tx_cursor INTO tx_id, tx_amount, tx_type;
                IF tx_done THEN
                    LEAVE tx_loop;
                END IF;
                
                -- 更新当前交易的balance_after
                UPDATE wallet_transactions 
                SET balance_after = running_balance 
                WHERE id = tx_id;
                
                -- 计算交易前余额
                IF tx_type IN ('deposit', 'reward', 'admin_adjust', 'challenge_refund', 'challenge_reward', 'checkin_reward', 'referral_reward') THEN
                    SET running_balance = running_balance - tx_amount;
                ELSE
                    SET running_balance = running_balance + tx_amount;
                END IF;
                
                -- 更新交易前余额
                UPDATE wallet_transactions 
                SET balance_before = running_balance 
                WHERE id = tx_id;
                
            END LOOP;
            
            CLOSE tx_cursor;
        END;
        
    END LOOP;
    
    CLOSE user_cursor;
END //
DELIMITER ;

-- 执行余额重计算
CALL RecalculateBalances();

-- 清理临时存储过程
DROP PROCEDURE RecalculateBalances;

-- 7. 验证迁移结果
SELECT 
    'Migration Summary' as check_type,
    COUNT(*) as total_transactions,
    COUNT(DISTINCT user_id) as affected_users,
    SUM(CASE WHEN transaction_type = 'admin_adjust' THEN 1 ELSE 0 END) as admin_adjustments,
    SUM(CASE WHEN balance_before = 0 AND balance_after = 0 THEN 1 ELSE 0 END) as records_needing_balance_fix
FROM wallet_transactions;

-- 显示按类型分组的交易统计
SELECT transaction_type, COUNT(*) as count 
FROM wallet_transactions 
GROUP BY transaction_type 
ORDER BY count DESC;

-- 8. 创建新表结构确认
DESCRIBE wallet_transactions;
DESCRIBE user_wallets;

-- 迁移完成标志
SELECT 'DATABASE SCHEMA UPGRADE COMPLETED' as status, NOW() as completed_at;

-- 重要提示：
-- 1. 请验证所有功能正常后再删除备份表
-- 2. 如发现问题，可从备份表恢复：
--    DROP TABLE wallet_transactions;
--    CREATE TABLE wallet_transactions AS SELECT * FROM wallet_transactions_backup;
--    ALTER TABLE wallet_transactions ADD PRIMARY KEY (id);
