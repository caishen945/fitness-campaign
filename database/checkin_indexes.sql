-- 添加签到表索引
CREATE INDEX idx_user_checkins_user_id ON user_checkins(user_id);
CREATE INDEX idx_user_checkins_date ON user_checkins(checkin_date);
