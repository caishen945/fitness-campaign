// 导入API路径映射工具
import mapApiPath from '../utils/apiPathMapper.js';

class AdminApi {
    constructor() {
        // 使用浏览器兼容的配置方式
        const config = window.API_CONFIG || { baseUrl: 'http://localhost:3000' };
        this.baseUrl = config.baseUrl;
    }

    // 获取认证token（如果需要）
    getToken() {
        return localStorage.getItem('adminToken');
    }

    // 通用请求方法
    async request(endpoint, options = {}) {
        // 使用路径映射工具映射API路径
        const mappedEndpoint = mapApiPath(endpoint);
        console.log(`API路径映射: ${endpoint} => ${mappedEndpoint}`);
        
        const url = `${this.baseUrl}${mappedEndpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            mode: 'cors',
            credentials: 'include',
            ...options
        };

        // 如果有token，添加到请求头
        const token = this.getToken();
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                // 处理401认证失败
                if (response.status === 401) {
                    console.warn('认证失败，清除token并重定向到登录页面');
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminUser');
                    
                    // 如果当前不在登录页面，则重定向
                    if (window.location.pathname !== '/login' && !window.location.href.includes('login')) {
                        window.location.href = '/login';
                    }
                    
                    throw new Error('认证失败，请重新登录');
                }
                
                const errorMessage = data.error || data.message || data.errors || '请求失败';
                console.error('API错误:', errorMessage);
                throw new Error(errorMessage);
            }
            
            return data;
        } catch (error) {
            console.error('API请求错误:', error.message);
            throw error;
        }
    }

    // 用户管理相关API
    async getUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `/admin/users?${queryString}` : '/admin/users';
        return this.request(url);
    }

    async getUser(id) {
        return this.request(`/admin/users/${id}`);
    }

    async createUser(userData) {
        return this.request('/admin/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async updateUser(id, userData) {
        return this.request(`/admin/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async deleteUser(id) {
        return this.request(`/admin/users/${id}`, {
            method: 'DELETE'
        });
    }

    // VIP等级管理相关API
    async getVipLevels() {
        return this.request('/admin/vip-levels');
    }

    async createVipLevel(vipLevelData) {
        console.log('adminApi.createVipLevel 被调用，数据:', vipLevelData);
        try {
            const result = await this.request('/admin/vip-levels', {
                method: 'POST',
                body: JSON.stringify(vipLevelData)
            });
            console.log('createVipLevel 成功，结果:', result);
            return result;
        } catch (error) {
            console.error('createVipLevel 失败:', error);
            throw error;
        }
    }

    async updateVipLevel(id, vipLevelData) {
        return this.request(`/admin/vip-levels/${id}`, {
            method: 'PUT',
            body: JSON.stringify(vipLevelData)
        });
    }

    async toggleVipLevelStatus(id) {
        return this.request(`/admin/vip-levels/${id}/toggle`, {
            method: 'PUT'
        });
    }

    async deleteVipLevel(id) {
        return this.request(`/admin/vip-levels/${id}`, {
            method: 'DELETE'
        });
    }

    // VIP挑战管理相关API
    async getVipChallenges(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `/admin/vip-challenges?${queryString}` : '/admin/vip-challenges';
        return this.request(url);
    }

    async adminCompleteChallenge(challengeId) {
        return this.request(`/admin/vip-challenges/${challengeId}/complete`, {
            method: 'POST'
        });
    }

    async adminCancelChallenge(challengeId) {
        return this.request(`/admin/vip-challenges/${challengeId}/cancel`, {
            method: 'POST'
        });
    }

    // 新闻管理相关API
    async getNews(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `/admin/news?${queryString}` : '/admin/news';
        return this.request(url);
    }

    async createNews(newsData) {
        return this.request('/admin/news', {
            method: 'POST',
            body: JSON.stringify(newsData)
        });
    }

    async updateNews(id, newsData) {
        return this.request(`/admin/news/${id}`, {
            method: 'PUT',
            body: JSON.stringify(newsData)
        });
    }

    async deleteNews(id) {
        return this.request(`/admin/news/${id}`, {
            method: 'DELETE'
        });
    }

    // ==========================================
    // 钱包管理相关API
    // ==========================================
    
    // 获取钱包统计数据
    async getWalletStats() {
        return this.request('/admin/wallet/overview');
    }
    
    // 获取提现申请列表
    async getWithdrawals(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `/admin/wallet/withdrawals?${queryString}` : '/admin/wallet/withdrawals';
        return this.request(url);
    }
    
    // 批准提现申请
    async approveWithdrawal(withdrawalId, adminNotes = '') {
        return this.request(`/admin/wallet/withdrawals/${withdrawalId}`, {
            method: 'PUT',
            body: JSON.stringify({
                status: 'approved',
                adminNotes
            })
        });
    }
    
    // 拒绝提现申请
    async rejectWithdrawal(withdrawalId, reason) {
        return this.request(`/admin/wallet/withdrawals/${withdrawalId}`, {
            method: 'PUT',
            body: JSON.stringify({
                status: 'rejected',
                adminNotes: reason
            })
        });
    }

    // 管理员充值
    async adminDeposit(depositData) {
        return this.request('/admin/wallet/deposit', {
            method: 'POST',
            body: JSON.stringify(depositData)
        });
    }

    // 获取充值记录
    async getDepositRecords(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `/admin/wallet/deposits?${queryString}` : '/admin/wallet/deposits';
        return this.request(url);
    }

    // 获取所有交易记录
    async getAllTransactions() {
        return this.request('/admin/wallet/transactions');
    }
    
    // 发放奖励
    async giveReward(rewardData) {
        return this.request('/admin/wallets/reward', {
            method: 'POST',
            body: JSON.stringify(rewardData)
        });
    }
    
    // 调整余额
    async adjustBalance(adjustData) {
        return this.request('/admin/wallets/adjust', {
            method: 'POST',
            body: JSON.stringify(adjustData)
        });
    }
    
    // 获取交易记录
    async getTransactions() {
        return this.request('/admin/wallets/transactions');
    }
    
    // 获取用户交易记录
    async getUserTransactions(userId, page = 1, limit = 20) {
        return this.request(`/admin/users/${userId}/transactions?page=${page}&limit=${limit}`);
    }
    
    // 获取用户钱包列表
    async getUserWallets() {
        return this.request('/admin/wallets/users');
    }
    
    // ==========================================
    // 用户余额管理相关API
    // ==========================================
    
    // 为用户增加余额
    async addUserBalance(userId, amount, note = '') {
        return this.request('/admin/wallet/adjust', {
            method: 'POST',
            body: JSON.stringify({
                userId,
                type: 'add',
                amount,
                reason: note || '管理员充值'
            })
        });
    }
    
    // 为用户减少余额
    async subtractUserBalance(userId, amount, note = '') {
        return this.request('/admin/wallet/adjust', {
            method: 'POST',
            body: JSON.stringify({
                userId,
                type: 'subtract',
                amount,
                reason: note || '管理员扣款'
            })
        });
    }
    
    // 冻结用户余额
    async freezeUserBalance(userId, amount, note = '') {
        // 冻结需要先减少余额，然后增加冻结余额，这里简化为减少余额
        return this.request('/admin/wallet/adjust', {
            method: 'POST',
            body: JSON.stringify({
                userId,
                type: 'subtract',
                amount,
                reason: note || '管理员冻结余额'
            })
        });
    }
    
    // 解冻用户余额
    async unfreezeUserBalance(userId, amount, note = '') {
        // 解冻需要先减少冻结余额，然后增加可用余额，这里简化为增加余额
        return this.request('/admin/wallet/adjust', {
            method: 'POST',
            body: JSON.stringify({
                userId,
                type: 'add',
                amount,
                reason: note || '管理员解冻余额'
            })
        });
    }
    
    // ==========================================
    // 签到管理相关API
    // ==========================================
    
    // 获取签到系统概览
    async getCheckinOverview(token) {
        return this.request('/admin/checkin/overview');
    }
    
    // 获取签到统计数据
    async getCheckinStats(token, page = 1, limit = 10) {
        return this.request(`/admin/checkin/stats?page=${page}&limit=${limit}`);
    }
    
    // 获取用户签到详情
    async getUserCheckinDetails(token, userId) {
        return this.request(`/admin/checkin/user/${userId}`);
    }
    
    // 手动添加签到
    async addManualCheckin(token, checkinData) {
        return this.request('/admin/checkin/manual', {
            method: 'POST',
            body: JSON.stringify(checkinData)
        });
    }
    
    // 删除签到记录
    async deleteCheckin(token, checkinId) {
        return this.request(`/admin/checkin/${checkinId}`, {
            method: 'DELETE'
        });
    }
    
    // 获取签到配置
    async getCheckinConfig(token) {
        return this.request('/admin/checkin/config');
    }
    
    // 更新签到配置
    async updateCheckinConfig(token, configData) {
        return this.request('/admin/checkin/config', {
            method: 'PUT',
            body: JSON.stringify(configData)
        });
    }
    
    // ==========================================
    // PK挑战管理相关API
    // ==========================================
    
    // 获取PK挑战列表
    async getPkChallenges(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `/admin/pk/challenges?${queryString}` : '/admin/pk/challenges';
        return this.request(url);
    }
    
    // 获取PK挑战详情
    async getPkChallengeDetails(challengeId) {
        return this.request(`/admin/pk-challenges/${challengeId}`);
    }
    
    // 取消PK挑战
    async cancelPkChallenge(challengeId) {
        return this.request(`/admin/pk-challenges/${challengeId}/cancel`, {
            method: 'POST'
        });
    }
    
    // 手动结算PK挑战
    async settlePkChallenge(challengeId, winnerId) {
        return this.request(`/admin/pk-challenges/${challengeId}/settle`, {
            method: 'POST',
            body: JSON.stringify({ winnerId })
        });
    }
    
    // 管理用户PK权限
    async managePkPermission(userId, pkEnabled) {
        return this.request(`/admin/pk-challenges/users/${userId}/pk-permission`, {
            method: 'PUT',
            body: JSON.stringify({ pkEnabled })
        });
    }
    
    // ==========================================
    // 成就管理相关API
    // ==========================================
    
    // 获取成就类型列表
    async getAchievementTypes() {
        return this.request('/achievements/admin/types');
    }
    
    // 获取所有成就
    async getAchievements(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `/achievements/admin/achievements?${queryString}` : '/achievements/admin/achievements';
        return this.request(url);
    }
    
    // 创建新成就
    async createAchievement(achievementData) {
        return this.request('/admin/achievements', {
            method: 'POST',
            body: JSON.stringify(achievementData)
        });
    }
    
    // 更新成就
    async updateAchievement(id, achievementData) {
        return this.request(`/admin/achievements/${id}`, {
            method: 'PUT',
            body: JSON.stringify(achievementData)
        });
    }
    
    // 删除成就
    async deleteAchievement(id) {
        return this.request(`/admin/achievements/${id}`, {
            method: 'DELETE'
        });
    }
    
    // 切换成就启用状态
    async toggleAchievement(id) {
        return this.request(`/admin/achievements/${id}/toggle`, {
            method: 'PUT'
        });
    }
    
    // 获取成就统计信息
    async getAchievementStats() {
        return this.request('/admin/achievements/stats');
    }
    
    // 管理员查看指定用户的成就
    async getUserAchievements(userId) {
        return this.request(`/admin/achievements/users/${userId}/achievements`);
    }

    // ==========================================
    // 团队管理相关API
    // ==========================================
    
    // 获取团队统计
    async getTeamStatistics(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `/team/admin/statistics?${queryString}` : '/team/admin/statistics';
        return this.request(url);
    }
    
    // 获取用户团队详情
    async getUserTeamDetail(userId) {
        return this.request(`/admin/team-statistics/users/${userId}`);
    }
    
    // 获取团队配置
    async getTeamConfig() {
        return this.request('/admin/team-statistics/config');
    }
    
    // 更新团队配置
    async updateTeamConfig(configKey, configValue) {
        return this.request('/admin/team-statistics/config', {
            method: 'PUT',
            body: JSON.stringify({ configKey, configValue })
        });
    }
    
    // 获取返佣记录
    async getCommissionRecords(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `/admin/team-statistics/commissions?${queryString}` : '/admin/team-statistics/commissions';
        return this.request(url);
    }
    
    // 获取邀请奖励记录
    async getInvitationRewards(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `/admin/team-statistics/invitation-rewards?${queryString}` : '/admin/team-statistics/invitation-rewards';
        return this.request(url);
    }

    // ==========================================
    // 通知管理（管理员）
    // ==========================================

    async adminGetNotifications(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `/admin/notifications?${queryString}` : '/admin/notifications';
        return this.request(url);
    }

    async adminCreateNotification(payload) {
        return this.request('/admin/notifications', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    async adminMarkNotificationRead(id) {
        return this.request(`/admin/notifications/${id}/read`, {
            method: 'PUT'
        });
    }

    async adminDeleteNotification(id) {
        return this.request(`/admin/notifications/${id}`, {
            method: 'DELETE'
        });
    }

    // ==========================================
    // 模板管理（管理员）
    // ==========================================

    async adminGetTemplates(params = {}) {
        const query = new URLSearchParams();
        if (params.template_key) query.set('template_key', params.template_key);
        if (params.locale) query.set('locale', params.locale);
        if (params.channel) query.set('channel', params.channel);
        if (typeof params.active !== 'undefined' && params.active !== '') query.set('active', params.active);
        if (params.page) query.set('page', String(params.page));
        if (params.page_size) query.set('page_size', String(params.page_size));
        const qs = query.toString();
        const url = qs ? `/admin/notification-templates?${qs}` : '/admin/notification-templates';
        return this.request(url);
    }

    async adminCreateTemplate(payload) {
        return this.request('/admin/notification-templates', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    async adminToggleTemplate(id, active) {
        return this.request(`/admin/notification-templates/${id}/activate`, {
            method: 'PATCH',
            body: JSON.stringify({ is_active: !!active })
        });
    }

    async adminGetLatestTemplate(params = {}) {
        const query = new URLSearchParams();
        if (params.template_key) query.set('template_key', params.template_key);
        if (params.locale) query.set('locale', params.locale);
        if (params.channel) query.set('channel', params.channel);
        const url = `/admin/notification-templates/latest?${query.toString()}`;
        return this.request(url);
    }

    async adminPreviewTemplate(params = {}) {
        const query = new URLSearchParams();
        if (params.template_key) query.set('template_key', params.template_key);
        if (params.locale) query.set('locale', params.locale);
        if (params.channel) query.set('channel', params.channel);
        if (params.variables) query.set('variables', JSON.stringify(params.variables));
        const url = `/admin/notification-templates/preview?${query.toString()}`;
        return this.request(url);
    }

    async adminUpdateTemplate(id, payload) {
        return this.request(`/admin/notification-templates/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
    }

    async adminDeleteTemplate(id) {
        return this.request(`/admin/notification-templates/${id}`, {
            method: 'DELETE'
        });
    }

    // ==========================================
    // 通知 - 扩展能力（批量发送 / 导出）
    // ==========================================

    async adminBatchSendNotifications(payload) {
        return this.request('/admin/notifications/send', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    async adminExportNotifications(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/admin/notifications/export?${queryString}` : '/admin/notifications/export';

        // 单独用 fetch 处理文件下载
        const mappedEndpoint = mapApiPath(endpoint);
        const url = `${this.baseUrl}${mappedEndpoint}`;

        const token = this.getToken();
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            credentials: 'include'
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || '导出失败');
        }
        const blob = await res.blob();
        const a = document.createElement('a');
        const href = URL.createObjectURL(blob);
        a.href = href;
        a.download = 'notifications.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(href);
        return { success: true };
    }
}

// 创建单例实例
const adminApi = new AdminApi();

export default adminApi;