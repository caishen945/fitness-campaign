-- 为users表添加pk_enabled字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS pk_enabled BOOLEAN NOT NULL DEFAULT TRUE;
