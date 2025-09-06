const mongoose = require('mongoose');

// VIP等级数据模型
const vipLevelSchema = new mongoose.Schema({
    level: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    duration_days: {
        type: Number,
        required: true,
        min: 1
    },
    benefits: {
        step_multiplier: {
            type: Number,
            default: 1.0,
            min: 1.0
        },
        reward_multiplier: {
            type: Number,
            default: 1.0,
            min: 1.0
        },
        daily_bonus: {
            type: Number,
            default: 0
        },
        exclusive_challenges: {
            type: Boolean,
            default: false
        },
        priority_support: {
            type: Boolean,
            default: false
        },
        custom_features: [String]
    },
    icon: {
        type: String,
        default: 'crown'
    },
    color: {
        type: String,
        default: '#FFD700'
    },
    is_active: {
        type: Boolean,
        default: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// 索引
vipLevelSchema.index({ level: 1 }, { unique: true });
vipLevelSchema.index({ is_active: 1 });
vipLevelSchema.index({ price: 1 });

// 虚拟字段
vipLevelSchema.virtual('formatted_price').get(function() {
    return `¥${this.price.toFixed(2)}`;
});

vipLevelSchema.virtual('duration_text').get(function() {
    if (this.duration_days === 30) return '1个月';
    if (this.duration_days === 90) return '3个月';
    if (this.duration_days === 365) return '1年';
    return `${this.duration_days}天`;
});

// 方法
vipLevelSchema.methods.calculateReward = function(baseReward) {
    return Math.floor(baseReward * this.benefits.reward_multiplier);
};

vipLevelSchema.methods.calculateSteps = function(baseSteps) {
    return Math.floor(baseSteps * this.benefits.step_multiplier);
};

// 静态方法
vipLevelSchema.statics.findActiveLevels = function() {
    return this.find({ is_active: true }).sort({ level: 1 });
};

vipLevelSchema.statics.findByLevel = function(level) {
    return this.findOne({ level: level, is_active: true });
};

vipLevelSchema.statics.getNextLevel = function(currentLevel) {
    return this.findOne({ 
        level: { $gt: currentLevel }, 
        is_active: true 
    }).sort({ level: 1 });
};

// 中间件
vipLevelSchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

module.exports = mongoose.model('VIPLevel', vipLevelSchema);
