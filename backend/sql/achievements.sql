-- 成就系统数据库表

-- 成就类型表
CREATE TABLE IF NOT EXISTS achievement_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '成就类型名称',
    code VARCHAR(50) UNIQUE NOT NULL COMMENT '成就类型代码',
    description TEXT COMMENT '成就类型描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 成就表
CREATE TABLE IF NOT EXISTS achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type_id INT NOT NULL COMMENT '成就类型ID',
    name VARCHAR(100) NOT NULL COMMENT '成就名称',
    description TEXT COMMENT '成就描述',
    target_value INT NOT NULL COMMENT '目标值',
    reward_amount DECIMAL(10,2) DEFAULT 0 COMMENT '奖励金额(USDT)',
    reward_type ENUM('usdt', 'points', 'badge') DEFAULT 'usdt' COMMENT '奖励类型',
    icon VARCHAR(100) DEFAULT 'trophy' COMMENT '成就图标',
    color VARCHAR(20) DEFAULT '#FFD700' COMMENT '成就颜色',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (type_id) REFERENCES achievement_types(id) ON DELETE CASCADE
);

-- 用户成就进度表
CREATE TABLE IF NOT EXISTS user_achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '用户ID',
    achievement_id INT NOT NULL COMMENT '成就ID',
    current_value INT DEFAULT 0 COMMENT '当前进度值',
    is_completed BOOLEAN DEFAULT FALSE COMMENT '是否完成',
    is_claimed BOOLEAN DEFAULT FALSE COMMENT '是否已领取奖励',
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    claimed_at TIMESTAMP NULL COMMENT '领取时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id)
);

-- 插入成就类型数据
INSERT INTO achievement_types (name, code, description) VALUES
('团队人数成就', 'team_size', '团队成员数量达到指定目标'),
('团队参与挑战人数成就', 'team_challenge_participants', '团队中参与挑战的人数达到指定目标'),
('VIP挑战完成次数成就', 'vip_challenge_completions', '完成VIP挑战的次数达到指定目标'),
('累计步数成就', 'total_steps', '累计步数达到指定目标'),
('连续签到成就', 'consecutive_checkins', '连续签到天数达到指定目标'),
('PK挑战胜利次数成就', 'pk_challenge_wins', 'PK挑战胜利次数达到指定目标'),
('注册时长成就', 'registration_duration', '注册账号时长达到指定目标'),
('挑战参与度成就', 'challenge_participation', '参与挑战次数达到指定目标'),
('钱包余额成就', 'wallet_balance', '累计获得USDT数量达到指定目标'),
('运动习惯成就', 'exercise_habits', '连续运动天数达到指定目标');

-- 插入默认成就数据
INSERT INTO achievements (type_id, name, description, target_value, reward_amount, icon, color, sort_order) VALUES
-- 团队人数成就
(1, '团队新秀', '团队成员达到10人', 10, 5.00, 'users', '#4CAF50', 1),
(1, '团队精英', '团队成员达到50人', 50, 20.00, 'users', '#2196F3', 2),
(1, '团队领袖', '团队成员达到100人', 100, 50.00, 'users', '#9C27B0', 3),

-- 团队参与挑战人数成就
(2, '挑战先锋', '团队中10人参与挑战', 10, 3.00, 'running', '#FF9800', 4),
(2, '挑战军团', '团队中50人参与挑战', 50, 15.00, 'running', '#E91E63', 5),
(2, '挑战帝国', '团队中100人参与挑战', 100, 40.00, 'running', '#607D8B', 6),

-- VIP挑战完成次数成就
(3, '挑战新手', '完成1次VIP挑战', 1, 1.00, 'star', '#4CAF50', 7),
(3, '挑战达人', '完成10次VIP挑战', 10, 5.00, 'star', '#2196F3', 8),
(3, '挑战专家', '完成50次VIP挑战', 50, 20.00, 'star', '#FF9800', 9),
(3, '挑战大师', '完成100次VIP挑战', 100, 50.00, 'star', '#9C27B0', 10),

-- 累计步数成就
(4, '健身新手', '累计步数达到1000步', 1000, 2.00, 'walking', '#4CAF50', 11),
(4, '健身达人', '累计步数达到5000步', 5000, 8.00, 'walking', '#2196F3', 12),
(4, '健身专家', '累计步数达到10000步', 10000, 20.00, 'walking', '#FF9800', 13),

-- 连续签到成就
(5, '签到新手', '连续签到10天', 10, 3.00, 'calendar-check', '#4CAF50', 14),
(5, '签到达人', '连续签到20天', 20, 8.00, 'calendar-check', '#2196F3', 15),
(5, '签到专家', '连续签到30天', 30, 20.00, 'calendar-check', '#FF9800', 16),

-- PK挑战胜利次数成就
(6, 'PK新手', 'PK挑战胜利10次', 10, 5.00, 'fist-raised', '#4CAF50', 17),
(6, '常胜将军', 'PK挑战胜利20次', 20, 15.00, 'fist-raised', '#2196F3', 18),
(6, 'PK王者', 'PK挑战胜利30次', 30, 30.00, 'fist-raised', '#FF9800', 19),

-- 注册时长成就
(7, '新用户', '注册账号7天', 7, 1.00, 'clock', '#4CAF50', 20),
(7, '忠实用户', '注册账号30天', 30, 5.00, 'clock', '#2196F3', 21),
(7, '资深用户', '注册账号100天', 100, 15.00, 'clock', '#FF9800', 22),
(7, '元老用户', '注册账号365天', 365, 50.00, 'clock', '#9C27B0', 23),

-- 挑战参与度成就
(8, '参与新手', '参与挑战5次', 5, 2.00, 'play', '#4CAF50', 24),
(8, '参与达人', '参与挑战20次', 20, 8.00, 'play', '#2196F3', 25),
(8, '参与专家', '参与挑战50次', 50, 20.00, 'play', '#FF9800', 26),

-- 钱包余额成就
(9, '财富新手', '累计获得100USDT', 100, 5.00, 'wallet', '#4CAF50', 27),
(9, '财富达人', '累计获得500USDT', 500, 20.00, 'wallet', '#2196F3', 28),
(9, '财富专家', '累计获得1000USDT', 1000, 50.00, 'wallet', '#FF9800', 29),

-- 运动习惯成就
(10, '习惯新手', '连续运动7天', 7, 3.00, 'heart', '#4CAF50', 30),
(10, '习惯达人', '连续运动30天', 30, 10.00, 'heart', '#2196F3', 31),
(10, '习惯专家', '连续运动100天', 100, 30.00, 'heart', '#FF9800', 32);

-- 创建索引
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_completed ON user_achievements(is_completed);
CREATE INDEX idx_achievements_type_id ON achievements(type_id);
CREATE INDEX idx_achievements_active ON achievements(is_active);
