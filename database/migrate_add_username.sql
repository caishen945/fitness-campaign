-- ========================================
-- FitChallenge 用户名列迁移脚本
-- 目标: 为 users 表添加并回填 username 字段，收紧为 NOT NULL 且 UNIQUE
-- ========================================

START TRANSACTION;

-- 1) 添加列（幂等）
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS username VARCHAR(50) NULL COMMENT '全局唯一用户名';

-- 2) 回填策略（仅填充空/NULL）：lowercase(base + '_' + id)，base优先取 email @ 前缀，否则 'user'
UPDATE users u
SET u.username = LOWER(
    LEFT(
        CONCAT(
            COALESCE(NULLIF(SUBSTRING_INDEX(u.email, '@', 1), ''), 'user'),
            '_', u.id
        ), 50
    )
)
WHERE (u.username IS NULL OR u.username = '');

-- 3) 约束收紧：NOT NULL + UNIQUE（幂等：仅在满足条件时执行）
-- 3.1 确保无空值
-- 诊断查询：如有非零结果，需要人工检查回填逻辑
SELECT COUNT(*) AS remaining_null_or_empty_usernames
FROM users WHERE username IS NULL OR username = '';

-- 3.2 设置为 NOT NULL
ALTER TABLE users
    MODIFY COLUMN username VARCHAR(50) NOT NULL COMMENT '全局唯一用户名';

-- 3.3 创建唯一索引（若不存在）
SET @idx_exists := (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND INDEX_NAME = 'uk_users_username'
);

SET @sql := IF(@idx_exists = 0,
    'CREATE UNIQUE INDEX uk_users_username ON users(username)',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4) 验证断言
-- 4.1 列存在
SELECT COUNT(*) AS username_column_exists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'username';

-- 4.2 空值计数应为 0
SELECT COUNT(*) AS username_null_count
FROM users WHERE username IS NULL OR username = '';

-- 4.3 重复计数应为 0
SELECT MAX(cnt) AS max_username_dup_count
FROM (
    SELECT username, COUNT(*) AS cnt FROM users GROUP BY username
) t;

COMMIT;

-- 完成提示
SELECT 'ADD/BACKFILL users.username completed' AS status, NOW() AS completed_at;


