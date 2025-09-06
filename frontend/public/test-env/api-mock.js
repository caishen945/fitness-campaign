/**
 * API模拟服务
 * 用于在本地测试环境中模拟后端API响应，避免网络依赖
 */

class ApiMock {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
        this.delayMs = 500; // 模拟网络延迟
        this.testUsers = new Map();
        this.testTokens = new Map();
        this.currentUserId = 1;
        
        this.init();
    }
    
    /**
     * 初始化测试数据
     */
    init() {
        console.log('🚀 初始化API模拟服务...');
        
        // 创建测试用户
        this.createTestUsers();
        
        // 创建测试token
        this.createTestTokens();
        
        console.log('✅ API模拟服务初始化完成');
    }
    
    /**
     * 创建测试用户数据
     */
    createTestUsers() {
        const users = [
            {
                id: 1,
                username: 'testuser1',
                email: 'test1@example.com',
                telegram_id: 123456789,
                first_name: 'Test',
                last_name: 'User1',
                created_at: '2025-01-01T00:00:00Z',
                is_active: true
            },
            {
                id: 2,
                username: 'testuser2',
                email: 'test2@example.com',
                telegram_id: 987654321,
                first_name: 'Test',
                last_name: 'User2',
                created_at: '2025-01-02T00:00:00Z',
                is_active: true
            },
            {
                id: 3,
                username: 'telegram_user',
                email: null,
                telegram_id: 555666777,
                first_name: 'Telegram',
                last_name: 'User',
                created_at: '2025-01-03T00:00:00Z',
                is_active: true
            }
        ];
        
        users.forEach(user => {
            this.testUsers.set(user.id, user);
        });
        
        console.log('✅ 创建了', users.length, '个测试用户');
    }
    
    /**
     * 创建测试token
     */
    createTestTokens() {
        this.testTokens.set('valid_token_1', { userId: 1, expires: Date.now() + 24 * 60 * 60 * 1000 });
        this.testTokens.set('valid_token_2', { userId: 2, expires: Date.now() + 24 * 60 * 60 * 1000 });
        this.testTokens.set('valid_token_3', { userId: 3, expires: Date.now() + 24 * 60 * 60 * 1000 });
        this.testTokens.set('expired_token', { userId: 1, expires: Date.now() - 1000 });
        this.testTokens.set('invalid_token', null);
        
        console.log('✅ 创建了测试token');
    }
    
    /**
     * 模拟网络延迟
     */
    async delay(ms = this.delayMs) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * 验证token
     */
    validateToken(token) {
        if (!token) return null;
        
        const tokenData = this.testTokens.get(token);
        if (!tokenData) return null;
        
        if (Date.now() > tokenData.expires) {
            return null; // token过期
        }
        
        return this.testUsers.get(tokenData.userId);
    }
    
    /**
     * 生成JWT token
     */
    generateToken(userId) {
        const token = `mock_token_${userId}_${Date.now()}`;
        this.testTokens.set(token, { userId, expires: Date.now() + 24 * 60 * 60 * 1000 });
        return token;
    }
    
    /**
     * 模拟HTTP请求
     */
    async request(endpoint, method = 'GET', data = null) {
        console.log(`🌐 API模拟请求: ${method} ${endpoint}`, data);
        
        // 模拟网络延迟
        await this.delay();
        
        try {
            const response = await this.handleRequest(endpoint, method, data);
            console.log('✅ API模拟响应:', response);
            return response;
        } catch (error) {
            console.error('❌ API模拟错误:', error);
            throw error;
        }
    }
    
    /**
     * 处理具体请求
     */
    async handleRequest(endpoint, method, data) {
        const path = endpoint.replace('/api', '');
        
        switch (path) {
            case '/auth/login':
                return this.handleLogin(data);
                
            case '/auth/register':
                return this.handleRegister(data);
                
            case '/auth/telegram':
                return this.handleTelegramLogin(data);
                
            case '/auth/telegram/bot-info':
                return this.handleBotInfo();
                
            case '/auth/refresh':
                return this.handleRefreshToken(data);
                
            case '/users/profile':
                return this.handleGetProfile(data);
                
            case '/users/profile/update':
                return this.handleUpdateProfile(data);
                
            case '/users/all':
                return this.handleGetAllUsers(data);
                
            default:
                throw new Error(`未知的API端点: ${endpoint}`);
        }
    }
    
    /**
     * 处理用户登录
     */
    async handleLogin(data) {
        const { email, password } = data;
        
        // 查找用户
        const user = Array.from(this.testUsers.values()).find(u => u.email === email);
        
        if (!user) {
            throw new Error('用户不存在');
        }
        
        // 模拟密码验证（这里简化处理）
        if (password !== 'password123') {
            throw new Error('密码错误');
        }
        
        const token = this.generateToken(user.id);
        
        return {
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                telegramId: user.telegram_id,
                firstName: user.first_name,
                lastName: user.last_name
            }
        };
    }
    
    /**
     * 处理用户注册
     */
    async handleRegister(data) {
        const { username, email, password } = data;
        
        // 检查用户名是否已存在
        const existingUser = Array.from(this.testUsers.values()).find(u => u.username === username);
        if (existingUser) {
            throw new Error('用户名已存在');
        }
        
        // 检查邮箱是否已存在
        const existingEmail = Array.from(this.testUsers.values()).find(u => u.email === email);
        if (existingEmail) {
            throw new Error('邮箱已被注册');
        }
        
        // 创建新用户
        const newUser = {
            id: ++this.currentUserId,
            username,
            email,
            telegram_id: null,
            first_name: username,
            last_name: '',
            created_at: new Date().toISOString(),
            is_active: true
        };
        
        this.testUsers.set(newUser.id, newUser);
        
        const token = this.generateToken(newUser.id);
        
        return {
            success: true,
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                telegramId: newUser.telegram_id,
                firstName: newUser.first_name,
                lastName: newUser.last_name
            }
        };
    }
    
    /**
     * 处理Telegram登录
     */
    async handleTelegramLogin(data) {
        const { id, username, first_name, last_name } = data;
        
        // 查找现有Telegram用户
        let user = Array.from(this.testUsers.values()).find(u => u.telegram_id === id);
        
        if (!user) {
            // 创建新用户
            user = {
                id: ++this.currentUserId,
                username: username || `tg_${id}`,
                email: null,
                telegram_id: id,
                first_name: first_name || 'Telegram',
                last_name: last_name || 'User',
                created_at: new Date().toISOString(),
                is_active: true
            };
            
            this.testUsers.set(user.id, user);
            console.log('✅ 创建新Telegram用户:', user);
        }
        
        const token = this.generateToken(user.id);
        
        return {
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                telegramId: user.telegram_id,
                firstName: user.first_name,
                lastName: user.last_name
            },
            isNewUser: !user.created_at || user.created_at === new Date().toISOString()
        };
    }
    
    /**
     * 处理Bot信息
     */
    async handleBotInfo() {
        return {
            success: true,
            bot: {
                id: 8208922479,
                is_bot: true,
                first_name: 'FitChallenge Bot',
                username: 'Fit_FitChallengeBOT',
                can_join_groups: true,
                can_read_all_group_messages: false,
                supports_inline_queries: true
            }
        };
    }
    
    /**
     * 处理token刷新
     */
    async handleRefreshToken(token) {
        const user = this.validateToken(token);
        
        if (!user) {
            throw new Error('Token无效或已过期');
        }
        
        const newToken = this.generateToken(user.id);
        
        return {
            success: true,
            token: newToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                telegramId: user.telegram_id,
                firstName: user.first_name,
                lastName: user.last_name
            }
        };
    }
    
    /**
     * 获取用户资料
     */
    async handleGetProfile(data) {
        const token = data?.token || data;
        const user = this.validateToken(token);
        
        if (!user) {
            throw new Error('Token无效或已过期');
        }
        
        return {
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                telegramId: user.telegram_id,
                firstName: user.first_name,
                lastName: user.last_name,
                createdAt: user.created_at,
                isActive: user.is_active
            }
        };
    }
    
    /**
     * 更新用户资料
     */
    async handleUpdateProfile(data) {
        const { token, ...updateData } = data;
        const user = this.validateToken(token);
        
        if (!user) {
            throw new Error('Token无效或已过期');
        }
        
        // 更新用户信息
        if (updateData.username) {
            user.username = updateData.username;
        }
        if (updateData.firstName) {
            user.first_name = updateData.firstName;
        }
        if (updateData.lastName) {
            user.last_name = updateData.lastName;
        }
        
        this.testUsers.set(user.id, user);
        
        return {
            success: true,
            message: '用户资料更新成功',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                telegramId: user.telegram_id,
                firstName: user.first_name,
                lastName: user.last_name
            }
        };
    }
    
    /**
     * 获取所有用户（管理员功能）
     */
    async handleGetAllUsers(data) {
        const { token, page = 1, limit = 10 } = data;
        const user = this.validateToken(token);
        
        if (!user) {
            throw new Error('Token无效或已过期');
        }
        
        // 这里简化处理，实际应该有管理员权限检查
        const allUsers = Array.from(this.testUsers.values());
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = allUsers.slice(startIndex, endIndex);
        
        return {
            success: true,
            data: {
                users: paginatedUsers.map(u => ({
                    id: u.id,
                    username: u.username,
                    email: u.email,
                    telegramId: u.telegram_id,
                    firstName: u.first_name,
                    lastName: u.last_name,
                    createdAt: u.created_at,
                    isActive: u.is_active
                })),
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(allUsers.length / limit),
                    totalUsers: allUsers.length,
                    usersPerPage: limit
                }
            }
        };
    }
    
    /**
     * 设置网络延迟
     */
    setDelay(delay) {
        this.delayMs = delay;
        console.log(`⏱️ 网络延迟设置为: ${delay}ms`);
    }
    
    /**
     * 添加测试用户
     */
    addTestUser(userData) {
        const newUser = {
            id: ++this.currentUserId,
            username: userData.username,
            email: userData.email || null,
            telegram_id: userData.telegramId || null,
            first_name: userData.firstName || userData.username,
            last_name: userData.lastName || '',
            created_at: new Date().toISOString(),
            is_active: true
        };
        
        this.testUsers.set(newUser.id, newUser);
        console.log('✅ 添加测试用户:', newUser);
        
        return newUser;
    }
    
    /**
     * 获取测试用户列表
     */
    getTestUsers() {
        return Array.from(this.testUsers.values());
    }
    
    /**
     * 获取测试token列表
     */
    getTestTokens() {
        return Array.from(this.testTokens.entries()).map(([token, data]) => ({
            token,
            userId: data?.userId,
            expires: data?.expires,
            isValid: data && Date.now() < data.expires
        }));
    }
    
    /**
     * 重置测试数据
     */
    reset() {
        console.log('🔄 重置API模拟服务...');
        this.testUsers.clear();
        this.testTokens.clear();
        this.currentUserId = 1;
        this.init();
        console.log('✅ API模拟服务已重置');
    }
    
    /**
     * 获取服务状态
     */
    getStatus() {
        return {
            baseUrl: this.baseUrl,
            delay: this.delayMs,
            userCount: this.testUsers.size,
            tokenCount: this.testTokens.size,
            currentUserId: this.currentUserId
        };
    }
}

// 导出模拟服务类
window.ApiMock = ApiMock;

// 自动创建默认实例
window.apiMock = new ApiMock();

console.log('🌐 API模拟服务已加载，全局对象: window.apiMock');
