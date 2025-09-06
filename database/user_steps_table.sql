-- 用户步数记录表
CREATE TABLE IF NOT EXISTS user_steps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '用户ID',
    steps INT NOT NULL DEFAULT 0 COMMENT '步数',
    date DATE NOT NULL COMMENT '日期',
    source ENUM('manual', 'google-fit', 'healthkit', 'other') NOT NULL DEFAULT 'manual' COMMENT '步数来源',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_date (user_id, date),
    INDEX idx_user_id (user_id),
    INDEX idx_date (date),
    INDEX idx_source (source),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户步数记录表';

-- 创建用户步数统计视图
CREATE OR REPLACE VIEW user_steps_stats AS
SELECT 
    us.user_id,
    u.username,
    COUNT(us.id) as total_days,
    SUM(us.steps) as total_steps,
    AVG(us.steps) as avg_steps,
    MAX(us.steps) as max_steps,
    MIN(us.steps) as min_steps,
    COUNT(CASE WHEN us.steps >= 10000 THEN 1 END) as days_over_10k,
    COUNT(CASE WHEN us.steps >= 8000 THEN 1 END) as days_over_8k,
    COUNT(CASE WHEN us.steps >= 5000 THEN 1 END) as days_over_5k,
    us.source,
    MAX(us.date) as last_recorded_date
FROM user_steps us
LEFT JOIN users u ON us.user_id = u.id
GROUP BY us.user_id, u.username, us.source;

-- 创建用户步数趋势视图
CREATE OR REPLACE VIEW user_steps_trend AS
SELECT 
    us.user_id,
    us.date,
    us.steps,
    LAG(us.steps, 1) OVER (PARTITION BY us.user_id ORDER BY us.date) as prev_day_steps,
    LAG(us.steps, 7) OVER (PARTITION BY us.user_id ORDER BY us.date) as week_ago_steps,
    LAG(us.steps, 30) OVER (PARTITION BY us.user_id ORDER BY us.date) as month_ago_steps,
    CASE 
        WHEN LAG(us.steps, 1) OVER (PARTITION BY us.user_id ORDER BY us.date) IS NOT NULL 
        THEN us.steps - LAG(us.steps, 1) OVER (PARTITION BY us.user_id ORDER BY us.date)
        ELSE 0 
    END as daily_change,
    CASE 
        WHEN LAG(us.steps, 7) OVER (PARTITION BY us.user_id ORDER BY us.date) IS NOT NULL 
        THEN us.steps - LAG(us.steps, 7) OVER (PARTITION BY us.user_id ORDER BY us.date)
        ELSE 0 
    END as weekly_change,
    CASE 
        WHEN LAG(us.steps, 30) OVER (PARTITION BY us.user_id ORDER BY us.date) IS NOT NULL 
        THEN us.steps - LAG(us.steps, 30) OVER (PARTITION BY us.user_id ORDER BY us.date)
        ELSE 0 
    END as monthly_change
FROM user_steps us
ORDER BY us.user_id, us.date;
