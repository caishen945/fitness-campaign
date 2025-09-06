/**
 * userService 单元测试
 */

const userService = require('../../../services/userService');
const UserMySQL = require('../../../models/UserMySQL');
const { pool } = require('../../../config/database');

// Mock依赖
jest.mock('../../../models/UserMySQL');
jest.mock('../../../config/database', () => ({
    pool: {
        execute: jest.fn()
    }
}));

describe('userService', () => {
    let mockUser;
    
    beforeEach(() => {
        jest.clearAllMocks();
        
        // 明确重置pool.execute的mock
        pool.execute.mockReset();
        
        // 创建模拟用户对象
        mockUser = {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            password: 'hashedPassword123',
            trc20Wallet: 'TRC20_WALLET_ADDRESS',
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01'),
            toJSON: jest.fn().mockReturnValue({
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                trc20Wallet: 'TRC20_WALLET_ADDRESS',
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: '2025-01-01T00:00:00.000Z'
            }),
            validatePassword: jest.fn()
        };
        
        // Mock UserMySQL的静态方法
        UserMySQL.findByEmail = jest.fn();
        UserMySQL.findById = jest.fn();
        UserMySQL.create = jest.fn();
    });

    describe('findByEmail', () => {
        test('应该成功查找用户', async () => {
            UserMySQL.findByEmail.mockResolvedValue(mockUser);
            
            const result = await userService.findByEmail('test@example.com');
            
            expect(UserMySQL.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(result).toBe(mockUser);
        });

        test('应该处理用户不存在的情况', async () => {
            UserMySQL.findByEmail.mockResolvedValue(null);
            
            const result = await userService.findByEmail('nonexistent@example.com');
            
            expect(UserMySQL.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
            expect(result).toBeNull();
        });

        test('应该处理数据库错误', async () => {
            const dbError = new Error('数据库连接失败');
            UserMySQL.findByEmail.mockRejectedValue(dbError);
            
            await expect(userService.findByEmail('test@example.com')).rejects.toThrow('数据库连接失败');
        });
    });

    describe('findById', () => {
        test('应该成功查找用户', async () => {
            UserMySQL.findById.mockResolvedValue(mockUser);
            
            const result = await userService.findById(1);
            
            expect(UserMySQL.findById).toHaveBeenCalledWith(1);
            expect(result).toBe(mockUser);
        });

        test('应该处理用户不存在的情况', async () => {
            UserMySQL.findById.mockResolvedValue(null);
            
            const result = await userService.findById(999);
            
            expect(UserMySQL.findById).toHaveBeenCalledWith(999);
            expect(result).toBeNull();
        });

        test('应该处理数据库错误', async () => {
            const dbError = new Error('数据库连接失败');
            UserMySQL.findById.mockRejectedValue(dbError);
            
            await expect(userService.findById(1)).rejects.toThrow('数据库连接失败');
        });
    });

    describe('createUser', () => {
        test('应该成功创建用户', async () => {
            const newUserData = {
                username: 'newuser',
                email: 'new@example.com',
                password: 'password123'
            };
            
            UserMySQL.create.mockResolvedValue(mockUser);
            
            const result = await userService.createUser(
                newUserData.username,
                newUserData.email,
                newUserData.password
            );
            
            expect(UserMySQL.create).toHaveBeenCalledWith(
                newUserData.username,
                newUserData.email,
                newUserData.password
            );
            expect(result).toBe(mockUser);
        });

        test('应该处理创建失败的情况', async () => {
            const createError = new Error('创建用户失败');
            UserMySQL.create.mockRejectedValue(createError);
            
            await expect(userService.createUser('user', 'email', 'pass')).rejects.toThrow('创建用户失败');
        });
    });

    describe('updateLastLogin', () => {
        test('应该成功更新最后登录时间', async () => {
            pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
            
            await userService.updateLastLogin(1);
            
            expect(pool.execute).toHaveBeenCalledWith(
                'UPDATE users SET last_login = NOW() WHERE id = ?',
                [1]
            );
        });

        test('应该处理更新失败的情况', async () => {
            const updateError = new Error('更新失败');
            pool.execute.mockRejectedValueOnce(updateError);
            
            await expect(userService.updateLastLogin(1)).rejects.toThrow('更新失败');
        });

        test('应该处理没有行被影响的情况', async () => {
            pool.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);
            
            await expect(userService.updateLastLogin(999)).rejects.toThrow('用户不存在');
            
            expect(pool.execute).toHaveBeenCalledWith(
                'UPDATE users SET last_login = NOW() WHERE id = ?',
                [999]
            );
        });
    });

    describe('updateUserWallet', () => {
        test('应该成功更新用户钱包地址', async () => {
            const walletAddress = 'NEW_TRC20_WALLET_ADDRESS';
            const updatedUser = { ...mockUser, trc20Wallet: walletAddress };
            
            pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
            UserMySQL.findById.mockResolvedValue(updatedUser);
            
            const result = await userService.updateUserWallet(1, walletAddress);
            
            expect(pool.execute).toHaveBeenCalledWith(
                'UPDATE users SET trc20_wallet = ?, updated_at = NOW() WHERE id = ?',
                [walletAddress, 1]
            );
            expect(UserMySQL.findById).toHaveBeenCalledWith(1);
            expect(result).toBe(updatedUser);
        });

        test('应该处理更新失败的情况', async () => {
            const updateError = new Error('更新失败');
            // 先mock findById成功，然后mock execute失败
            UserMySQL.findById.mockResolvedValue(mockUser);
            pool.execute.mockRejectedValueOnce(updateError);
            
            await expect(userService.updateUserWallet(1, 'wallet')).rejects.toThrow('更新失败');
        });

        test('应该处理用户不存在的情况', async () => {
            pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
            UserMySQL.findById.mockResolvedValue(null);
            
            await expect(userService.updateUserWallet(999, 'wallet')).rejects.toThrow('用户不存在');
        });
    });

    describe('validateUserCredentials', () => {
        test('应该成功验证有效凭据', async () => {
            UserMySQL.findByEmail.mockResolvedValue(mockUser);
            mockUser.validatePassword.mockResolvedValue(true);
            
            const result = await userService.validateUserCredentials('test@example.com', 'password123');
            
            expect(UserMySQL.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(mockUser.validatePassword).toHaveBeenCalledWith('password123');
            expect(result).toBe(mockUser);
        });

        test('应该拒绝无效的邮箱', async () => {
            UserMySQL.findByEmail.mockResolvedValue(null);
            
            await expect(userService.validateUserCredentials('invalid@example.com', 'password123'))
                .rejects.toThrow('邮箱或密码错误');
        });

        test('应该拒绝无效的密码', async () => {
            UserMySQL.findByEmail.mockResolvedValue(mockUser);
            mockUser.validatePassword.mockResolvedValue(false);
            
            await expect(userService.validateUserCredentials('test@example.com', 'wrongpassword'))
                .rejects.toThrow('邮箱或密码错误');
        });

        test('应该处理验证过程中的错误', async () => {
            const validationError = new Error('验证失败');
            UserMySQL.findByEmail.mockRejectedValue(validationError);
            
            await expect(userService.validateUserCredentials('test@example.com', 'password123'))
                .rejects.toThrow('验证失败');
        });
    });

    describe('getUserProfile', () => {
        test('应该成功获取用户资料', async () => {
            UserMySQL.findById.mockResolvedValue(mockUser);
            
            const result = await userService.getUserProfile(1);
            
            expect(UserMySQL.findById).toHaveBeenCalledWith(1);
            expect(result).toBe(mockUser);
        });

        test('应该处理用户不存在的情况', async () => {
            UserMySQL.findById.mockResolvedValue(null);
            
            await expect(userService.getUserProfile(999)).rejects.toThrow('用户不存在');
        });

        test('应该处理获取用户资料失败的情况', async () => {
            const getError = new Error('获取用户资料失败');
            UserMySQL.findById.mockRejectedValue(getError);
            
            await expect(userService.getUserProfile(1)).rejects.toThrow('获取用户资料失败');
        });
    });

    describe('searchUsers', () => {
        beforeEach(() => {
            // 为每个测试单独重置mock
            pool.execute.mockReset();
        });

        test('应该成功搜索用户', async () => {
            const mockUsers = [mockUser];
            const searchQuery = 'test';
            const limit = 10;
            const offset = 0;
            
            // 确保mock返回正确的格式
            pool.execute.mockResolvedValueOnce([mockUsers]);
            
            const result = await userService.searchUsers(searchQuery, limit, offset);
            
            expect(pool.execute).toHaveBeenCalledWith(
                'SELECT * FROM users WHERE username LIKE ? OR email LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
                [`%${searchQuery}%`, `%${searchQuery}%`, limit, offset]
            );
            expect(result).toEqual(mockUsers);
        });

        test('应该处理搜索失败的情况', async () => {
            const searchError = new Error('搜索失败');
            // 确保mock正确设置
            pool.execute.mockRejectedValueOnce(searchError);
            
            await expect(userService.searchUsers('test')).rejects.toThrow('搜索失败');
        });

        test('应该使用默认的搜索参数', async () => {
            const mockUsers = [mockUser];
            pool.execute.mockResolvedValueOnce([mockUsers]);
            
            await userService.searchUsers('test');
            
            expect(pool.execute).toHaveBeenCalledWith(
                'SELECT * FROM users WHERE username LIKE ? OR email LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
                ['%test%', '%test%', 20, 0]
            );
        });
    });

    describe('getUserStats', () => {
        beforeEach(() => {
            // 为每个测试单独重置mock
            pool.execute.mockReset();
        });

        test('应该成功获取用户统计信息', async () => {
            const mockStats = {
                totalUsers: 100,
                activeUsers: 80,
                newUsersThisMonth: 20
            };
            
            // 确保mock返回正确的格式
            pool.execute.mockResolvedValueOnce([[{ count: 100 }]]);
            pool.execute.mockResolvedValueOnce([[{ count: 80 }]]);
            pool.execute.mockResolvedValueOnce([[{ count: 20 }]]);
            
            const result = await userService.getUserStats();
            
            expect(pool.execute).toHaveBeenCalledTimes(3);
            expect(result).toEqual(mockStats);
        });

        test('应该处理获取统计信息失败的情况', async () => {
            const statsError = new Error('获取统计信息失败');
            pool.execute.mockRejectedValueOnce(statsError);
            
            await expect(userService.getUserStats()).rejects.toThrow('获取统计信息失败');
        });
    });
});
