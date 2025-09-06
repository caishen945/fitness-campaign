// 状态到语义颜色的集中映射与工具

// 仅存储语义颜色，不含 "badge bg-" 前缀
export const BADGE_STYLES = Object.freeze({
    // 系统服务运行状态
    serviceStatus: {
        running: 'success',
        up: 'success',
        stopped: 'secondary',
        down: 'secondary',
        error: 'danger',
        failed: 'danger',
        warning: 'warning'
    },

    // 版本状态
    versionStatus: {
        current: 'success',
        outdated: 'warning',
        unknown: 'secondary'
    },

    // 进度/步骤展示
    progress: {
        step: 'primary',
        in_progress: 'primary',
        done: 'success',
        pending: 'secondary'
    },

    // 佣金记录状态（前台团队页）
    commissionStatus: {
        paid: 'success',
        pending: 'warning',
        failed: 'danger',
        rejected: 'danger'
    },

    // 邀请奖励状态（前台团队页）
    rewardStatus: {
        paid: 'success',
        pending: 'warning',
        failed: 'danger',
        rejected: 'danger'
    }
});

function normalize(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number') return String(value);
    return String(value).trim().toLowerCase();
}

export function getBadgeClassForStatus(statusCategory, statusCode, fallback = 'secondary') {
    const categoryKey = normalize(statusCategory);
    const codeKey = normalize(statusCode);

    const category = BADGE_STYLES[categoryKey];
    const style = category ? category[codeKey] : undefined;
    const finalStyle = style || fallback;

    return `badge bg-${finalStyle}`;
}

export default {
    BADGE_STYLES,
    getBadgeClassForStatus
};


