/**
 * API路径映射工具
 * 用于将前端API路径映射到正确的后端API路径
 */

const apiPathMap = {
    // 用户管理
    '/admin/users': '/api/admin/users',
    
    // VIP等级管理
    '/admin/vip-levels': '/api/admin/vip-levels',
    
    // VIP挑战管理
    '/admin/vip-challenges': '/api/admin/vip-challenges',
    
    // 钱包管理
    '/admin/wallet/overview': '/api/admin/wallet/overview',
    '/admin/wallet/withdrawals': '/api/admin/wallet/withdrawals',
    '/admin/wallet/deposits': '/api/admin/wallet/deposits',
    '/admin/wallet/transactions': '/api/admin/wallet/transactions',
    '/admin/wallet/deposit': '/api/admin/wallet/deposit',
    '/admin/wallet/adjust': '/api/admin/wallet/adjust',
    '/admin/wallets/deposit': '/api/admin/wallet/deposit',
    '/admin/wallets/reward': '/api/admin/wallet/reward',
    '/admin/wallets/adjust': '/api/admin/wallet/adjust',
    '/admin/wallets/transactions': '/api/admin/wallet/transactions',
    
    // 用户余额管理
    '/admin/users/balance/add': '/api/admin/wallet/adjust',
    '/admin/users/balance/subtract': '/api/admin/wallet/adjust',
    '/admin/users/balance/freeze': '/api/admin/wallet/adjust',
    '/admin/users/balance/unfreeze': '/api/admin/wallet/adjust',
    
    // 用户交易记录 - 需要特殊处理，因为路径包含动态参�?
    
    // 签到管理
    '/admin/checkin/overview': '/api/admin/checkin/overview',
    '/admin/checkin/stats': '/api/admin/checkin/stats',
    '/admin/checkin/user': '/api/admin/checkin/user',
    '/admin/checkin/manual': '/api/admin/checkin/manual',
    '/admin/checkin/config': '/api/admin/checkin/config',
    
    // PK挑战管理
    '/admin/pk/challenges': '/api/admin/pk/challenges',
    '/admin/pk-challenges': '/api/admin/pk/challenges',
    
    // 成就管理
    '/achievements/admin/types': '/api/achievements/admin/types',
    '/achievements/admin/achievements': '/api/achievements/admin/achievements',
    '/achievements/admin/stats': '/api/achievements/admin/stats',
    
    // 团队管理
    '/team/admin/statistics': '/api/team/admin/statistics',
    '/team/admin/config': '/api/team/admin/config',
    '/team/admin/commissions': '/api/team/admin/commissions',
    '/team/admin/invitation-rewards': '/api/team/admin/invitation-rewards'
};

/**
 * 将前端API路径映射到后端API路径
 * @param {string} frontendPath - 前端API路径
 * @returns {string} - 映射后的后端API路径
 */
export function mapApiPath(frontendPath) {
    // 特殊处理用户交易记录路径
    const userTransactionMatch = frontendPath.match(/^\/admin\/users\/(\d+)\/transactions/);
    if (userTransactionMatch) {
        return frontendPath.replace('/admin/users', '/api/admin/wallet/users');
    }
    
    // 首先尝试精确匹配
    if (apiPathMap[frontendPath]) {
        return apiPathMap[frontendPath];
    }
    
    // 如果没有精确匹配，尝试前缀匹配
    for (const [key, value] of Object.entries(apiPathMap)) {
        if (frontendPath.startsWith(key + '/')) {
            return frontendPath.replace(key, value);
        }
    }
    
    // 如果没有匹配，返回原路径并添�?api前缀
    if (!frontendPath.startsWith('/api/')) {
        return '/api' + frontendPath;
    }
    
    // 默认返回原路�?
    return frontendPath;
}

export default mapApiPath;
