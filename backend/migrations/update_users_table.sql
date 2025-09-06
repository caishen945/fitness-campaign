-- 数据库迁移脚本：更新users表结构
-- 使email和password_hash字段可选，支持纯Telegram用户
-- 执行时间：2025-08-29

-- 1. 备份现有数据（可选，建议在生产环境执行前备份）
-- CREATE TABLE users_backup AS SELECT * FROM users;

-- 2. 修改email字段为可选
ALTER TABLE users MODIFY COLUMN email VARCHAR(100) UNIQUE NULL;

-- 3. 修改password_hash字段为可选
ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL;

-- 4. 添加约束：确保至少有一种登录方式
-- 注意：MySQL不支持CHECK约束，我们通过应用层逻辑来保证
-- 或者可以创建触发器来验证

-- 5. 为现有Telegram用户清理临时邮箱（如果存在）
UPDATE users 
SET email = NULL 
WHERE telegram_id IS NOT NULL 
AND email LIKE 'telegram_%@fitchallenge.com';

-- 6. 验证表结构
DESCRIBE users;

-- 7. 显示当前用户统计
SELECT 
    COUNT(*) as total_users,
    COUNT(email) as users_with_email,
    COUNT(password_hash) as users_with_password,
    COUNT(telegram_id) as users_with_telegram,
    COUNT(CASE WHEN email IS NULL AND telegram_id IS NULL THEN 1 END) as users_without_login_method
FROM users;
