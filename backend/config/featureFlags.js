const truthyValues = new Set(['1', 'true', 'yes', 'on']);

function normalizeBoolean(value) {
	if (value === undefined || value === null) return false;
	const normalized = String(value).trim().toLowerCase();
	return truthyValues.has(normalized);
}

function isRedisEnabled() {
	return normalizeBoolean(process.env.REDIS_ENABLED);
}

// 挑战超时服务开关
function isChallengeTimeoutEnabled() {
	return normalizeBoolean(process.env.CHALLENGE_TIMEOUT_ENABLED);
}

// 挑战超时服务检查间隔（毫秒）
function getChallengeTimeoutIntervalMs() {
	const raw = process.env.CHALLENGE_TIMEOUT_INTERVAL_MS;
	const parsed = Number(raw);
	if (Number.isFinite(parsed) && parsed > 0) return parsed;
	// 默认5分钟
	return 5 * 60 * 1000;
}

module.exports = {
	isRedisEnabled,
	normalizeBoolean,
	isChallengeTimeoutEnabled,
	getChallengeTimeoutIntervalMs
};


