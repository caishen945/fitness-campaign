-- 为users表添加Telegram相关字段
-- 如果字段不存在则添加

-- 添加telegram_id字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_id BIGINT UNIQUE;

-- 添加first_name字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);

-- 添加last_name字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
