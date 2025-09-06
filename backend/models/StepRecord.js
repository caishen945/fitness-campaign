class StepRecord {
    constructor(id, userId, recordDate, steps, source = 'manual') {
        this.id = id;
        this.userId = userId;
        this.recordDate = recordDate;
        this.steps = steps;
        this.source = source;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}

module.exports = StepRecord;