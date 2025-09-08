/**
 * 挑战超时服务 - 管理端路由集成测试
 */

const request = require('supertest');
const express = require('express');

// Mock 管理员鉴权，避免依赖数据库
jest.mock('../../middleware/authMiddleware', () => ({
    authenticateToken: (req, res, next) => { req.user = { id: 1 }; next(); },
    requireAdmin: (req, res, next) => next()
}));

// 固定特性开关为开启，设置较短的默认间隔（避免长时间等待）
jest.mock('../../config/featureFlags', () => ({
    isRedisEnabled: () => false,
    normalizeBoolean: (v) => Boolean(v),
    isChallengeTimeoutEnabled: () => true,
    getChallengeTimeoutIntervalMs: () => 60000
}));

const adminChallengeTimeoutRoutes = require('../../routes/adminChallengeTimeoutRoutes');
const challengeTimeoutService = require('../../services/challengeTimeoutService');

// 创建最小化测试应用
function createTestApp() {
    const app = express();
    app.use(express.json());
    app.use('/api/admin/challenge-timeout', adminChallengeTimeoutRoutes);
    return app;
}

describe('Admin ChallengeTimeout Routes', () => {
    const app = createTestApp();

    afterAll(() => {
        try { challengeTimeoutService.stop(); } catch (_) {}
    });

    test('GET /status 返回状态对象', async () => {
        const res = await request(app).get('/api/admin/challenge-timeout/status');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('isRunning');
        expect(res.body.data).toHaveProperty('checkInterval');
    });

    test('POST /start 可启动服务（幂等）', async () => {
        const res1 = await request(app).post('/api/admin/challenge-timeout/start');
        expect(res1.statusCode).toBe(200);
        expect(res1.body).toHaveProperty('success', true);
        expect(res1.body.data).toHaveProperty('isRunning', true);

        const res2 = await request(app).post('/api/admin/challenge-timeout/start');
        expect(res2.statusCode).toBe(200);
        expect(res2.body).toHaveProperty('success', true);
        expect(res2.body.data).toHaveProperty('isRunning', true);
    });

    test('POST /run-once 可手动执行一次检查', async () => {
        const res = await request(app).post('/api/admin/challenge-timeout/run-once');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
    });

    test('POST /config 拒绝非法 intervalMs', async () => {
        const res = await request(app)
            .post('/api/admin/challenge-timeout/config')
            .send({ intervalMs: 0 });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('success', false);
    });

    test('POST /config 接受合法 intervalMs 并更新', async () => {
        const res = await request(app)
            .post('/api/admin/challenge-timeout/config')
            .send({ intervalMs: 1500 });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('checkInterval', 1500);
    });

    test('POST /stop 可停止服务（幂等）', async () => {
        const res1 = await request(app).post('/api/admin/challenge-timeout/stop');
        expect(res1.statusCode).toBe(200);
        expect(res1.body).toHaveProperty('success', true);
        expect(res1.body.data).toHaveProperty('isRunning', false);

        const res2 = await request(app).post('/api/admin/challenge-timeout/stop');
        expect(res2.statusCode).toBe(200);
        expect(res2.body).toHaveProperty('success', true);
        expect(res2.body.data).toHaveProperty('isRunning', false);
    });
});


