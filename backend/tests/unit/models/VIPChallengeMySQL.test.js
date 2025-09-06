/**
 * VIPChallengeMySQL 模型单元测试
 */

const VIPChallengeMySQL = require('../../../models/VIPChallengeMySQL');
const { pool } = require('../../../config/database');

// Mock数据库连接
jest.mock('../../../config/database', () => ({
    pool: {
        execute: jest.fn()
    }
}));

describe('VIPChallengeMySQL Model', () => {
    let mockChallenge;
    
    beforeEach(() => {
        // 重置所有mock
        jest.clearAllMocks();
        
        // 创建测试数据
        mockChallenge = new VIPChallengeMySQL({
            id: 1,
            userId: 1,
            vipLevelId: 1,
            challengeType: 'daily',
            stepTarget: 10000,
            currentSteps: 5000,
            startDate: new Date('2025-08-25'),
            endDate: new Date('2025-08-26'), // 使用未来的日期
            status: 'active',
            depositAmount: 10.0,
            rewardAmount: 15.0,
            requiredConsecutiveDays: 7,
            currentConsecutiveDays: 3,
            failedDays: 1,
            maxFailedDays: 3,
            dailyReward: 1.0,
            finalReward: 5.0,
            partialRefundRatio: 0.8
        });
    });

    describe('构造函数', () => {
        test('应该使用默认值创建实例', () => {
            const challenge = new VIPChallengeMySQL();
            
            expect(challenge.id).toBeNull();
            expect(challenge.userId).toBeNull();
            expect(challenge.vipLevelId).toBeNull();
            expect(challenge.challengeType).toBe('daily');
            expect(challenge.stepTarget).toBe(0);
            expect(challenge.currentSteps).toBe(0);
            expect(challenge.status).toBe('active');
            expect(challenge.depositAmount).toBe(0);
            expect(challenge.rewardAmount).toBe(0);
            expect(challenge.requiredConsecutiveDays).toBe(1);
            expect(challenge.currentConsecutiveDays).toBe(0);
            expect(challenge.failedDays).toBe(0);
            expect(challenge.maxFailedDays).toBe(3);
            expect(challenge.dailyReward).toBe(0);
            expect(challenge.finalReward).toBe(0);
            expect(challenge.partialRefundRatio).toBe(0.8);
        });

        test('应该使用提供的数据创建实例', () => {
            expect(mockChallenge.id).toBe(1);
            expect(mockChallenge.userId).toBe(1);
            expect(mockChallenge.vipLevelId).toBe(1);
            expect(mockChallenge.challengeType).toBe('daily');
            expect(mockChallenge.stepTarget).toBe(10000);
            expect(mockChallenge.currentSteps).toBe(5000);
            expect(mockChallenge.status).toBe('active');
            expect(mockChallenge.depositAmount).toBe(10.0);
            expect(mockChallenge.rewardAmount).toBe(15.0);
        });

        test('应该处理snake_case属性名', () => {
            const challenge = new VIPChallengeMySQL({
                user_id: 2,
                vip_level_id: 2,
                challenge_type: 'weekly',
                step_target: 20000
            });
            
            expect(challenge.userId).toBe(2);
            expect(challenge.vipLevelId).toBe(2);
            expect(challenge.challengeType).toBe('weekly');
            expect(challenge.stepTarget).toBe(20000);
        });
    });

    describe('fromDatabase', () => {
        test('应该从数据库行创建VIPChallenge对象', () => {
            const dbRow = {
                id: 1,
                user_id: 1,
                vip_level_id: 1,
                challenge_type: 'daily',
                step_target: 10000,
                current_steps: 5000,
                start_date: '2025-01-01T00:00:00.000Z',
                end_date: '2025-01-02T00:00:00.000Z',
                status: 'active',
                deposit_amount: 10.0,
                reward_amount: 15.0,
                created_at: '2025-01-01T00:00:00.000Z',
                updated_at: '2025-01-01T00:00:00.000Z'
            };
            
            const challenge = VIPChallengeMySQL.fromDatabase(dbRow);
            
            expect(challenge.id).toBe(1);
            expect(challenge.userId).toBe(1);
            expect(challenge.vipLevelId).toBe(1);
            expect(challenge.challengeType).toBe('daily');
            expect(challenge.stepTarget).toBe(10000);
            expect(challenge.currentSteps).toBe(5000);
            expect(challenge.status).toBe('active');
            expect(challenge.depositAmount).toBe(10.0);
            expect(challenge.rewardAmount).toBe(15.0);
        });
    });

    describe('validate', () => {
        test('应该验证有效的VIPChallenge数据', () => {
            const errors = mockChallenge.validate();
            expect(errors).toHaveLength(0);
        });

        test('应该检测无效的VIPChallenge数据', () => {
            const invalidChallenge = new VIPChallengeMySQL({
                userId: null,
                vipLevelId: null,
                stepTarget: -1000,
                depositAmount: -10
            });
            
            const errors = invalidChallenge.validate();
            
            expect(errors).toContain('用户ID不能为空');
            expect(errors).toContain('VIP等级ID不能为空');
            expect(errors).toContain('步数目标必须大于0');
            expect(errors).toContain('押金金额必须大于0');
        });
    });

    describe('状态检查方法', () => {
        test('isActive应该正确判断挑战状态', () => {
            expect(mockChallenge.isActive()).toBe(true);
            
            // 测试已过期的挑战
            const expiredChallenge = new VIPChallengeMySQL({
                ...mockChallenge,
                endDate: new Date('2024-01-01')
            });
            expect(expiredChallenge.isActive()).toBe(false);
            
            // 测试非活跃状态的挑战
            const completedChallenge = new VIPChallengeMySQL({
                ...mockChallenge,
                status: 'completed'
            });
            expect(completedChallenge.isActive()).toBe(false);
        });

        test('isCompleted应该正确判断完成状态', () => {
            expect(mockChallenge.isCompleted()).toBe(false);
            
            const completedChallenge = new VIPChallengeMySQL({
                ...mockChallenge,
                status: 'completed'
            });
            expect(completedChallenge.isCompleted()).toBe(true);
        });

        test('isFailed应该正确判断失败状态', () => {
            expect(mockChallenge.isFailed()).toBe(false);
            
            const failedChallenge = new VIPChallengeMySQL({
                ...mockChallenge,
                status: 'failed'
            });
            expect(failedChallenge.isFailed()).toBe(true);
        });
    });

    describe('进度计算', () => {
        test('getProgress应该正确计算进度百分比', () => {
            expect(mockChallenge.getProgress()).toBe(50); // 5000/10000 * 100
            
            const completedChallenge = new VIPChallengeMySQL({
                ...mockChallenge,
                currentSteps: 10000
            });
            expect(completedChallenge.getProgress()).toBe(100);
            
            const overCompletedChallenge = new VIPChallengeMySQL({
                ...mockChallenge,
                currentSteps: 15000
            });
            expect(overCompletedChallenge.getProgress()).toBe(100); // 不超过100%
        });

        test('getRemainingSteps应该正确计算剩余步数', () => {
            expect(mockChallenge.getRemainingSteps()).toBe(5000);
            
            const completedChallenge = new VIPChallengeMySQL({
                ...mockChallenge,
                currentSteps: 10000
            });
            expect(completedChallenge.getRemainingSteps()).toBe(0);
        });

        test('getRemainingTime应该正确计算剩余时间', () => {
            const now = new Date('2025-08-25T12:00:00.000Z');
            const end = new Date('2025-08-26T00:00:00.000Z');
            const expectedRemaining = end.getTime() - now.getTime();
            
            const challenge = new VIPChallengeMySQL({
                ...mockChallenge,
                endDate: end
            });
            
            // 使用jest.spyOn来mock Date构造函数
            const originalDate = global.Date;
            global.Date = jest.fn((...args) => {
                if (args.length === 0) {
                    return now;
                }
                return new originalDate(...args);
            });
            global.Date.now = originalDate.now;
            
            const remainingTime = challenge.getRemainingTime();
            // 允许1秒的误差
            expect(Math.abs(remainingTime - expectedRemaining)).toBeLessThan(1000);
            
            // 恢复原始方法
            global.Date = originalDate;
        });
    });

    describe('状态更新方法', () => {
        test('updateSteps应该正确更新步数', () => {
            const originalSteps = mockChallenge.currentSteps;
            const newSteps = 7500;
            
            mockChallenge.updateSteps(newSteps);
            
            expect(mockChallenge.currentSteps).toBe(newSteps);
            expect(mockChallenge.updatedAt).not.toBe(mockChallenge.createdAt);
        });

        test('completeChallenge应该正确完成挑战', () => {
            mockChallenge.completeChallenge();
            
            expect(mockChallenge.status).toBe('completed');
            expect(mockChallenge.completedAt).toBeInstanceOf(Date);
            expect(mockChallenge.updatedAt).toBeInstanceOf(Date);
        });

        test('failChallenge应该正确标记失败', () => {
            mockChallenge.failChallenge();
            
            expect(mockChallenge.status).toBe('failed');
            expect(mockChallenge.updatedAt).toBeInstanceOf(Date);
        });

        test('cancelChallenge应该正确取消挑战', () => {
            mockChallenge.cancelChallenge();
            
            expect(mockChallenge.status).toBe('cancelled');
            expect(mockChallenge.updatedAt).toBeInstanceOf(Date);
        });
    });

    describe('统计信息', () => {
        test('getStats应该返回正确的统计信息', () => {
            const stats = mockChallenge.getStats();
            
            expect(stats.progress).toBe(50);
            expect(stats.remainingSteps).toBe(5000);
            expect(stats.isActive).toBe(true);
            expect(stats.isCompleted).toBe(false);
            expect(stats.isFailed).toBe(false);
            expect(stats.isCancelled).toBe(false);
            expect(stats.duration).toBe(1); // 1天
        });

        test('getDisplayInfo应该返回正确的显示信息', () => {
            const displayInfo = mockChallenge.getDisplayInfo();
            
            expect(displayInfo.id).toBe(1);
            expect(displayInfo.challengeType).toBe('daily');
            expect(displayInfo.stepTarget).toBe(10000);
            expect(displayInfo.currentSteps).toBe(5000);
            expect(displayInfo.progress).toBe(50);
            expect(displayInfo.status).toBe('active');
            expect(displayInfo.depositAmount).toBe(10.0);
            expect(displayInfo.rewardAmount).toBe(15.0);
            expect(displayInfo.potentialProfit).toBe(5.0); // 15 - 10
            expect(displayInfo.roi).toBe('50.00%'); // (15-10)/10 * 100
        });
    });

    describe('数据库操作', () => {
        test('save应该正确处理新记录的创建', async () => {
            const newChallenge = new VIPChallengeMySQL({
                userId: 1,
                vipLevelId: 1,
                stepTarget: 10000,
                depositAmount: 10.0,
                rewardAmount: 15.0
            });
            
            pool.execute.mockResolvedValueOnce([{ insertId: 123 }]);
            
            await newChallenge.save();
            
            expect(pool.execute).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO vip_challenges'),
                expect.arrayContaining([1, 1, 'daily', 10000, 0, expect.any(Date), null, 'active', 10.0, 15.0, null])
            );
            expect(newChallenge.id).toBe(123);
        });

        test('save应该正确处理现有记录的更新', async () => {
            pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
            
            await mockChallenge.save();
            
            expect(pool.execute).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE vip_challenges'),
                expect.arrayContaining([1, 1, 'daily', 10000, 5000, expect.any(Date), expect.any(Date), 'active', 10.0, 15.0, null, 1])
            );
        });

        test('findById应该正确查找挑战', async () => {
            const mockRow = {
                id: 1,
                user_id: 1,
                vip_level_id: 1,
                challenge_type: 'daily',
                step_target: 10000,
                current_steps: 5000,
                status: 'active',
                deposit_amount: 10.0,
                reward_amount: 15.0
            };
            
            pool.execute.mockResolvedValueOnce([[mockRow]]);
            
            const result = await VIPChallengeMySQL.findById(1);
            
            expect(pool.execute).toHaveBeenCalledWith(
                'SELECT * FROM vip_challenges WHERE id = ?',
                [1]
            );
            expect(result).toBeInstanceOf(VIPChallengeMySQL);
            expect(result.id).toBe(1);
        });

        test('findActiveByUserId应该正确查找用户活跃挑战', async () => {
            const mockRow = {
                id: 1,
                user_id: 1,
                vip_level_id: 1,
                challenge_type: 'daily',
                step_target: 10000,
                current_steps: 5000,
                status: 'active'
            };
            
            pool.execute.mockResolvedValueOnce([[mockRow]]);
            
            const result = await VIPChallengeMySQL.findActiveByUserId(1);
            
            expect(pool.execute).toHaveBeenCalledWith(
                'SELECT * FROM vip_challenges WHERE user_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1',
                [1, 'active']
            );
            expect(result).toBeInstanceOf(VIPChallengeMySQL);
            expect(result.userId).toBe(1);
        });

        test('findByUserId应该正确查找用户挑战列表', async () => {
            const mockRows = [
                { id: 1, user_id: 1, status: 'active' },
                { id: 2, user_id: 1, status: 'completed' }
            ];
            
            pool.execute.mockResolvedValueOnce([mockRows]);
            
            const results = await VIPChallengeMySQL.findByUserId(1, { status: 'active' });
            
            expect(pool.execute).toHaveBeenCalledWith(
                'SELECT * FROM vip_challenges WHERE user_id = ? AND status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
                [1, 'active', 20, 0]
            );
            expect(results).toHaveLength(2);
            expect(results[0]).toBeInstanceOf(VIPChallengeMySQL);
        });

        test('countByUserId应该正确统计用户挑战数量', async () => {
            pool.execute.mockResolvedValueOnce([[{ count: 5 }]]);
            
            const count = await VIPChallengeMySQL.countByUserId(1);
            
            expect(pool.execute).toHaveBeenCalledWith(
                'SELECT COUNT(*) as count FROM vip_challenges WHERE user_id = ?',
                [1]
            );
            expect(count).toBe(5);
        });
    });

    describe('createChallenge', () => {
        test('应该正确创建每日挑战', () => {
            const vipLevel = { id: 1, stepTarget: 10000, depositAmount: 10.0, rewardAmount: 15.0 };
            const challenge = VIPChallengeMySQL.createChallenge(1, vipLevel, 'daily');
            
            expect(challenge.userId).toBe(1);
            expect(challenge.vipLevelId).toBe(1);
            expect(challenge.challengeType).toBe('daily');
            expect(challenge.stepTarget).toBe(10000);
            expect(challenge.depositAmount).toBe(10.0);
            expect(challenge.rewardAmount).toBe(15.0);
            expect(challenge.status).toBe('active');
            expect(challenge.startDate).toBeInstanceOf(Date);
            expect(challenge.endDate).toBeInstanceOf(Date);
            
            // 验证结束时间是开始时间后24小时
            const timeDiff = challenge.endDate.getTime() - challenge.startDate.getTime();
            expect(timeDiff).toBe(24 * 60 * 60 * 1000);
        });

        test('应该正确创建每周挑战', () => {
            const vipLevel = { id: 1, stepTarget: 50000, depositAmount: 50.0, rewardAmount: 75.0 };
            const challenge = VIPChallengeMySQL.createChallenge(1, vipLevel, 'weekly');
            
            expect(challenge.challengeType).toBe('weekly');
            expect(challenge.stepTarget).toBe(50000);
            expect(challenge.depositAmount).toBe(50.0);
            expect(challenge.rewardAmount).toBe(75.0);
            
            // 验证结束时间是开始时间后7天
            const timeDiff = challenge.endDate.getTime() - challenge.startDate.getTime();
            expect(timeDiff).toBe(7 * 24 * 60 * 60 * 1000);
        });

        test('应该正确创建每月挑战', () => {
            const vipLevel = { id: 1, stepTarget: 200000, depositAmount: 200.0, rewardAmount: 300.0 };
            const challenge = VIPChallengeMySQL.createChallenge(1, vipLevel, 'monthly');
            
            expect(challenge.challengeType).toBe('monthly');
            expect(challenge.stepTarget).toBe(200000);
            expect(challenge.depositAmount).toBe(200.0);
            expect(challenge.rewardAmount).toBe(300.0);
            
            // 验证结束时间是开始时间后30天
            const timeDiff = challenge.endDate.getTime() - challenge.startDate.getTime();
            expect(timeDiff).toBe(30 * 24 * 60 * 60 * 1000);
        });
    });

    describe('错误处理', () => {
        test('save应该正确处理数据库错误', async () => {
            const dbError = new Error('数据库连接失败');
            pool.execute.mockRejectedValueOnce(dbError);
            
            await expect(mockChallenge.save()).rejects.toThrow('数据库连接失败');
        });

        test('findById应该正确处理数据库错误', async () => {
            const dbError = new Error('查询失败');
            pool.execute.mockRejectedValueOnce(dbError);
            
            await expect(VIPChallengeMySQL.findById(1)).rejects.toThrow('查询失败');
        });

        test('findActiveByUserId应该正确处理数据库错误', async () => {
            const dbError = new Error('查询失败');
            pool.execute.mockRejectedValueOnce(dbError);
            
            await expect(VIPChallengeMySQL.findActiveByUserId(1)).rejects.toThrow('查询失败');
        });
    });
});
