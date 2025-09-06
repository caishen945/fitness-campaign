const { pool } = require('../config/database');
const teamService = require('../services/teamService');

class TeamController {
    /**
     * 获取用户团队信息
     */
    async getTeamInfo(req, res) {
        try {
            const userId = req.user.id;
            
            // 获取团队统计
            const statistics = await teamService.getTeamStatistics(userId);
            
            // 获取邀请码
            const invitationCode = await teamService.getUserInvitationCode(userId);
            
            // 生成邀请链接
            const invitationLink = `${req.protocol}://${req.get('host')}/register?ref=${invitationCode}`;
            
            res.json({
                success: true,
                data: {
                    statistics,
                    invitationCode,
                    invitationLink
                },
                message: '获取团队信息成功'
            });
        } catch (error) {
            console.error('获取团队信息失败:', error);
            // 返回默认数据而不是错误
            const defaultStatistics = teamService.getDefaultStatistics();
            const invitationCode = await teamService.getUserInvitationCode(req.user.id).catch(() => 'INV0000000000000000');
            const invitationLink = `${req.protocol}://${req.get('host')}/register?ref=${invitationCode}`;
            
            res.json({
                success: true,
                data: {
                    statistics: defaultStatistics,
                    invitationCode,
                    invitationLink
                },
                message: '获取团队信息成功'
            });
        }
    }

    /**
     * 获取团队成员列表
     */
    async getTeamMembers(req, res) {
        try {
            const userId = req.user.id;
            const { level } = req.query;
            
            const members = await teamService.getTeamMembers(userId, level ? parseInt(level) : null);
            
            // 按层级分组
            const groupedMembers = {
                level1: members.filter(m => m.level === 1),
                level2: members.filter(m => m.level === 2),
                level3: members.filter(m => m.level === 3)
            };
            
            res.json({
                success: true,
                data: {
                    members: groupedMembers,
                    total: members.length
                },
                message: '获取团队成员成功'
            });
        } catch (error) {
            console.error('获取团队成员失败:', error);
            // 返回空数据而不是错误
            res.json({
                success: true,
                data: {
                    members: {
                        level1: [],
                        level2: [],
                        level3: []
                    },
                    total: 0
                },
                message: '获取团队成员成功'
            });
        }
    }

    /**
     * 获取返佣记录
     */
    async getCommissionRecords(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;
            
            // 获取返佣记录
            const [records] = await pool.execute(`
                SELECT 
                    cr.*,
                    u.email as from_email,
                    COALESCE(vl.name, 'VIP挑战') as challenge_name
                FROM commission_records cr
                JOIN users u ON cr.from_user_id = u.id
                LEFT JOIN vip_challenges vc ON cr.vip_challenge_id = vc.id
                LEFT JOIN vip_levels vl ON vc.vip_level_id = vl.id
                WHERE cr.user_id = ?
                ORDER BY cr.created_at DESC
                LIMIT ? OFFSET ?
            `, [userId, parseInt(limit), offset]);
            
            // 获取总数
            const [total] = await pool.execute(
                'SELECT COUNT(*) as count FROM commission_records WHERE user_id = ?',
                [userId]
            );
            
            res.json({
                success: true,
                data: {
                    records,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: total[0].count,
                        pages: Math.ceil(total[0].count / limit)
                    }
                },
                message: '获取返佣记录成功'
            });
        } catch (error) {
            console.error('获取返佣记录失败:', error);
            // 返回空数据而不是错误
            res.json({
                success: true,
                data: {
                    records: [],
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: 0,
                        pages: 0
                    }
                },
                message: '获取返佣记录成功'
            });
        }
    }

    /**
     * 获取邀请奖励记录
     */
    async getInvitationRewards(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;
            
            // 获取邀请奖励记录
            const [records] = await pool.execute(`
                SELECT 
                    ir.*,
                    u.email as invited_email
                FROM invitation_rewards ir
                JOIN users u ON ir.invited_user_id = u.id
                WHERE ir.user_id = ?
                ORDER BY ir.created_at DESC
                LIMIT ? OFFSET ?
            `, [userId, parseInt(limit), offset]);
            
            // 获取总数
            const [total] = await pool.execute(
                'SELECT COUNT(*) as count FROM invitation_rewards WHERE user_id = ?',
                [userId]
            );
            
            res.json({
                success: true,
                data: {
                    records,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: total[0].count,
                        pages: Math.ceil(total[0].count / limit)
                    }
                },
                message: '获取邀请奖励记录成功'
            });
        } catch (error) {
            console.error('获取邀请奖励记录失败:', error);
            // 返回空数据而不是错误
            res.json({
                success: true,
                data: {
                    records: [],
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: 0,
                        pages: 0
                    }
                },
                message: '获取邀请奖励记录成功'
            });
        }
    }

    // ==================== 管理员功能 ====================

    /**
     * 获取所有团队统计
     */
    async getAllTeamStatistics(req, res) {
        try {
            const { page = 1, limit = 20, search = '' } = req.query;
            const offset = (page - 1) * limit;
            
            let query = `
                SELECT 
                    ts.*,
                    u.email,
                    u.created_at as user_created_at
                FROM team_statistics ts
                JOIN users u ON ts.user_id = u.id
            `;
            
            const params = [];
            
            if (search) {
                query += ' WHERE u.email LIKE ?';
                params.push(`%${search}%`);
            }
            
            query += ' ORDER BY ts.total_commission DESC LIMIT ? OFFSET ?';
            params.push(parseInt(limit), offset);
            
            const [statistics] = await pool.execute(query, params);
            
            // 获取总数
            let countQuery = `
                SELECT COUNT(*) as count
                FROM team_statistics ts
                JOIN users u ON ts.user_id = u.id
            `;
            
            const countParams = [];
            if (search) {
                countQuery += ' WHERE u.email LIKE ?';
                countParams.push(`%${search}%`);
            }
            
            const [total] = await pool.execute(countQuery, countParams);
            
            res.json({
                success: true,
                data: {
                    statistics,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: total[0].count,
                        pages: Math.ceil(total[0].count / limit)
                    }
                },
                message: '获取团队统计成功'
            });
        } catch (error) {
            console.error('获取团队统计失败:', error);
            res.status(500).json({
                success: false,
                error: '获取团队统计失败'
            });
        }
    }

    /**
     * 获取指定用户的团队详情
     */
    async getUserTeamDetail(req, res) {
        try {
            const { userId } = req.params;
            
            // 获取用户信息
            const [users] = await pool.execute(
                'SELECT id, email, created_at FROM users WHERE id = ?',
                [userId]
            );
            
            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: '用户不存在'
                });
            }
            
            const user = users[0];
            
            // 获取团队统计
            const statistics = await teamService.getTeamStatistics(userId);
            
            // 获取各级成员
            const level1Members = await teamService.getTeamMembers(userId, 1);
            const level2Members = await teamService.getTeamMembers(userId, 2);
            const level3Members = await teamService.getTeamMembers(userId, 3);
            
            // 获取邀请码
            const invitationCode = await teamService.getUserInvitationCode(userId);
            
            res.json({
                success: true,
                data: {
                    user,
                    statistics,
                    members: {
                        level1: level1Members,
                        level2: level2Members,
                        level3: level3Members
                    },
                    invitationCode
                },
                message: '获取用户团队详情成功'
            });
        } catch (error) {
            console.error('获取用户团队详情失败:', error);
            res.status(500).json({
                success: false,
                error: '获取用户团队详情失败'
            });
        }
    }

    /**
     * 获取团队配置
     */
    async getTeamConfig(req, res) {
        try {
            const config = await teamService.getTeamConfig();
            
            res.json({
                success: true,
                data: config,
                message: '获取团队配置成功'
            });
        } catch (error) {
            console.error('获取团队配置失败:', error);
            res.status(500).json({
                success: false,
                error: '获取团队配置失败'
            });
        }
    }

    /**
     * 更新团队配置
     */
    async updateTeamConfig(req, res) {
        try {
            const { configKey, configValue } = req.body;
            
            if (!configKey || configValue === undefined) {
                return res.status(400).json({
                    success: false,
                    error: '配置键和值不能为空'
                });
            }
            
            await teamService.updateTeamConfig(configKey, configValue);
            
            res.json({
                success: true,
                message: '团队配置更新成功'
            });
        } catch (error) {
            console.error('更新团队配置失败:', error);
            res.status(500).json({
                success: false,
                error: '更新团队配置失败'
            });
        }
    }

    /**
     * 获取所有返佣记录
     */
    async getAllCommissionRecords(req, res) {
        try {
            const { page = 1, limit = 20, status = '' } = req.query;
            const offset = (page - 1) * limit;
            
            let query = `
                SELECT 
                    cr.*,
                    u1.email as user_email,
                    u2.email as from_email,
                    vc.name as challenge_name
                FROM commission_records cr
                JOIN users u1 ON cr.user_id = u1.id
                JOIN users u2 ON cr.from_user_id = u2.id
                JOIN vip_challenges vc ON cr.vip_challenge_id = vc.id
            `;
            
            const params = [];
            
            if (status) {
                query += ' WHERE cr.status = ?';
                params.push(status);
            }
            
            query += ' ORDER BY cr.created_at DESC LIMIT ? OFFSET ?';
            params.push(parseInt(limit), offset);
            
            const [records] = await pool.execute(query, params);
            
            // 获取总数
            let countQuery = 'SELECT COUNT(*) as count FROM commission_records cr';
            const countParams = [];
            
            if (status) {
                countQuery += ' WHERE cr.status = ?';
                countParams.push(status);
            }
            
            const [total] = await pool.execute(countQuery, countParams);
            
            res.json({
                success: true,
                data: {
                    records,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: total[0].count,
                        pages: Math.ceil(total[0].count / limit)
                    }
                },
                message: '获取返佣记录成功'
            });
        } catch (error) {
            console.error('获取返佣记录失败:', error);
            res.status(500).json({
                success: false,
                error: '获取返佣记录失败'
            });
        }
    }

    /**
     * 获取所有邀请奖励记录
     */
    async getAllInvitationRewards(req, res) {
        try {
            const { page = 1, limit = 20, status = '' } = req.query;
            const offset = (page - 1) * limit;
            
            let query = `
                SELECT 
                    ir.*,
                    u1.email as user_email,
                    u2.email as invited_email
                FROM invitation_rewards ir
                JOIN users u1 ON ir.user_id = u1.id
                JOIN users u2 ON ir.invited_user_id = u2.id
            `;
            
            const params = [];
            
            if (status) {
                query += ' WHERE ir.status = ?';
                params.push(status);
            }
            
            query += ' ORDER BY ir.created_at DESC LIMIT ? OFFSET ?';
            params.push(parseInt(limit), offset);
            
            const [records] = await pool.execute(query, params);
            
            // 获取总数
            let countQuery = 'SELECT COUNT(*) as count FROM invitation_rewards ir';
            const countParams = [];
            
            if (status) {
                countQuery += ' WHERE ir.status = ?';
                countParams.push(status);
            }
            
            const [total] = await pool.execute(countQuery, countParams);
            
            res.json({
                success: true,
                data: {
                    records,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: total[0].count,
                        pages: Math.ceil(total[0].count / limit)
                    }
                },
                message: '获取邀请奖励记录成功'
            });
        } catch (error) {
            console.error('获取邀请奖励记录失败:', error);
            res.status(500).json({
                success: false,
                error: '获取邀请奖励记录失败'
            });
        }
    }
}

module.exports = new TeamController();
