-- 移除用户名系统数据库迁移脚本
-- 创建时间：2025-01-14
-- 描述：移除users表中的username字段，保留ID、邮箱、Telegram信息

-- 1. 备份现有数据（已在执行前完成）
-- CREATE TABLE users_backup_20250114 AS SELECT * FROM users;

-- 2. 检查当前表结构
SELECT 'Current users table structure:' as info;
DESCRIBE users;

-- 3. 显示当前用户统计
SELECT 'Current user statistics:' as info;
SELECT 
    COUNT(*) as total_users,
    COUNT(username) as users_with_username,
    COUNT(email) as users_with_email,
    COUNT(telegram_id) as users_with_telegram,
    COUNT(trc20_wallet) as users_with_wallet,
    COUNT(CASE WHEN email IS NULL AND telegram_id IS NULL THEN 1 END) as users_without_login_method
FROM users;

-- 4. 检查是否有依赖username的外键约束
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE REFERENCED_TABLE_NAME = 'users' 
AND REFERENCED_COLUMN_NAME = 'username'
AND TABLE_SCHEMA = 'fitchallenge';

-- 5. 删除username字段的唯一索引
SELECT 'Dropping username unique index...' as info;
ALTER TABLE users DROP INDEX username;

-- 6. 删除username字段
SELECT 'Dropping username column...' as info;
ALTER TABLE users DROP COLUMN username;

-- 7. 验证修改后的表结构
SELECT 'New users table structure:' as info;
DESCRIBE users;

-- 8. 显示修改后的用户统计
SELECT 'Updated user statistics:' as info;
SELECT 
    COUNT(*) as total_users,
    COUNT(email) as users_with_email,
    COUNT(telegram_id) as users_with_telegram,
    COUNT(trc20_wallet) as users_with_wallet,
    COUNT(first_name) as users_with_first_name,
    COUNT(last_name) as users_with_last_name,
    COUNT(CASE WHEN email IS NULL AND telegram_id IS NULL THEN 1 END) as users_without_login_method
FROM users;

-- 9. 验证数据完整性
SELECT 'Data integrity check:' as info;
SELECT 
    'Users with both email and telegram' as category,
    COUNT(*) as count
FROM users 
WHERE email IS NOT NULL AND telegram_id IS NOT NULL

UNION ALL

SELECT 
    'Users with only email' as category,
    COUNT(*) as count
FROM users 
WHERE email IS NOT NULL AND telegram_id IS NULL

UNION ALL

SELECT 
    'Users with only telegram' as category,
    COUNT(*) as count
FROM users 
WHERE email IS NULL AND telegram_id IS NOT NULL

UNION ALL

SELECT 
    'Users with neither (ERROR)' as category,
    COUNT(*) as count
FROM users 
WHERE email IS NULL AND telegram_id IS NULL;

SELECT 'Migration completed successfully!' as result;
