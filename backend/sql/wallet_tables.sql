-- 钱包系统数据表创建脚本
-- 创建时间: 2025-01-14
-- 描述: 创建钱包、充值、提现相关的数据表

-- 1. 用户钱包表
CREATE TABLE IF NOT EXISTS user_wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00 COMMENT '可用余额',
    frozen_balance DECIMAL(15, 2) DEFAULT 0.00 COMMENT '冻结余额',
    total_deposited DECIMAL(15, 2) DEFAULT 0.00 COMMENT '累计充值',
    total_withdrawn DECIMAL(15, 2) DEFAULT 0.00 COMMENT '累计提现',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_wallet (user_id),
    INDEX idx_user_id (user_id),
    INDEX idx_balance (balance),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户钱包表';

-- 2. 充值订单表
CREATE TABLE IF NOT EXISTS deposit_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '订单号',
    user_id INT NOT NULL COMMENT '用户ID',
    amount DECIMAL(15, 2) NOT NULL COMMENT '充值金额',
    payment_method VARCHAR(20) DEFAULT 'trc20' COMMENT '支付方式',
    trx_hash VARCHAR(100) NULL COMMENT 'TRX交易哈希',
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending' COMMENT '订单状态',
    admin_notes TEXT NULL COMMENT '管理员备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    INDEX idx_order_no (order_no),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='充值订单表';

-- 3. 提现申请表
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_no VARCHAR(50) NOT NULL UNIQUE COMMENT '申请单号',
    user_id INT NOT NULL COMMENT '用户ID',
    amount DECIMAL(15, 2) NOT NULL COMMENT '提现金额',
    fee DECIMAL(15, 2) DEFAULT 0.00 COMMENT '手续费',
    actual_amount DECIMAL(15, 2) NOT NULL COMMENT '实际到账金额',
    trc20_wallet VARCHAR(100) NOT NULL COMMENT 'TRC20钱包地址',
    status ENUM('pending', 'approved', 'rejected', 'completed', 'failed') DEFAULT 'pending' COMMENT '申请状态',
    admin_notes TEXT NULL COMMENT '管理员备注',
    reject_reason TEXT NULL COMMENT '拒绝原因',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL COMMENT '处理时间',
    INDEX idx_request_no (request_no),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='提现申请表';

-- 4. 钱包交易记录表
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '用户ID',
    transaction_type ENUM('deposit', 'withdrawal', 'reward', 'challenge_deposit', 'challenge_refund', 'admin_adjust', 'commission') NOT NULL COMMENT '交易类型',
    amount DECIMAL(15, 2) NOT NULL COMMENT '交易金额',
    balance_before DECIMAL(15, 2) NOT NULL COMMENT '交易前余额',
    balance_after DECIMAL(15, 2) NOT NULL COMMENT '交易后余额',
    description VARCHAR(255) NOT NULL COMMENT '交易描述',
    reference_id VARCHAR(50) NULL COMMENT '关联ID',
    reference_type VARCHAR(20) NULL COMMENT '关联类型',
    status ENUM('pending', 'completed', 'failed') DEFAULT 'completed' COMMENT '交易状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_reference_id (reference_id),
    INDEX idx_created_at (created_at),
    INDEX idx_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='钱包交易记录表';

-- 显示创建的表
SHOW TABLES LIKE '%wallet%';
SHOW TABLES LIKE '%deposit%';
SHOW TABLES LIKE '%withdrawal%';

-- 显示表结构
DESCRIBE user_wallets;
DESCRIBE deposit_orders;
DESCRIBE withdrawal_requests;
DESCRIBE wallet_transactions;
