/**
 * VIP等级MySQL数据模型
 * 替代原有的Mongoose模型，提供相同的API接口
 */

const { pool } = require('../config/database');

class VIPLevelMySQL {
    /**
     * 构造函数
     * @param {Object} data VIP等级数据
     */
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.description = data.description || '';
        this.depositAmount = parseFloat(data.depositAmount || data.deposit_amount || 0);
        this.stepTarget = parseInt(data.stepTarget || data.step_target || 0);
        this.rewardAmount = parseFloat(data.rewardAmount || data.reward_amount || 0);
        this.maxChallenges = parseInt(data.maxChallenges || data.max_challenges || 1);
        this.duration = parseInt(data.duration || 30); // 默认30天
        this.icon = data.icon || 'crown';
        this.color = data.color || '#FFD700';
        this.cancelDeductRatio = parseFloat(data.cancelDeductRatio || data.cancel_deduct_ratio || 0.1);
        this.cancelRewardRatio = parseFloat(data.cancelRewardRatio || data.cancel_reward_ratio || 0);
        this.isActive = data.isActive !== undefined ? data.isActive : (data.is_active !== undefined ? data.is_active : true);
        this.createdAt = data.createdAt || data.created_at || new Date();
        this.updatedAt = data.updatedAt || data.updated_at || new Date();
        
        // 新增字段的默认值
        this.partialRefundRatio = parseFloat(data.partialRefundRatio || data.partial_refund_ratio || 0.8);
        this.maxFailedDays = parseInt(data.maxFailedDays || data.max_failed_days || 3);
        this.requiredConsecutiveDays = parseInt(data.requiredConsecutiveDays || data.required_consecutive_days || 1);
        this.dailyReward = parseFloat(data.dailyReward || data.daily_reward || 0);
        this.finalReward = parseFloat(data.finalReward || data.final_reward || 0);
        
        // 虚拟属性
        this._formattedPrice = null;
        this._durationText = null;
    }

    /**
     * 从数据库行创建VIPLevel对象
     * @param {Object} row 数据库行数据
     * @returns {VIPLevelMySQL} VIPLevel实例
     */
    static fromDatabase(row) {
        return new VIPLevelMySQL({
            id: row.id,
            name: row.name,
            description: row.description,
            depositAmount: parseFloat(row.deposit_amount) || 0,
            stepTarget: parseInt(row.step_target) || 0,
            rewardAmount: parseFloat(row.reward_amount) || 0,
            maxChallenges: parseInt(row.max_challenges) || 1,
            duration: parseInt(row.duration) || 30,
            icon: row.icon,
            color: row.color,
            cancelDeductRatio: parseFloat(row.cancel_deduct_ratio) || 1.0,
            cancelRewardRatio: parseFloat(row.cancel_reward_ratio) || 0,
            isActive: row.is_active === 1,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            // 新增字段映射
            partialRefundRatio: parseFloat(row.partial_refund_ratio) || 0.8,
            maxFailedDays: parseInt(row.max_failed_days) || 3,
            requiredConsecutiveDays: parseInt(row.required_consecutive_days) || 1,
            dailyReward: parseFloat(row.daily_reward) || 0,
            finalReward: parseFloat(row.final_reward) || 0
        });
    }

    /**
     * 验证VIPLevel数据
     * @returns {Array} 错误信息数组，如果没有错误则为空数组
     */
    validate() {
        const errors = [];
        
        if (!this.name) {
            errors.push('等级名称不能为空');
        }
        
        if (this.depositAmount < 0) {
            errors.push('押金金额不能为负数');
        }
        
        if (this.stepTarget <= 0) {
            errors.push('步数目标必须大于0');
        }
        
        if (this.rewardAmount < 0) {
            errors.push('奖励金额不能为负数');
        }
        
        if (this.maxChallenges <= 0) {
            errors.push('最大挑战次数必须大于0');
        }
        
        if (this.duration <= 0) {
            errors.push('挑战持续时间必须大于0');
        }
        
        if (this.cancelDeductRatio < 0 || this.cancelDeductRatio > 1) {
            errors.push('取消扣除比例必须在0到1之间');
        }
        
        if (this.cancelRewardRatio < 0 || this.cancelRewardRatio > 1) {
            errors.push('取消奖励比例必须在0到1之间');
        }
        
        if (this.partialRefundRatio < 0 || this.partialRefundRatio > 1) {
            errors.push('部分退还比例必须在0到1之间');
        }
        
        if (this.maxFailedDays < 0) {
            errors.push('最大失败天数不能为负数');
        }
        
        if (this.requiredConsecutiveDays <= 0) {
            errors.push('连续挑战天数必须大于0');
        }
        
        if (this.dailyReward < 0) {
            errors.push('每日奖励不能为负数');
        }
        
        if (this.finalReward < 0) {
            errors.push('最终奖励不能为负数');
        }
        
        return errors;
    }

    /**
     * 获取格式化后的价格
     * @returns {string} 格式化后的价格
     */
    get formattedPrice() {
        if (!this._formattedPrice) {
            // 确保depositAmount是数字类型
            let amount = this.depositAmount;
            if (typeof amount !== 'number' || isNaN(amount)) {
                amount = parseFloat(amount) || 0;
            }
            this._formattedPrice = `¥${amount.toFixed(2)}`;
        }
        return this._formattedPrice;
    }

    /**
     * 获取持续时间文本
     * @returns {string} 持续时间文本
     */
    get durationText() {
        if (!this._durationText) {
            if (this.duration === 30) this._durationText = '1个月';
            else if (this.duration === 90) this._durationText = '3个月';
            else if (this.duration === 365) this._durationText = '1年';
            else this._durationText = `${this.duration}天`;
        }
        return this._durationText;
    }

    /**
     * 计算奖励金额
     * @param {number} baseReward 基础奖励金额
     * @returns {number} 计算后的奖励金额
     */
    calculateReward(baseReward) {
        return Math.floor(baseReward * this.rewardAmount);
    }

    /**
     * 计算步数目标
     * @param {number} baseSteps 基础步数
     * @returns {number} 计算后的步数目标
     */
    calculateSteps(baseSteps) {
        return Math.floor(baseSteps * this.stepTarget);
    }

    /**
     * 获取显示信息
     * @returns {Object} 用于显示的VIP等级信息
     */
    getDisplayInfo() {
        // 调试信息
        console.log('getDisplayInfo调用 - this.depositAmount:', this.depositAmount, '类型:', typeof this.depositAmount);
        
        // 确保所有数值字段都是正确的类型
        const depositAmount = parseFloat(this.depositAmount) || 0;
        const stepTarget = parseInt(this.stepTarget) || 0;
        const rewardAmount = parseFloat(this.rewardAmount) || 0;
        const maxChallenges = parseInt(this.maxChallenges) || 1;
        const duration = parseInt(this.duration) || 30;
        const cancelDeductRatio = parseFloat(this.cancelDeductRatio) || 0.1;
        const cancelRewardRatio = parseFloat(this.cancelRewardRatio) || 0;
        const partialRefundRatio = parseFloat(this.partialRefundRatio) || 0.8;
        const maxFailedDays = parseInt(this.maxFailedDays) || 3;
        const requiredConsecutiveDays = parseInt(this.requiredConsecutiveDays) || 1;
        // 如果dailyReward和finalReward为0，则根据rewardAmount和duration计算
        let dailyReward = parseFloat(this.dailyReward) || 0;
        let finalReward = parseFloat(this.finalReward) || 0;
        
        // 如果数据库中的值为0，则自动计算
        if (dailyReward === 0 && rewardAmount > 0 && duration > 0) {
            dailyReward = rewardAmount / duration;
        }
        if (finalReward === 0 && rewardAmount > 0) {
            finalReward = rewardAmount;
        }
        
        // 调试信息
        console.log('转换后的depositAmount:', depositAmount, '类型:', typeof depositAmount);
        
        // 直接计算formattedPrice
        const formattedPrice = `¥${depositAmount.toFixed(2)}`;
        
        // 直接计算durationText
        let durationText;
        if (duration === 30) durationText = '1个月';
        else if (duration === 90) durationText = '3个月';
        else if (duration === 365) durationText = '1年';
        else durationText = `${duration}天`;
        
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            depositAmount: depositAmount,
            formattedPrice: formattedPrice,
            stepTarget: stepTarget,
            rewardAmount: rewardAmount,
            maxChallenges: maxChallenges,
            duration: duration,
            durationText: durationText,
            icon: this.icon,
            color: this.color,
            cancelDeductRatio: cancelDeductRatio,
            cancelRewardRatio: cancelRewardRatio,
            partialRefundRatio: partialRefundRatio,
            maxFailedDays: maxFailedDays,
            requiredConsecutiveDays: requiredConsecutiveDays,
            dailyReward: dailyReward,
            finalReward: finalReward,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * 查找所有活跃的VIP等级
     * @returns {Promise<Array<VIPLevelMySQL>>} VIP等级数组
     */
    static async findActiveLevels() {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM vip_levels WHERE is_active = ? ORDER BY deposit_amount ASC',
                [true]
            );
            
            return rows.map(row => VIPLevelMySQL.fromDatabase(row));
        } catch (error) {
            console.error('查询活跃VIP等级失败:', error);
            throw error;
        }
    }

    /**
     * 根据等级查找VIP等级
     * @param {number} level 等级
     * @returns {Promise<VIPLevelMySQL|null>} VIP等级对象，如果不存在则返回null
     */
    static async findByLevel(level) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM vip_levels WHERE level = ? AND is_active = ?',
                [level, true]
            );
            
            if (rows.length === 0) {
                return null;
            }
            
            return VIPLevelMySQL.fromDatabase(rows[0]);
        } catch (error) {
            console.error('根据等级查询VIP等级失败:', error);
            throw error;
        }
    }

    /**
     * 获取下一个等级
     * @param {number} currentLevel 当前等级
     * @returns {Promise<VIPLevelMySQL|null>} 下一个等级对象，如果不存在则返回null
     */
    static async getNextLevel(currentLevel) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM vip_levels WHERE level > ? AND is_active = ? ORDER BY level ASC LIMIT 1',
                [currentLevel, true]
            );
            
            if (rows.length === 0) {
                return null;
            }
            
            return VIPLevelMySQL.fromDatabase(rows[0]);
        } catch (error) {
            console.error('获取下一个VIP等级失败:', error);
            throw error;
        }
    }

    /**
     * 根据ID查找VIP等级
     * @param {number} id VIP等级ID
     * @returns {Promise<VIPLevelMySQL|null>} VIP等级对象，如果不存在则返回null
     */
    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM vip_levels WHERE id = ?',
                [id]
            );
            
            if (rows.length === 0) {
                return null;
            }
            
            return VIPLevelMySQL.fromDatabase(rows[0]);
        } catch (error) {
            console.error('根据ID查询VIP等级失败:', error);
            throw error;
        }
    }

    /**
     * 查找所有VIP等级
     * @returns {Promise<Array<VIPLevelMySQL>>} VIP等级数组
     */
    static async findAll() {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM vip_levels ORDER BY deposit_amount ASC'
            );
            
            return rows.map(row => VIPLevelMySQL.fromDatabase(row));
        } catch (error) {
            console.error('查询所有VIP等级失败:', error);
            throw error;
        }
    }

    /**
     * 创建VIP等级
     * @returns {Promise<VIPLevelMySQL>} 创建的VIP等级对象
     */
    async save(connection = null) {
        try {
            const dbConnection = connection || pool;
            
            if (this.id) {
                // 更新现有记录
                await dbConnection.execute(
                    `UPDATE vip_levels SET 
                    name = ?, description = ?, deposit_amount = ?, 
                    step_target = ?, reward_amount = ?, max_challenges = ?,
                    duration = ?, icon = ?, color = ?, 
                    cancel_deduct_ratio = ?, cancel_reward_ratio = ?, 
                    is_active = ?, partial_refund_ratio = ?, max_failed_days = ?,
                    required_consecutive_days = ?, daily_reward = ?, final_reward = ?,
                    updated_at = NOW()
                    WHERE id = ?`,
                    [
                        this.name, this.description, this.depositAmount,
                        this.stepTarget, this.rewardAmount, this.maxChallenges,
                        this.duration, this.icon, this.color,
                        this.cancelDeductRatio, this.cancelRewardRatio,
                        this.isActive, this.partialRefundRatio, this.maxFailedDays,
                        this.requiredConsecutiveDays, this.dailyReward, this.finalReward,
                        this.id
                    ]
                );
                
                // 重新获取更新后的记录
                const updated = await VIPLevelMySQL.findById(this.id);
                return updated;
            } else {
                // 创建新记录
                const [result] = await dbConnection.execute(
                    `INSERT INTO vip_levels (
                        name, description, deposit_amount, step_target, 
                        reward_amount, max_challenges, duration, icon, color,
                        cancel_deduct_ratio, cancel_reward_ratio, is_active,
                        partial_refund_ratio, max_failed_days, required_consecutive_days,
                        daily_reward, final_reward, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                    [
                        this.name, this.description, this.depositAmount,
                        this.stepTarget, this.rewardAmount, this.maxChallenges,
                        this.duration, this.icon, this.color,
                        this.cancelDeductRatio, this.cancelRewardRatio, this.isActive,
                        this.partialRefundRatio, this.maxFailedDays, this.requiredConsecutiveDays,
                        this.dailyReward, this.finalReward
                    ]
                );
                
                this.id = result.insertId;
                return this;
            }
        } catch (error) {
            console.error('保存VIP等级失败:', error);
            throw error;
        }
    }

    /**
     * 删除VIP等级
     * @returns {Promise<boolean>} 是否删除成功
     */
    async delete() {
        try {
            if (!this.id) {
                throw new Error('无法删除未保存的VIP等级');
            }
            
            const [result] = await pool.execute(
                'DELETE FROM vip_levels WHERE id = ?',
                [this.id]
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            console.error('删除VIP等级失败:', error);
            throw error;
        }
    }
}

module.exports = VIPLevelMySQL;
