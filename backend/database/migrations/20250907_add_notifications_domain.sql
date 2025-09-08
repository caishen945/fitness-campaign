-- Notifications domain incremental migration
-- Date: 2025-09-07

-- 1) Extend existing notifications table (non-breaking)
ALTER TABLE `notifications`
  ADD COLUMN `type` VARCHAR(64) NOT NULL DEFAULT 'system',
  ADD COLUMN `metadata` JSON NULL,
  ADD COLUMN `read_at` DATETIME NULL,
  ADD INDEX `idx_user_created` (`user_id`, `created_at`),
  ADD INDEX `idx_user_unread` (`user_id`, `read_at`);

-- 2) Detailed deliveries per channel and attempts
CREATE TABLE IF NOT EXISTS `notification_deliveries` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `notification_id` INT NOT NULL,
  `channel` ENUM('web','email','telegram','push','sms') NOT NULL DEFAULT 'web',
  `status` ENUM('pending','queued','sending','sent','failed','cancelled','skipped','deferred') NOT NULL DEFAULT 'pending',
  `attempt_count` INT NOT NULL DEFAULT 0,
  `last_error` TEXT NULL,
  `next_attempt_at` DATETIME NULL,
  `sent_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_deliveries_notification`
    FOREIGN KEY (`notification_id`) REFERENCES `notifications`(`id`) ON DELETE CASCADE,
  INDEX `idx_notification_channel` (`notification_id`, `channel`),
  INDEX `idx_status_next_attempt` (`status`, `next_attempt_at`),
  INDEX `idx_created_at` (`created_at`)
);

-- 3) Batches for bulk notifications
CREATE TABLE IF NOT EXISTS `notification_batches` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `creator_admin_id` INT NOT NULL,
  `status` ENUM('draft','scheduled','processing','completed','failed','cancelled') NOT NULL DEFAULT 'draft',
  `filters` JSON NULL,
  `total_recipients` INT NOT NULL DEFAULT 0,
  `sent_count` INT NOT NULL DEFAULT 0,
  `failed_count` INT NOT NULL DEFAULT 0,
  `scheduled_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_batches_creator`
    FOREIGN KEY (`creator_admin_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  INDEX `idx_status_created` (`status`, `created_at`),
  INDEX `idx_scheduled_at` (`scheduled_at`)
);

-- 4) Templates with versions and locales
CREATE TABLE IF NOT EXISTS `notification_templates` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `template_key` VARCHAR(100) NOT NULL,
  `locale` VARCHAR(10) NOT NULL DEFAULT 'en',
  `channel` ENUM('web','email','telegram','push','sms') NOT NULL DEFAULT 'web',
  `version` INT NOT NULL DEFAULT 1,
  `name` VARCHAR(100) NULL,
  `subject` VARCHAR(200) NULL,
  `body` TEXT NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_template_version` (`template_key`, `locale`, `channel`, `version`),
  INDEX `idx_template_active` (`template_key`, `is_active`)
);

-- 5) Per-user notification preferences
CREATE TABLE IF NOT EXISTS `user_notification_settings` (
  `user_id` INT PRIMARY KEY,
  `channel_preferences` JSON NULL,
  `mute_all` BOOLEAN NOT NULL DEFAULT FALSE,
  `timezone` VARCHAR(64) NULL,
  `quiet_hours_start` TIME NULL,
  `quiet_hours_end` TIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_user_settings_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_mute_all` (`mute_all`)
);

-- 6) Admin audit logs for notification-related operations
CREATE TABLE IF NOT EXISTS `admin_audit_logs` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `admin_user_id` INT NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(50) NULL,
  `entity_id` VARCHAR(100) NULL,
  `description` TEXT NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_audit_admin`
    FOREIGN KEY (`admin_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  INDEX `idx_action_created` (`action`, `created_at`),
  INDEX `idx_entity` (`entity_type`, `entity_id`),
  INDEX `idx_admin_created` (`admin_user_id`, `created_at`)
);


