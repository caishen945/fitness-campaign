# Notification System

## Redis & Queue
- Notification queue: `notificationQueue` (env `NOTIFICATION_QUEUE_NAME`)
- Redis URL: `REDIS_URL` (default `redis://127.0.0.1:6379`)

## Worker
- Starts with backend server automatically
- Handles job `send-notification` with channels: web, email, telegram
- Respects user preferences: `user_notification_settings` (mute_all, quiet hours)

## Email
- SMTP envs: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

## Admin APIs
- POST `/api/admin/notifications` { userId|email, title, message } → 202 queued
- Templates: `/api/admin/notification-templates`
- Batches: `/api/admin/notification-batches`
- Monitor: `/api/admin/notification-monitor/deliveries|stats`

## User APIs
- Preferences: `/api/user/notification-preferences` GET/PUT
- Notifications: `/api/notifications` list, `/api/notifications/unread-count`, mark read/delete
