const VIPLevelMySQL = require('../models/VIPLevelMySQL');
const { pool } = require('../config/database');

class VIPLevelController {
    // 获取所有VIP等级
    async getAllLevels(req, res) {
        try {
            const levels = await VIPLevelMySQL.findAll();
            const displayLevels = levels.map(function(level) {
                return level.getDisplayInfo();
            });
            
            res.json({
                success: true,
                data: displayLevels,
                message: '获取VIP等级列表成功'
            });
        } catch (error) {
            console.error('获取VIP等级列表失败:', error);
            res.status(500).json({
                success: false,
                message: '获取VIP等级列表失败',
                error: error.message
            });
        }
    }

    // 获取单个VIP等级
    async getLevelById(req, res) {
        try {
            const { id } = req.params;
            
            const level = await VIPLevelMySQL.findById(id);
            
            if (!level) {
                return res.status(404).json({
                    success: false,
                    message: 'VIP等级不存在'
                });
            }
            
            const displayInfo = level.getDisplayInfo();
            
            res.json({
                success: true,
                data: displayInfo,
                message: '获取VIP等级成功'
            });
        } catch (error) {
            console.error('获取VIP等级失败:', error);
            res.status(500).json({
                success: false,
                message: '获取VIP等级失败',
                error: error.message
            });
        }
    }

    // 创建VIP等级
    async createLevel(req, res) {
        try {
            const levelData = req.body;
            const level = new VIPLevelMySQL(levelData);
            
            // 验证数据
            const errors = level.validate();
            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: '数据验证失败',
                    errors: errors
                });
            }
            
            // 检查等级名称是否已存在
            const [existingRows] = await pool.query(`
                SELECT id FROM vip_levels WHERE name = ?
            `, [level.name]);
            
            if (existingRows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: '等级名称已存在'
                });
            }
            
            // 保存到数据库
            await level.save();
            
            const displayInfo = level.getDisplayInfo();
            
            res.status(201).json({
                success: true,
                data: displayInfo,
                message: '创建VIP等级成功'
            });
        } catch (error) {
            console.error('创建VIP等级失败:', error);
            res.status(500).json({
                success: false,
                message: '创建VIP等级失败',
                error: error.message
            });
        }
    }

    // 更新VIP等级
    async updateLevel(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            // 检查等级是否存在
            const level = await VIPLevelMySQL.findById(id);
            
            if (!level) {
                return res.status(404).json({
                    success: false,
                    message: 'VIP等级不存在'
                });
            }
            
            // 合并现有数据和新数据
            Object.assign(level, updateData);
            
            // 验证数据
            const errors = level.validate();
            if (errors.length > 0) {
                console.error('VIP等级数据验证失败:', {
                    levelId: id,
                    updateData: updateData,
                    levelData: level,
                    errors: errors
                });
                return res.status(400).json({
                    success: false,
                    message: '数据验证失败',
                    errors: errors
                });
            }
            
            // 检查等级名称是否与其他等级重复
            const [nameCheckRows] = await pool.query(`
                SELECT id FROM vip_levels WHERE name = ? AND id != ?
            `, [level.name, id]);
            
            if (nameCheckRows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: '等级名称已存在'
                });
            }
            
            // 更新数据库
            const updatedLevel = await level.save();
            const displayInfo = updatedLevel.getDisplayInfo();
            
            res.json({
                success: true,
                data: displayInfo,
                message: '更新VIP等级成功'
            });
        } catch (error) {
            console.error('更新VIP等级失败:', error);
            res.status(500).json({
                success: false,
                message: '更新VIP等级失败',
                error: error.message
            });
        }
    }

    // 删除VIP等级
    async deleteLevel(req, res) {
        try {
            const { id } = req.params;
            
            // 检查等级是否存在
            const level = await VIPLevelMySQL.findById(id);
            
            if (!level) {
                return res.status(404).json({
                    success: false,
                    message: 'VIP等级不存在'
                });
            }
            
            // 检查是否有用户正在使用此等级
            const [activeChallenges] = await pool.query(`
                SELECT COUNT(*) as count FROM vip_challenges 
                WHERE vip_level_id = ? AND status = 'active'
            `, [id]);
            
            if (activeChallenges[0].count > 0) {
                return res.status(400).json({
                    success: false,
                    message: '该等级有用户正在参与挑战，无法删除'
                });
            }
            
            // 删除等级
            await level.delete();
            
            res.json({
                success: true,
                message: '删除VIP等级成功'
            });
        } catch (error) {
            console.error('删除VIP等级失败:', error);
            res.status(500).json({
                success: false,
                message: '删除VIP等级失败',
                error: error.message
            });
        }
    }

    // 获取活跃的VIP等级
    async getActiveLevels(req, res) {
        try {
            const levels = await VIPLevelMySQL.findActiveLevels();
            const displayLevels = levels.map(function(level) {
                return level.getDisplayInfo();
            });
            
            res.json({
                success: true,
                data: displayLevels,
                message: '获取活跃VIP等级列表成功'
            });
        } catch (error) {
            console.error('获取活跃VIP等级列表失败:', error);
            res.status(500).json({
                success: false,
                message: '获取活跃VIP等级列表失败',
                error: error.message
            });
        }
    }

    // 切换VIP等级状态
    async toggleLevelStatus(req, res) {
        try {
            const { id } = req.params;
            const { isActive } = req.body;
            
            console.log(`切换VIP等级状态 - ID: ${id}, isActive: ${isActive}`);
            
            // 检查等级是否存在
            const level = await VIPLevelMySQL.findById(id);
            
            if (!level) {
                return res.status(404).json({
                    success: false,
                    message: 'VIP等级不存在'
                });
            }
            
            console.log(`更新前状态 - ID: ${id}, 当前is_active: ${level.isActive}`);
            
            // 更新状态
            level.isActive = isActive;
            await level.save();
            
            // 验证更新结果
            const updatedLevel = await VIPLevelMySQL.findById(id);
            
            console.log(`更新后状态 - ID: ${id}, 新的is_active: ${updatedLevel.isActive}`);
            
            res.json({
                success: true,
                message: `VIP等级${isActive ? '启用' : '禁用'}成功`
            });
        } catch (error) {
            console.error('切换VIP等级状态失败:', error);
            res.status(500).json({
                success: false,
                message: '切换VIP等级状态失败',
                error: error.message
            });
        }
    }

    // 批量更新VIP等级状态
    async batchUpdateStatus(req, res) {
        try {
            const { levelIds, isActive } = req.body;
            
            if (!Array.isArray(levelIds) || levelIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: '请选择要更新的等级'
                });
            }
            
            const placeholders = levelIds.map(() => '?').join(',');
            await pool.query(`
                UPDATE vip_levels SET is_active = ?, updated_at = NOW()
                WHERE id IN (${placeholders})
            `, [isActive, ...levelIds]);
            
            res.json({
                success: true,
                message: `批量${isActive ? '启用' : '禁用'}VIP等级成功`
            });
        } catch (error) {
            console.error('批量更新VIP等级状态失败:', error);
            res.status(500).json({
                success: false,
                message: '批量更新VIP等级状态失败',
                error: error.message
            });
        }
    }
}

module.exports = new VIPLevelController();