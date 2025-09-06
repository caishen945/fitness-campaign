/**
 * 用户认证集成测试
 */

const request = require('supertest');
const app = require('../mocks/server'); // 使用测试专用的服务器模拟
const { pool } = require('../../config/database');

// 模拟userService
jest.mock('../../services/userService', () => ({
    findByEmail: jest.fn(),
    createUser: jest.fn(),
    findById: jest.fn(),
    updateLastLogin: jest.fn()
}));

const userService = require('../../services/userService');

describe('认证API', () => {
    // 测试用户数据
    const testUser = {
        id: 1,
        email: 'integration_test@example.com',
        password: 'TestPassword123!',
        username: 'integration_test_user',
        toJSON: () => ({
            id: 1,
            email: 'integration_test@example.com',
            username: 'integration_test_user'
        }),
        validatePassword: jest.fn()
    };
    
    // 在每个测试前重置模拟
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    describe('POST /api/auth/register', () => {
        it('应该成功注册新用户', async () => {
            const newUser = {
                email: 'new_test_user@example.com',
                password: 'NewPassword123!'
            };
            
            // 模拟userService.findByEmail返回null（用户不存在）
            userService.findByEmail.mockResolvedValue(null);
            
            // 模拟userService.createUser返回新用户
            const createdUser = {
                id: 2,
                email: newUser.email,
                username: 'new_test_user1234',
                toJSON: () => ({
                    id: 2,
                    email: newUser.email,
                    username: 'new_test_user1234'
                })
            };
            userService.createUser.mockResolvedValue(createdUser);
            
            const response = await request(app)
                .post('/api/auth/register')
                .send(newUser)
                .expect('Content-Type', /json/)
                .expect(201);
            
            expect(response.body).toHaveProperty('message', '注册成功');
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('email', newUser.email);
            
            // 验证userService.findByEmail和userService.createUser被调用
            expect(userService.findByEmail).toHaveBeenCalledWith(newUser.email);
            expect(userService.createUser).toHaveBeenCalled();
        });
        
        it('应该拒绝已存在的邮箱注册', async () => {
            // 模拟userService.findByEmail返回已存在的用户
            userService.findByEmail.mockResolvedValue(testUser);
            
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: testUser.email,
                    password: testUser.password
                })
                .expect('Content-Type', /json/)
                .expect(400);
            
            expect(response.body).toHaveProperty('error', '邮箱已被注册');
            expect(userService.findByEmail).toHaveBeenCalledWith(testUser.email);
            expect(userService.createUser).not.toHaveBeenCalled();
        });
        
        it('应该拒绝无效的邮箱格式', async () => {
            const invalidUser = {
                email: 'invalid-email',
                password: 'Password123!'
            };
            
            // 确保不调用findByEmail
            userService.findByEmail.mockImplementation(() => {
                throw new Error('不应该调用findByEmail');
            });
            
            const response = await request(app)
                .post('/api/auth/register')
                .send(invalidUser)
                .expect('Content-Type', /json/)
                .expect(400);
            
            expect(response.body).toHaveProperty('error', '邮箱格式不正确');
            expect(userService.findByEmail).not.toHaveBeenCalled();
            expect(userService.createUser).not.toHaveBeenCalled();
        });
    });
    
    describe('POST /api/auth/login', () => {
        it('应该成功登录并返回token', async () => {
            const loginData = {
                email: 'test@example.com',
                password: '123456'
            };
            
            // 模拟userService.findByEmail返回用户
            const user = {
                id: 3,
                email: loginData.email,
                username: 'testuser',
                validatePassword: jest.fn().mockResolvedValue(true),
                toJSON: () => ({
                    id: 3,
                    email: loginData.email,
                    username: 'testuser'
                })
            };
            userService.findByEmail.mockResolvedValue(user);
            userService.updateLastLogin.mockResolvedValue(user);
            
            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect('Content-Type', /json/)
                .expect(200);
            
            expect(response.body).toHaveProperty('message', '登录成功');
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('email', loginData.email);
            
            expect(userService.findByEmail).toHaveBeenCalledWith(loginData.email);
            expect(user.validatePassword).toHaveBeenCalledWith(loginData.password);
            expect(userService.updateLastLogin).toHaveBeenCalledWith(user.id);
        });
        
        it('应该拒绝错误的凭据', async () => {
            const wrongLoginData = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };
            
            // 模拟userService.findByEmail返回用户
            const user = {
                id: 3,
                email: wrongLoginData.email,
                username: 'testuser',
                validatePassword: jest.fn().mockResolvedValue(false),
                toJSON: () => ({
                    id: 3,
                    email: wrongLoginData.email,
                    username: 'testuser'
                })
            };
            userService.findByEmail.mockResolvedValue(user);
            
            const response = await request(app)
                .post('/api/auth/login')
                .send(wrongLoginData)
                .expect('Content-Type', /json/)
                .expect(400);
            
            expect(response.body).toHaveProperty('error', '邮箱或密码错误');
            expect(userService.findByEmail).toHaveBeenCalledWith(wrongLoginData.email);
            expect(user.validatePassword).toHaveBeenCalledWith(wrongLoginData.password);
            expect(userService.updateLastLogin).not.toHaveBeenCalled();
        });
        
        it('应该拒绝不存在的用户', async () => {
            const nonExistentUser = {
                email: 'nonexistent@example.com',
                password: 'password123'
            };
            
            // 模拟userService.findByEmail返回null（用户不存在）
            userService.findByEmail.mockResolvedValue(null);
            
            const response = await request(app)
                .post('/api/auth/login')
                .send(nonExistentUser)
                .expect('Content-Type', /json/)
                .expect(400);
            
            expect(response.body).toHaveProperty('error', '邮箱或密码错误');
            expect(userService.findByEmail).toHaveBeenCalledWith(nonExistentUser.email);
            expect(userService.updateLastLogin).not.toHaveBeenCalled();
        });
    });
    
    describe('GET /api/user/profile', () => {
        it('应该返回用户信息', async () => {
            // 模拟userService.findById返回用户
            const user = {
                id: 1,
                email: 'test@example.com',
                username: 'testuser',
                toJSON: () => ({
                    id: 1,
                    email: 'test@example.com',
                    username: 'testuser'
                })
            };
            userService.findById.mockResolvedValue(user);
            
            // 生成有效的JWT令牌
            const jwt = require('jsonwebtoken');
            const token = jwt.sign({ id: 1, username: 'testuser' }, 'test_secret_key', { expiresIn: '1h' });
            
            const response = await request(app)
                .get('/api/user/profile')
                .set('Authorization', `Bearer ${token}`)
                .expect('Content-Type', /json/)
                .expect(200);
            
            expect(response.body).toHaveProperty('id', 1);
            expect(response.body).toHaveProperty('email', 'test@example.com');
            expect(response.body).toHaveProperty('username', 'testuser');
            expect(userService.findById).toHaveBeenCalledWith(1);
        });
        
        it('应该拒绝无效的令牌', async () => {
            // 确保不调用findById
            userService.findById.mockImplementation(() => {
                throw new Error('不应该调用findById');
            });
            
            const response = await request(app)
                .get('/api/user/profile')
                .set('Authorization', 'Bearer invalid_token')
                .expect('Content-Type', /json/)
                .expect(403);
            
            expect(response.body).toHaveProperty('error', '令牌无效');
            expect(userService.findById).not.toHaveBeenCalled();
        });
        
        it('应该拒绝缺失的令牌', async () => {
            // 确保不调用findById
            userService.findById.mockImplementation(() => {
                throw new Error('不应该调用findById');
            });
            
            const response = await request(app)
                .get('/api/user/profile')
                .expect('Content-Type', /json/)
                .expect(401);
            
            expect(response.body).toHaveProperty('error', '访问令牌缺失');
            expect(userService.findById).not.toHaveBeenCalled();
        });
    });
});