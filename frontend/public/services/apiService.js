/**
 * API服务层 - 统一管理所有API调用
 * 提供统一的错误处理、重试机制和状态管理
 */

class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:3000';
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
        this.timeout = 10000; // 10秒超时
        this.retryAttempts = 2; // 重试次数
    }

    /**
     * 获取认证头
     * @returns {Object} 包含Authorization的headers
     */
    getAuthHeaders() {
        const token = localStorage.getItem('token');
        if (token) {
            return {
                ...this.defaultHeaders,
                'Authorization': `Bearer ${token}`
            };
        }
        return this.defaultHeaders;
    }

    /**
     * 通用请求方法
     * @param {string} endpoint - API端点
     * @param {Object} options - 请求选项
     * @returns {Promise} 请求结果
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            method: 'GET',
            headers: this.getAuthHeaders(),
            timeout: this.timeout,
            ...options
        };

        // 添加重试逻辑
        for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
            try {
                const response = await this.makeRequest(url, config);
                
                if (response.ok) {
                    return await response.json();
                } else {
                    // 处理HTTP错误
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (error) {
                if (attempt === this.retryAttempts) {
                    throw error;
                }
                
                // 如果不是网络错误，不重试
                if (!this.isNetworkError(error)) {
                    throw error;
                }
                
                // 等待后重试
                await this.delay(1000 * (attempt + 1));
            }
        }
    }

    /**
     * 执行HTTP请求
     * @param {string} url - 完整URL
     * @param {Object} config - 请求配置
     * @returns {Promise} fetch响应
     */
    async makeRequest(url, config) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);

        try {
            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('请求超时');
            }
            throw error;
        }
    }

    /**
     * 判断是否为网络错误
     * @param {Error} error - 错误对象
     * @returns {boolean} 是否为网络错误
     */
    isNetworkError(error) {
        return error.name === 'TypeError' || 
               error.message.includes('fetch') ||
               error.message.includes('网络') ||
               error.message.includes('Network');
    }

    /**
     * 延迟函数
     * @param {number} ms - 延迟毫秒数
     * @returns {Promise} 延迟Promise
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ==================== 用户个人资料相关API ====================

    /**
     * 获取用户个人资料
     * @returns {Promise} 用户资料数据
     */
    async getUserProfile() {
        return this.request('/api/user/profile');
    }

    /**
     * 更新用户个人资料
     * @param {Object} profileData - 个人资料数据
     * @returns {Promise} 更新结果
     */
    async updateUserProfile(profileData) {
        return this.request('/api/user/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    /**
     * 修改用户密码
     * @param {Object} passwordData - 密码数据
     * @returns {Promise} 修改结果
     */
    async changePassword(passwordData) {
        return this.request('/api/user/password', {
            method: 'PUT',
            body: JSON.stringify(passwordData)
        });
    }

    /**
     * 获取用户设置
     * @returns {Promise} 用户设置数据
     */
    async getUserSettings() {
        return this.request('/api/user/settings');
    }

    /**
     * 更新用户设置
     * @param {Object} settingsData - 设置数据
     * @returns {Promise} 更新结果
     */
    async updateUserSettings(settingsData) {
        return this.request('/api/user/settings', {
            method: 'PUT',
            body: JSON.stringify(settingsData)
        });
    }

    // ==================== 通知系统相关API ====================

    /**
     * 获取用户通知列表
     * @param {Object} params - 查询参数
     * @returns {Promise} 通知列表数据
     */
    async getNotifications(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/api/notifications?${queryString}` : '/api/notifications';
        return this.request(endpoint);
    }

    /**
     * 获取未读通知数量
     * @returns {Promise} 未读通知数量
     */
    async getUnreadNotificationCount() {
        return this.request('/api/notifications/unread-count');
    }

    /**
     * 标记通知为已读
     * @param {string} notificationId - 通知ID
     * @returns {Promise} 操作结果
     */
    async markNotificationAsRead(notificationId) {
        return this.request(`/api/notifications/${notificationId}/read`, {
            method: 'PUT'
        });
    }

    // ==================== 系统管理相关API ====================

    /**
     * 获取系统概览
     * @returns {Promise} 系统概览数据
     */
    async getSystemOverview() {
        return this.request('/api/system/overview');
    }

    // ==================== 搜索功能相关API ====================

    /**
     * 全局搜索
     * @param {Object} params - 搜索参数
     * @returns {Promise} 搜索结果
     */
    async globalSearch(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/api/search/global?${queryString}` : '/api/search/global';
        return this.request(endpoint);
    }

    /**
     * 获取搜索建议
     * @param {Object} params - 搜索参数
     * @returns {Promise} 搜索建议
     */
    async getSearchSuggestions(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/api/search/suggestions?${queryString}` : '/api/search/suggestions';
        return this.request(endpoint);
    }

    // ==================== 工具方法 ====================

    /**
     * 检查用户是否已登录
     * @returns {boolean} 登录状态
     */
    isLoggedIn() {
        return !!localStorage.getItem('token');
    }

    /**
     * 获取当前用户信息
     * @returns {Object|null} 用户信息
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    /**
     * 清除用户数据
     */
    clearUserData() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
}

// 创建单例实例
const apiService = new ApiService();

// 导出实例
export default apiService;
