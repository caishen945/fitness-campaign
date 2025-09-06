-- ========================================
-- FitChallenge 钱包余额体系
-- ========================================

-- 用户钱包余额表
CREATE TABLE IF NOT EXISTS user_wallets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT '当前余额(USDT)',
    frozen_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT '冻结余额(USDT)',
    total_deposited DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT '累计充值金额',
    total_withdrawn DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT '累计提现金额',
    total_rewarded DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT '累计奖励金额',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_balance (balance)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户钱包余额表';

-- 钱包交易记录表（扩展版）
CREATE TABLE IF NOT EXISTS wallet_transactions (
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
    amount DECIMAL(15, 2) NOT NULL COMMENT '交易金额(USDT)',
    balance_before DECIMAL(15, 2) NOT NULL COMMENT '交易前余额',
    balance_after DECIMAL(15, 2) NOT NULL COMMENT '交易后余额',
    description TEXT COMMENT '交易描述',
    reference_id VARCHAR(100) COMMENT '关联ID(如挑战ID、签到ID等)',
    reference_type VARCHAR(50) COMMENT '关联类型',
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'completed',
    admin_notes TEXT COMMENT '管理员备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_reference (reference_type, reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='钱包交易记录表';

-- 充值订单表
CREATE TABLE IF NOT EXISTS deposit_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '订单号',
    user_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL COMMENT '充值金额(USDT)',
    payment_method ENUM('trc20', 'erc20', 'admin', 'system') NOT NULL COMMENT '支付方式',
    trx_hash VARCHAR(255) COMMENT '交易哈希',
    status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    admin_notes TEXT COMMENT '管理员备注',
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_order_no (order_no),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='充值订单表';

-- 提现申请表
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_no VARCHAR(50) UNIQUE NOT NULL COMMENT '申请号',
    user_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL COMMENT '提现金额(USDT)',
    trc20_wallet VARCHAR(255) NOT NULL COMMENT '提现钱包地址',
    status ENUM('pending', 'approved', 'rejected', 'processing', 'completed', 'failed') DEFAULT 'pending',
    admin_notes TEXT COMMENT '管理员备注',
    processed_at TIMESTAMP NULL COMMENT '处理时间',
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_request_no (request_no),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='提现申请表';

-- 奖励配置表
CREATE TABLE IF NOT EXISTS reward_configs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reward_type ENUM(
        'daily_checkin',     -- 每日签到
        'weekly_checkin',    -- 每周签到
        'monthly_checkin',   -- 每月签到
        'challenge_complete', -- 挑战完成
        'referral_user',     -- 推荐用户
        'step_milestone',    -- 步数里程碑
        'team_activity'      -- 团队活动
    ) NOT NULL,
    name VARCHAR(100) NOT NULL COMMENT '奖励名称',
    description TEXT COMMENT '奖励描述',
    amount DECIMAL(15, 2) NOT NULL COMMENT '奖励金额(USDT)',
    conditions JSON COMMENT '触发条件',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_reward_type (reward_type),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='奖励配置表';

-- 用户奖励记录表
CREATE TABLE IF NOT EXISTS user_rewards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    reward_config_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL COMMENT '实际奖励金额',
    reference_id VARCHAR(100) COMMENT '关联ID',
    reference_type VARCHAR(50) COMMENT '关联类型',
    status ENUM('pending', 'credited', 'failed') DEFAULT 'pending',
    credited_at TIMESTAMP NULL COMMENT '到账时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reward_config_id) REFERENCES reward_configs(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_reward_config_id (reward_config_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户奖励记录表';

-- ========================================
-- 插入初始数据
-- ========================================

-- 插入默认奖励配置
INSERT INTO reward_configs (reward_type, name, description, amount, conditions) VALUES
('daily_checkin', '每日签到奖励', '每日签到可获得基础奖励', 0.1, '{"min_steps": 1000}'),
('weekly_checkin', '每周签到奖励', '连续签到7天可获得额外奖励', 0.5, '{"consecutive_days": 7}'),
('monthly_checkin', '每月签到奖励', '连续签到30天可获得月度奖励', 2.0, '{"consecutive_days": 30}'),
('challenge_complete', '挑战完成奖励', '完成VIP挑战可获得奖励', 0.0, '{"challenge_type": "vip"}'),
('referral_user', '推荐用户奖励', '成功推荐新用户注册', 1.0, '{"referral_count": 1}'),
('step_milestone', '步数里程碑奖励', '达到步数里程碑可获得奖励', 0.2, '{"step_threshold": 10000}'),
('team_activity', '团队活动奖励', '参与团队活动可获得奖励', 0.3, '{"team_size": 5}')
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    amount = VALUES(amount),
    conditions = VALUES(conditions);

-- ========================================
-- 创建触发器：自动创建用户钱包
-- ========================================

DELIMITER $$

CREATE TRIGGER IF NOT EXISTS create_user_wallet_after_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO user_wallets (user_id, balance, frozen_balance, total_deposited, total_withdrawn, total_rewarded)
    VALUES (NEW.id, 0.00, 0.00, 0.00, 0.00, 0.00);
END$$

DELIMITER ;

-- ========================================
-- 创建视图：用户钱包概览
-- ========================================

CREATE OR REPLACE VIEW user_wallet_overview AS
SELECT 
    u.id,
    u.username,
    u.email,
    w.balance,
    w.frozen_balance,
    w.total_deposited,
    w.total_withdrawn,
    w.total_rewarded,
    (w.balance + w.frozen_balance) as total_balance,
    w.created_at as wallet_created_at,
    w.updated_at as wallet_updated_at
FROM users u
LEFT JOIN user_wallets w ON u.id = w.user_id
WHERE u.is_active = TRUE;

-- ========================================
-- 创建存储过程：处理充值
-- ========================================

DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS ProcessDeposit(
    IN p_user_id INT,
    IN p_amount DECIMAL(15, 2),
    IN p_order_no VARCHAR(50),
    IN p_description TEXT
)
BEGIN
    DECLARE v_balance_before DECIMAL(15, 2);
    DECLARE v_balance_after DECIMAL(15, 2);
    DECLARE v_transaction_id INT;
    
    -- 开始事务
    START TRANSACTION;
    
    -- 获取当前余额
    SELECT balance INTO v_balance_before FROM user_wallets WHERE user_id = p_user_id;
    
    -- 更新余额
    UPDATE user_wallets 
    SET balance = balance + p_amount,
        total_deposited = total_deposited + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- 获取更新后余额
    SELECT balance INTO v_balance_after FROM user_wallets WHERE user_id = p_user_id;
    
    -- 记录交易
    INSERT INTO wallet_transactions (
        user_id, transaction_type, amount, balance_before, balance_after, 
        description, reference_id, reference_type
    ) VALUES (
        p_user_id, 'deposit', p_amount, v_balance_before, v_balance_after,
        p_description, p_order_no, 'deposit_order'
    );
    
    -- 更新充值订单状态
    UPDATE deposit_orders 
    SET status = 'completed', completed_at = NOW() 
    WHERE order_no = p_order_no;
    
    -- 提交事务
    COMMIT;
    
    SELECT 'success' as result, v_balance_after as new_balance;
END$$

DELIMITER ;

-- ========================================
-- 创建存储过程：处理奖励
-- ========================================

DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS ProcessReward(
    IN p_user_id INT,
    IN p_reward_type VARCHAR(50),
    IN p_amount DECIMAL(15, 2),
    IN p_description TEXT,
    IN p_reference_id VARCHAR(100),
    IN p_reference_type VARCHAR(50)
)
BEGIN
    DECLARE v_balance_before DECIMAL(15, 2);
    DECLARE v_balance_after DECIMAL(15, 2);
    DECLARE v_reward_config_id INT;
    
    -- 开始事务
    START TRANSACTION;
    
    -- 获取奖励配置ID
    SELECT id INTO v_reward_config_id FROM reward_configs WHERE reward_type = p_reward_type AND is_active = TRUE;
    
    IF v_reward_config_id IS NOT NULL THEN
        -- 获取当前余额
        SELECT balance INTO v_balance_before FROM user_wallets WHERE user_id = p_user_id;
        
        -- 更新余额
        UPDATE user_wallets 
        SET balance = balance + p_amount,
            total_rewarded = total_rewarded + p_amount,
            updated_at = NOW()
        WHERE user_id = p_user_id;
        
        -- 获取更新后余额
        SELECT balance INTO v_balance_after FROM user_wallets WHERE user_id = p_user_id;
        
        -- 记录交易
        INSERT INTO wallet_transactions (
            user_id, transaction_type, amount, balance_before, balance_after, 
            description, reference_id, reference_type
        ) VALUES (
            p_user_id, 'reward', p_amount, v_balance_before, v_balance_after,
            p_description, p_reference_id, p_reference_type
        );
        
        -- 记录奖励
        INSERT INTO user_rewards (
            user_id, reward_config_id, amount, reference_id, reference_type, status, credited_at
        ) VALUES (
            p_user_id, v_reward_config_id, p_amount, p_reference_id, p_reference_type, 'credited', NOW()
        );
        
        -- 提交事务
        COMMIT;
        
        SELECT 'success' as result, v_balance_after as new_balance;
    ELSE
        -- 回滚事务
        ROLLBACK;
        SELECT 'error' as result, 'Reward type not found or inactive' as message;
    END IF;
END$$

DELIMITER ;
