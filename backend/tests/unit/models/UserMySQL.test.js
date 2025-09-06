/**
 * UserMySQL模型单元测试
 */

const UserMySQL = require('../../../models/UserMySQL');
const bcrypt = require('bcryptjs');

// 模拟数据库连接池
jest.mock('../../../config/database', () => ({
    pool: {
        execute: jest.fn()
    }
}));

const { pool } = require('../../../config/database');

describe('UserMySQL Model', () => {
    // 每个测试前重置模拟
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('findByEmail', () => {
        it('应该返回null当用户不存在时', async () => {
            // 模拟数据库返回空结果
            pool.execute.mockResolvedValue([[], []]);

            const result = await UserMySQL.findByEmail('nonexistent@example.com');
            
            expect(result).toBeNull();
            expect(pool.execute).toHaveBeenCalledWith(
                'SELECT * FROM users WHERE email = ?',
                ['nonexistent@example.com']
            );
        });

        it('应该返回用户对象当用户存在时', async () => {
            // 模拟数据库返回用户
            const mockUser = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                password_hash: 'hashedpassword',
                trc20_wallet: 'wallet123',
                is_active: 1,
                created_at: new Date(),
                updated_at: new Date(),
                last_login: new Date()
            };
            
            pool.execute.mockResolvedValue([[mockUser], []]);

            const result = await UserMySQL.findByEmail('test@example.com');
            
            expect(result).not.toBeNull();
            expect(result.id).toBe(1);
            expect(result.username).toBe('testuser');
            expect(result.email).toBe('test@example.com');
            expect(pool.execute).toHaveBeenCalledWith(
                'SELECT * FROM users WHERE email = ?',
                ['test@example.com']
            );
        });

        it('应该处理数据库错误', async () => {
            // 模拟数据库错误
            pool.execute.mockRejectedValue(new Error('数据库错误'));

            await expect(UserMySQL.findByEmail('test@example.com'))
                .rejects
                .toThrow('数据库错误');
        });
    });

    describe('validatePassword', () => {
        it('应该在密码匹配时返回true', async () => {
            // 模拟bcrypt.compare
            const originalBcryptCompare = bcrypt.compare;
            bcrypt.compare = jest.fn().mockResolvedValue(true);

            const user = UserMySQL.mapUserData({
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                password_hash: 'hashedpassword'
            });

            const result = await user.validatePassword('correctpassword');
            
            expect(result).toBe(true);
            expect(bcrypt.compare).toHaveBeenCalledWith('correctpassword', 'hashedpassword');
            
            // 恢复原始函数
            bcrypt.compare = originalBcryptCompare;
        });

        it('应该在密码不匹配时返回false', async () => {
            // 模拟bcrypt.compare
            const originalBcryptCompare = bcrypt.compare;
            bcrypt.compare = jest.fn().mockResolvedValue(false);

            const user = UserMySQL.mapUserData({
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                password_hash: 'hashedpassword'
            });

            const result = await user.validatePassword('wrongpassword');
            
            expect(result).toBe(false);
            expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
            
            // 恢复原始函数
            bcrypt.compare = originalBcryptCompare;
        });
    });

    describe('create', () => {
        it('应该创建新用户并返回用户对象', async () => {
            // 模拟bcrypt.hash
            const originalBcryptHash = bcrypt.hash;
            bcrypt.hash = jest.fn().mockResolvedValue('hashedpassword');
            
            // 模拟数据库插入
            pool.execute.mockResolvedValueOnce([{ insertId: 1 }, []]);
            
            // 模拟findById
            const mockFindById = jest.spyOn(UserMySQL, 'findById').mockResolvedValue({
                id: 1,
                username: 'newuser',
                email: 'new@example.com',
                toJSON: () => ({
                    id: 1,
                    username: 'newuser',
                    email: 'new@example.com'
                })
            });

            const result = await UserMySQL.create('newuser', 'new@example.com', 'password123');
            
            expect(result).not.toBeNull();
            expect(result.id).toBe(1);
            expect(result.username).toBe('newuser');
            expect(result.email).toBe('new@example.com');
            
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(pool.execute).toHaveBeenCalledWith(
                'INSERT INTO users (username, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
                ['newuser', 'new@example.com', 'hashedpassword']
            );
            expect(mockFindById).toHaveBeenCalledWith(1);
            
            // 恢复原始函数
            bcrypt.hash = originalBcryptHash;
            mockFindById.mockRestore();
        });
    });

    // 可以添加更多测试用例...
});
