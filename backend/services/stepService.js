const StepRecord = require('../models/StepRecord');

class StepService {
    constructor() {
        this.stepRecords = [];
        this.nextId = 1;
    }

    createOrUpdateStepRecord(userId, recordDate, steps, source = 'manual') {
        let record = this.stepRecords.find(
            r => r.userId === userId && r.recordDate === recordDate
        );

        if (record) {
            record.steps = steps;
            record.updatedAt = new Date();
        } else {
            record = new StepRecord(this.nextId++, userId, recordDate, steps, source);
            this.stepRecords.push(record);
        }

        return record;
    }

    getStepHistory(userId, month, year) {
        return this.stepRecords.filter(record => {
            if (record.userId !== userId) return false;
            
            const recordDate = new Date(record.recordDate);
            return recordDate.getMonth() + 1 == month && recordDate.getFullYear() == year;
        });
    }

    getLeaderboard(date) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        // 获取指定日期的步数记录
        const dailyRecords = this.stepRecords.filter(
            record => record.recordDate === targetDate
        );

        // 汇总每个用户的步数
        const userSteps = {};
        dailyRecords.forEach(record => {
            if (!userSteps[record.userId]) {
                userSteps[record.userId] = 0;
            }
            userSteps[record.userId] += record.steps;
        });

        // 转换为数组并排序
        const leaderboard = Object.keys(userSteps).map(userId => ({
            userId: parseInt(userId),
            steps: userSteps[userId]
        })).sort((a, b) => b.steps - a.steps);

        return leaderboard;
    }
}

module.exports = new StepService();