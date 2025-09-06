// PK挑战状态映射
export const pkStatusToBadge = {
    pending: 'warning',
    accepted: 'primary',
    completed: 'success',
    rejected: 'danger',
    cancelled: 'secondary'
};

export const pkStatusToText = {
    pending: '待接收',
    accepted: '进行中',
    completed: '已完成',
    rejected: '已拒绝',
    cancelled: '已取消'
};

// 通用状态工具
export function getBadgeClass(status, map = pkStatusToBadge, fallback = 'secondary') {
    return map[status] || fallback;
}

export function getStatusText(status, map = pkStatusToText) {
    return map[status] || status;
}

// VIP等级启用状态文本
export function vipActiveText(isActive) {
    return isActive ? '启用' : '禁用';
}

export default {
    pkStatusToBadge,
    pkStatusToText,
    getBadgeClass,
    getStatusText,
    vipActiveText
};


