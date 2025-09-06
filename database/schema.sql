-- 用户表
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NULL,                    -- 改为可选，支持纯Telegram用户
    password_hash VARCHAR(255) NULL,                   -- 改为可选，支持纯Telegram用户
    trc20_wallet VARCHAR(255),
    telegram_id BIGINT UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    -- 注意：应用层需要确保至少有一种登录方式（email或telegram_id）
    INDEX idx_login_methods (email, telegram_id)
);

-- 用户资料表
CREATE TABLE user_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    full_name VARCHAR(100),
    avatar_url VARCHAR(255),
    date_of_birth DATE,
    height INT,
    weight INT,
    gender ENUM('male', 'female', 'other'),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 步数记录表
CREATE TABLE step_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    record_date DATE NOT NULL,
    steps INT NOT NULL DEFAULT 0,
    source ENUM('manual', 'device', 'app') DEFAULT 'manual',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_date (user_id, record_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 团队表
CREATE TABLE teams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 团队成员表
CREATE TABLE team_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    team_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_admin BOOLEAN DEFAULT FALSE,
    UNIQUE KEY unique_team_user (team_id, user_id),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 成就表
CREATE TABLE achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(255),
    threshold_type ENUM('steps', 'days', 'teams', 'challenges') NOT NULL,
    threshold_value INT NOT NULL
);

-- 用户成就表
CREATE TABLE user_achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
);

-- 用户钱包余额表
CREATE TABLE user_wallets (
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
);

-- 钱包交易表
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
);

-- 充值订单表
CREATE TABLE deposit_orders (
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
);

-- 提现申请表
CREATE TABLE withdrawal_requests (
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
);

-- 新闻表
CREATE TABLE news (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author_id INT NOT NULL,
    published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- 通知表
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- VIP等级表
CREATE TABLE vip_levels (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    deposit_amount DECIMAL(10, 2) NOT NULL,
    step_target INT NOT NULL,
    reward_amount DECIMAL(10, 2) NOT NULL,
    max_challenges INT DEFAULT -1,
    duration INT DEFAULT 1,
    icon VARCHAR(10) DEFAULT '🏆',
    color VARCHAR(7) DEFAULT '#FFD700',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 用户VIP状态表
CREATE TABLE user_vip_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    vip_level_id INT NOT NULL,
    deposit_amount DECIMAL(10, 2) NOT NULL,
    deposit_date TIMESTAMP NOT NULL,
    expire_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    total_challenges INT DEFAULT 0,
    completed_challenges INT DEFAULT 0,
    total_rewards DECIMAL(10, 2) DEFAULT 0,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vip_level_id) REFERENCES vip_levels(id) ON DELETE CASCADE
);

-- VIP挑战记录表
CREATE TABLE vip_challenges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    vip_level_id INT NOT NULL,
    challenge_type ENUM('daily', 'weekly', 'monthly') DEFAULT 'daily',
    step_target INT NOT NULL,
    current_steps INT DEFAULT 0,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status ENUM('active', 'completed', 'failed', 'cancelled') DEFAULT 'active',
    deposit_amount DECIMAL(10, 2) NOT NULL,
    reward_amount DECIMAL(10, 2) NOT NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vip_level_id) REFERENCES vip_levels(id) ON DELETE CASCADE
);