class Api {
    constructor() {
        // 根据环境配置 API 地址
        const config = window.API_CONFIG || { baseUrl: 'http://localhost:3000', apiPath: '/api' };
        this.baseUrl = `${config.baseUrl}${config.apiPath}`;

        // 请求超时时间（毫秒）
        this.timeout = 10000;

        // 请求头默认配置
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
        
        // 请求拦截器
        this.beforeRequestHook = null;
        
        // 响应拦截器
        this.afterResponseHook = null;
    }

    /**
     * 设置请求拦截器
     * @param {Function} hook - 拦截器函数
     */
    setBeforeRequestHook(hook) {
        this.beforeRequestHook = hook;
    }

    /**
     * 设置响应拦截器
     * @param {Function} hook - 拦截器函数
     */
    setAfterResponseHook(hook) {
        this.afterResponseHook = hook;
    }

        /**
     * 通用请求方法
     * @param {string} endpoint - API 接口路径
     * @param {string} method - 请求方法（GET, POST, PUT, DELETE）
     * @param {Object|null} data - 请求体数据
     * @param {string|null} token - 用户 token
     * @returns {Promise<any>} 响应数据
     */
    async request(endpoint, method = 'GET', data = null, token = null) {
        let url = `${this.baseUrl}/${endpoint}`;
        console.log('API请求开始:', {
            url,
            method,
            endpoint,
            hasData: !!data,
            hasToken: !!token
        });

        const headers = { ...this.defaultHeaders };

        // 如果有 token，添加到请求头
        if (token) {
            if (typeof token !== 'string') {
                console.error('Token必须是字符串类型:', typeof token);
                throw new Error('无效的token格式');
            }
            if (!token.trim()) {
                console.error('Token不能为空字符串');
                throw new Error('无效的token');
            }
            headers['Authorization'] = `Bearer ${token}`;
            console.log('已添加Authorization header:', headers['Authorization']);
        } else {
            console.warn('请求中没有提供token');
        }

        let options = {
            method,
            headers,
            credentials: 'same-origin', // 改为same-origin，因为我们在同一个域
            mode: 'cors'
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        console.log('完整的请求配置:', {
            url,
            method: options.method,
            headers: options.headers,
            hasBody: !!options.body
        });

        console.log('完整的请求配置:', {
            url,
            method,
            headers,
            body: options.body
        });

        // 执行请求拦截器
        if (this.beforeRequestHook) {
            const result = this.beforeRequestHook(url, options);
            url = result.url || url;
            options = result.options || options;
        }

        try {
            console.log(`Fetching: ${url}`, options);
            const response = await fetch(url, options);
            console.log(`Response received: ${response.status}`, response);

            // 执行响应拦截器
            if (this.afterResponseHook) {
                const processedResponse = this.afterResponseHook(response);
                if (processedResponse) {
                    return processedResponse;
                }
            }

            // 处理非 2xx 响应
            if (!response.ok) {
                // 尝试解析错误响应
                let errorData;
                try {
                    errorData = await response.json();
                } catch (parseError) {
                    // 如果无法解析 JSON，使用默认错误信息
                    errorData = { message: `请求失败: ${response.status} ${response.statusText}` };
                }
                
                // 根据后端返回的错误格式处理错误信息
                const errorMessage = errorData.message || errorData.error || `请求失败: ${response.status} ${response.statusText}`;
                const error = new Error(errorMessage);
                error.details = errorData.details;
                error.response = errorData;
                throw error;
            }

            const result = await response.json();
            console.log(`Request successful, result:`, result);
            return result;
        } catch (error) {
            console.error(`API Error:`, error);
            
            // 更详细地检查网络错误
            if (!navigator.onLine) {
                throw new Error('您似乎已断开网络连接');
            }
            
            // 检查是否是CORS错误或连接错误
            if (error.message.includes('Failed to fetch') || 
                error.message.includes('NetworkError') ||
                error.message.includes('CORS') ||
                error.message.includes('TypeError')) {
                throw new Error('网络连接问题，请检查您的网络或稍后重试');
            }

            // 如果已经是 Error 对象，直接抛出
            if (error instanceof Error) {
                throw error;
            }

            // 否则创建新的 Error 对象
            throw new Error(`API 请求错误: ${error.message || error}`);
        }
    }

    // ----------------------------
    // 用户认证相关接口
    // ----------------------------

    /**
     * 用户登录
     * @param {string} email - 邮箱
     * @param {string} password - 密码
     * @returns {Promise<any>} 登录结果
     */
    async login(email, password) {
        try {
            const data = { email, password };
            const result = await this.request('auth/login', 'POST', data);
            console.log('登录响应:', result); // 调试信息
            return result;
        } catch (error) {
            console.error('登录API错误:', error);
            return {
                success: false,
                error: error.message || '登录失败'
            };
        }
    }

    /**
     * 用户注册
     * @param {string} email - 邮箱
     * @param {string} password - 密码
     * @returns {Promise<any>} 注册结果
     */
    async register(email, password) {
        return this.request('auth/register', 'POST', { email, password });
    }

    /**
     * Telegram登录
     * @param {object} authData - Telegram认证数据
     * @returns {Promise<any>} 登录结果
     */
    async telegramLogin(authData) {
        try {
            console.log('📱 开始Telegram登录请求:', { 
                telegramId: authData.id, 
                username: authData.username,
                firstName: authData.first_name 
            });
            
            const result = await this.request('auth/telegram', 'POST', authData);
            console.log('✅ Telegram登录响应:', result);
            return result;
        } catch (error) {
            console.error('❌ Telegram登录API错误:', error);
            
            // 提供更友好的错误信息
            let errorMessage = 'Telegram登录失败';
            if (error.message.includes('Network Error')) {
                errorMessage = '网络连接失败，请检查网络后重试';
            } else if (error.message.includes('timeout')) {
                errorMessage = '请求超时，请稍后重试';
            } else if (error.message.includes('500')) {
                errorMessage = '服务器内部错误，请稍后重试';
            } else if (error.message.includes('400')) {
                errorMessage = '请求参数错误，请重新尝试';
            }
            
            return {
                success: false,
                error: errorMessage,
                originalError: error.message
            };
        }
    }

    /**
     * 获取Telegram Bot信息
     * @returns {Promise<any>} Bot信息
     */
    async getTelegramBotInfo() {
        try {
            const result = await this.request('auth/telegram/bot-info', 'GET');
            return result;
        } catch (error) {
            console.error('获取Bot信息错误:', error);
            return {
                success: false,
                error: error.message || '获取Bot信息失败'
            };
        }
    }
    
    /**
     * 刷新token
     * @param {string} token - 当前token
     * @returns {Promise<any>} 新token
     */
    async refreshToken(token) {
        try {
            const result = await this.request('auth/refresh-token', 'POST', {}, token);
            console.log('刷新token响应:', result);
            return result;
        } catch (error) {
            console.error('刷新token错误:', error);
            return {
                success: false,
                error: error.message || '刷新token失败'
            };
        }
    }

    // ----------------------------
    // 用户资料相关接口
    // ----------------------------

    /**
     * 获取用户资料
     * @param {string} token - 用户 token
     * @returns {Promise<any>} 用户资料
     */
    async getProfile(token) {
        return this.request('user/profile', 'GET', null, token);
    }

    /**
     * 更新钱包地址
     * @param {string} token - 用户 token
     * @param {string} trc20Wallet - TRC20 钱包地址
     * @returns {Promise<any>} 更新结果
     */
    async updateWallet(token, trc20Wallet) {
        return this.request('user/wallet', 'PUT', { trc20_wallet: trc20Wallet }, token);
    }

    // ----------------------------
    // 步数相关接口
    // ----------------------------

    /**
     * 提交步数
     * @param {string} token - 用户 token
     * @param {number} steps - 步数
     * @param {string} date - 日期（YYYY-MM-DD）
     * @returns {Promise<any>} 提交结果
     */
    async submitSteps(token, steps, date) {
        return this.request('steps', 'POST', { steps, date }, token);
    }

    /**
     * 获取步数历史记录
     * @param {string} token - 用户 token
     * @param {string} month - 月份（MM）
     * @param {string} year - 年份（YYYY）
     * @returns {Promise<any>} 步数历史
     */
    async getStepHistory(token, month, year) {
        return this.request(`steps/history?month=${month}&year=${year}`, 'GET', null, token);
    }

    // ----------------------------
    // 排行榜相关接口
    // ----------------------------

    /**
     * 获取排行榜
     * @param {string} token - 用户 token
     * @param {string} date - 日期（YYYY-MM-DD）
     * @returns {Promise<any>} 排行榜数据
     */
    async getLeaderboard(token, date) {
        return this.request(`leaderboard?date=${date}`, 'GET', null, token);
    }

    // ----------------------------
    // 新闻相关接口
    // ----------------------------

    /**
     * 获取新闻列表
     * @param {string} token - 用户 token
     * @returns {Promise<any>} 新闻列表
     */
    async getNews(token) {
        return this.request('news', 'GET', null, token);
    }

    /**
     * 获取新闻详情
     * @param {string} token - 用户 token
     * @param {number} newsId - 新闻 ID
     * @returns {Promise<any>} 新闻详情
     */
    async getNewsById(token, newsId) {
        return this.request(`news/${newsId}`, 'GET', null, token);
    }

    // ----------------------------
    // 通知相关接口
    // ----------------------------

    /**
     * 获取通知列表
     * @param {string} token - 用户 token
     * @returns {Promise<any>} 通知列表
     */
    async getNotifications(token) {
        return this.request('notifications', 'GET', null, token);
    }

    /**
     * 标记通知为已读
     * @param {string} token - 用户 token
     * @param {number} notificationId - 通知 ID
     * @returns {Promise<any>} 响应结果
     */
    async markNotificationAsRead(token, notificationId) {
        return this.request(`notifications/${notificationId}/read`, 'PUT', null, token);
    }

    // ----------------------------
    // PK 挑战相关接口
    // ----------------------------

    /**
     * 搜索PK挑战用户
     * @param {string} token - 用户 token
     * @param {string} keyword - 搜索关键词
     * @returns {Promise<any>} 搜索结果
     */
    async searchPKUsers(token, keyword) {
        return this.request(`pk/users/search?keyword=${encodeURIComponent(keyword)}`, 'GET', null, token);
    }

    /**
     * 创建 PK 挑战
     * @param {string} token - 用户 token
     * @param {Object} challengeData - 挑战数据
     * @returns {Promise<any>} 挑战结果
     */
    async createPKChallenge(token, challengeData) {
        return this.request('pk/challenges', 'POST', challengeData, token);
    }

    /**
     * 获取 PK 挑战列表
     * @param {string} token - 用户 token
     * @returns {Promise<any>} 挑战列表
     */
    async getPKChallenges(token) {
        return this.request('pk/challenges', 'GET', null, token);
    }

    /**
     * 获取 PK 挑战详情
     * @param {string} token - 用户 token
     * @param {number} challengeId - 挑战 ID
     * @returns {Promise<any>} 挑战详情
     */
    async getPKChallengeDetails(token, challengeId) {
        return this.request(`pk/challenges/${challengeId}`, 'GET', null, token);
    }

    /**
     * 接受 PK 挑战
     * @param {string} token - 用户 token
     * @param {number} challengeId - 挑战 ID
     * @returns {Promise<any>} 接受结果
     */
    async acceptPKChallenge(token, challengeId) {
        return this.request(`pk/challenges/${challengeId}/accept`, 'POST', {}, token);
    }

    /**
     * 拒绝 PK 挑战
     * @param {string} token - 用户 token
     * @param {number} challengeId - 挑战 ID
     * @returns {Promise<any>} 拒绝结果
     */
    async rejectPKChallenge(token, challengeId) {
        return this.request(`pk/challenges/${challengeId}/reject`, 'POST', {}, token);
    }

    /**
     * 取消 PK 挑战
     * @param {string} token - 用户 token
     * @param {number} challengeId - 挑战 ID
     * @returns {Promise<any>} 取消结果
     */
    async cancelPKChallenge(token, challengeId) {
        return this.request(`pk/challenges/${challengeId}/cancel`, 'POST', {}, token);
    }

    /**
     * 提交步数
     * @param {string} token - 用户 token
     * @param {number} challengeId - 挑战 ID
     * @param {number} steps - 步数
     * @param {string} date - 日期
     * @returns {Promise<any>} 提交结果
     */
    async submitPKSteps(token, challengeId, steps, date) {
        return this.request(`pk/challenges/${challengeId}/steps`, 'POST', { steps, date }, token);
    }

    /**
     * 发送消息
     * @param {string} token - 用户 token
     * @param {number} challengeId - 挑战 ID
     * @param {string} message - 消息内容
     * @returns {Promise<any>} 发送结果
     */
    async sendPKMessage(token, challengeId, message) {
        return this.request(`pk/challenges/${challengeId}/messages`, 'POST', { message }, token);
    }

    // ----------------------------
    // VIP 等级相关接口
    // ----------------------------

    /**
     * 获取 VIP 等级列表（用户端）
     * @returns {Promise<any>} VIP 等级列表
     */
    async getVipLevels() {
        return this.request('vip-levels/active', 'GET', null, null);
    }

    /**
     * 获取 VIP 挑战列表
     * @param {string} token - 用户 token
     * @returns {Promise<any>} VIP 挑战列表
     */
    async getVipChallenges(token) {
        return this.request('admin/vip-challenges', 'GET', null, token);
    }

    /**
     * 获取用户 VIP 等级信息
     * @param {string} token - 用户 token
     * @returns {Promise<any>} 用户 VIP 等级信息
     */
    async getUserVipLevel(token) {
        return this.request('user/vip-level', 'GET', null, token);
    }

    /**
     * 获取用户挑战记录
     * @param {string} token - 用户 token
     * @returns {Promise<any>} 用户挑战记录
     */
    async getUserChallenges(token) {
        return this.request('user/challenges', 'GET', null, token);
    }

    /**
     * 开始 VIP 挑战
     * @param {string} token - 用户 token
     * @param {number} vipLevelId - VIP 等级 ID
     * @returns {Promise<any>} 挑战结果
     */
    async startVipChallenge(token, vipLevelId) {
        return this.request('user/vip-challenge/start', 'POST', { vipLevelId }, token);
    }

    /**
     * 取消 VIP 挑战
     * @param {string} token - 用户 token
     * @param {number} challengeId - 挑战 ID
     * @returns {Promise<any>} 取消结果
     */
    async cancelVipChallenge(token, challengeId) {
        return this.request(`user/vip-challenge/${challengeId}/cancel`, 'PUT', null, token);
    }

    /**
     * 完成 VIP 挑战
     * @param {string} token - 用户 token
     * @param {number} challengeId - 挑战 ID
     * @param {number} steps - 步数
     * @returns {Promise<any>} 完成结果
     */
    async completeVipChallenge(token, challengeId, steps) {
        return this.request(`user/vip-challenge/${challengeId}/complete`, 'PUT', { steps }, token);
    }

    /**
     * 获取用户当前挑战
     * @param {string} token - 用户 token
     * @returns {Promise<any>} 当前挑战信息
     */
    async getCurrentChallenge(token) {
        return this.request('user/vip-challenge/current', 'GET', null, token);
    }

    // ----------------------------
    // 钱包相关接口
    // ----------------------------

    /**
     * 获取钱包信息
     * @param {string} token - 用户 token
     * @returns {Promise<any>} 钱包信息
     */
    async getWalletInfo(token) {
        return this.request('wallet/info', 'GET', null, token);
    }

    /**
     * 获取钱包交易记录
     * @param {string} token - 用户 token
     * @returns {Promise<any>} 交易记录
     */
    async getWalletTransactions(token) {
        return this.request('wallet/transactions', 'GET', null, token);
    }
    
    // 签到相关API
    async getCheckinInfo(token) {
        return this.request('checkin/info', 'GET', null, token);
    }
    
    async checkin(token) {
        return this.request('checkin', 'POST', {}, token);
    }

    /**
     * 充值
     * @param {string} token - 用户 token
     * @param {number} amount - 充值金额
     * @returns {Promise<any>} 充值结果
     */
    async deposit(token, amount) {
        return this.request('wallet/deposit', 'POST', { amount }, token);
    }

    /**
     * 提现
     * @param {string} token - 用户 token
     * @param {number} amount - 提现金额
     * @param {string} walletAddress - 钱包地址
     * @returns {Promise<any>} 提现结果
     */
    async withdraw(token, amount, walletAddress) {
        return this.request('wallet/withdraw', 'POST', { amount, walletAddress }, token);
    }

    // ----------------------------
    // 工具方法
    // ----------------------------

    /**
     * 检查网络连接状态
     * @returns {boolean} 是否有网络
     */
    isOnline() {
        return navigator.onLine;
    }

    /**
     * 设置自定义请求头
     * @param {Object} headers - 自定义请求头
     */
    setHeaders(headers) {
        this.defaultHeaders = {
            ...this.defaultHeaders,
            ...headers
        };
    }

    /**
     * 清除所有请求头
     */
    clearHeaders() {
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    // 获取用户挑战统计信息
    async getChallengeStats() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('未找到登录令牌');
            }

            const response = await fetch(`${this.baseUrl}/user/vip-challenge/stats`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || '获取挑战统计失败');
            }

            return data;
        } catch (error) {
            console.error('获取挑战统计失败:', error);
            throw error;
        }
    }

    // 获取用户挑战历史记录
    async getChallengeHistory(options = {}) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('未找到登录令牌');
            }

            const { page = 1, limit = 10, status, levelId } = options;
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });

            if (status) params.append('status', status);
            if (levelId) params.append('levelId', levelId.toString());

            const response = await fetch(`${this.baseUrl}/vip-challenges/history?${params}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || '获取挑战历史失败');
            }

            return data;
        } catch (error) {
            console.error('获取挑战历史失败:', error);
            throw error;
        }
    }

    // 获取挑战进度详情
    async getChallengeProgress(challengeId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('未找到登录令牌');
            }

            const response = await fetch(`${this.baseUrl}/vip-challenges/progress/${challengeId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || '获取挑战进度失败');
            }

            return data;
        } catch (error) {
            console.error('获取挑战进度失败:', error);
            throw error;
        }
    }

    // 获取用户挑战趋势分析
    async getChallengeTrends(period = 30) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('未找到登录令牌');
            }

            const response = await fetch(`${this.baseUrl}/vip-challenges/trends?period=${period}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || '获取挑战趋势失败');
            }

            return data;
        } catch (error) {
            console.error('获取挑战趋势失败:', error);
            throw error;
        }
    }

    // 获取用户挑战成就统计
    async getChallengeAchievements() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('未找到登录令牌');
            }

            const response = await fetch(`${this.baseUrl}/vip-challenges/achievements`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || '获取挑战成就失败');
            }

            return data;
        } catch (error) {
            console.error('获取挑战成就失败:', error);
            throw error;
        }
    }
}

// 导出单例
export default new Api();