-- Team System Database Migration Script

-- 1. Team relationships table
CREATE TABLE IF NOT EXISTS team_relationships (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT 'User ID',
    parent_id INT NOT NULL COMMENT 'Parent User ID',
    level INT NOT NULL DEFAULT 1 COMMENT 'Level: 1=Level1, 2=Level2, 3=Level3',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_level (level),
    UNIQUE KEY unique_relationship (user_id, parent_id)
) COMMENT='Team relationships table';

-- 2. Invitation records table
CREATE TABLE IF NOT EXISTS invitation_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    inviter_id INT NOT NULL COMMENT 'Inviter ID',
    invitee_id INT NOT NULL COMMENT 'Invitee ID',
    invitation_code VARCHAR(50) NOT NULL COMMENT 'Invitation code',
    level INT NOT NULL DEFAULT 1 COMMENT 'Invitation level',
    status ENUM('pending', 'completed', 'expired') DEFAULT 'pending' COMMENT 'Invitation status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL COMMENT 'Completion time',
    INDEX idx_inviter_id (inviter_id),
    INDEX idx_invitee_id (invitee_id),
    INDEX idx_invitation_code (invitation_code),
    UNIQUE KEY unique_invitation (inviter_id, invitee_id)
) COMMENT='Invitation records table';

-- 3. Commission records table
CREATE TABLE IF NOT EXISTS commission_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT 'User ID who receives commission',
    from_user_id INT NOT NULL COMMENT 'User ID who generates commission',
    vip_challenge_id INT NOT NULL COMMENT 'VIP challenge ID',
    challenge_reward DECIMAL(10,2) NOT NULL COMMENT 'Challenge reward amount',
    commission_rate DECIMAL(5,4) NOT NULL COMMENT 'Commission rate',
    commission_amount DECIMAL(10,2) NOT NULL COMMENT 'Commission amount',
    level INT NOT NULL COMMENT 'Commission level',
    status ENUM('pending', 'paid', 'failed') DEFAULT 'pending' COMMENT 'Commission status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL COMMENT 'Payment time',
    INDEX idx_user_id (user_id),
    INDEX idx_from_user_id (from_user_id),
    INDEX idx_vip_challenge_id (vip_challenge_id),
    INDEX idx_status (status)
) COMMENT='Commission records table';

-- 4. Invitation rewards table
CREATE TABLE IF NOT EXISTS invitation_rewards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT 'User ID who receives reward',
    invited_user_id INT NOT NULL COMMENT 'Invited user ID',
    reward_amount DECIMAL(10,2) NOT NULL COMMENT 'Reward amount',
    recharge_amount DECIMAL(10,2) NOT NULL COMMENT 'Recharge amount',
    status ENUM('pending', 'paid', 'failed') DEFAULT 'pending' COMMENT 'Reward status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL COMMENT 'Payment time',
    INDEX idx_user_id (user_id),
    INDEX idx_invited_user_id (invited_user_id),
    INDEX idx_status (status)
) COMMENT='Invitation rewards table';

-- 5. Team system config table
CREATE TABLE IF NOT EXISTS team_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(50) NOT NULL COMMENT 'Config key',
    config_value TEXT NOT NULL COMMENT 'Config value',
    description VARCHAR(255) COMMENT 'Config description',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_config_key (config_key)
) COMMENT='Team system config table';

-- Insert default config
INSERT INTO team_config (config_key, config_value, description) VALUES
('level1_commission_rate', '0.05', 'Level 1 member VIP challenge commission rate (5%)'),
('level2_commission_rate', '0.03', 'Level 2 member VIP challenge commission rate (3%)'),
('level3_commission_rate', '0.01', 'Level 3 member VIP challenge commission rate (1%)'),
('invitation_reward_amount', '1.00', 'Invitation effective member reward amount (USDT)'),
('invitation_recharge_threshold', '30.00', 'Invitation effective member recharge threshold (USDT)'),
('max_team_level', '3', 'Maximum team level');

-- 6. User invitation codes table
CREATE TABLE IF NOT EXISTS user_invitation_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT 'User ID',
    invitation_code VARCHAR(50) NOT NULL COMMENT 'Invitation code',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Is active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_invitation_code (invitation_code),
    UNIQUE KEY unique_user_code (user_id),
    UNIQUE KEY unique_code (invitation_code)
) COMMENT='User invitation codes table';

-- Generate invitation codes for existing users
INSERT INTO user_invitation_codes (user_id, invitation_code)
SELECT 
    id, 
    CONCAT('INV', LPAD(id, 6, '0'), UPPER(SUBSTRING(MD5(CONCAT(id, NOW())), 1, 8)))
FROM users 
WHERE id NOT IN (SELECT user_id FROM user_invitation_codes);

-- 7. Team statistics table (for caching team statistics)
CREATE TABLE IF NOT EXISTS team_statistics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT 'User ID',
    level1_count INT DEFAULT 0 COMMENT 'Level 1 member count',
    level2_count INT DEFAULT 0 COMMENT 'Level 2 member count',
    level3_count INT DEFAULT 0 COMMENT 'Level 3 member count',
    total_commission DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Total commission amount',
    total_invitation_rewards DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Total invitation rewards',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    UNIQUE KEY unique_user_stats (user_id)
) COMMENT='Team statistics table';

-- Initialize team statistics for existing users
INSERT INTO team_statistics (user_id, level1_count, level2_count, level3_count, total_commission, total_invitation_rewards)
SELECT 
    id, 
    0, 0, 0, 0.00, 0.00
FROM users 
WHERE id NOT IN (SELECT user_id FROM team_statistics);
