const notificationService = require('../../../services/notificationService');

// 仅校验入队调用返回结构（需要 Redis 可用）
describe('notificationService.sendToUser', () => {
    it('should queue a notification job', async () => {
        const result = await notificationService.sendToUser(1, 'Test', 'Hello');
        expect(result).toHaveProperty('queued');
    });
});


