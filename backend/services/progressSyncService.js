/**
 * 进度同步服务
 * 负责VIP挑战系统的实时步数数据同步、挑战进度计算和状态变更检测
 */

const logger = require('../utils/logger');
const { query } = require('../config/database');

class ProgressSyncService {
    constructor(webSocketServer, cacheService) {
        this.webSocketServer = webSocketServer;
        this.cacheService = cacheService;
        this.syncInterval = null;
        this.syncEnabled = false;
        
        logger.info('🔧 进度同步服务初始化...');
    }
    
    // 启动同步服务
    startSync() {
        if (this.syncEnabled) {
            logger.warn('⚠️ 进度同步服务已在运行');
            return;
        }
        
        try {
            // 设置同步间隔（每30秒同步一次）
            this.syncInterval = setInterval(() => {
                this.performSync();
            }, 30000);
            
            this.syncEnabled = true;
            logger.info('✅ 进度同步服务已启动，同步间隔: 30秒');
            
        } catch (error) {
            logger.error('❌ 启动进度同步服务失败:', error.message);
        }
    }
    
    // 停止同步服务
    stopSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        
        this.syncEnabled = false;
        logger.info('🛑 进度同步服务已停止');
    }
    
    // 执行同步
    async performSync() {
        try {
            logger.debug('🔄 开始执行进度同步...');
            
            // 同步用户挑战进度
            await this.syncUserChallengeProgress();
            
            // 同步团队挑战进度
            await this.syncTeamChallengeProgress();
            
            // 同步排行榜数据
            await this.syncLeaderboardData();
            
            // 清理过期缓存
            await this.cleanupExpiredCache();
            
            logger.debug('✅ 进度同步完成');
            
        } catch (error) {
            logger.error('❌ 进度同步失败:', error.message);
        }
    }
    
    // 同步用户挑战进度
    async syncUserChallengeProgress() {
        try {
            const sql = `
                SELECT 
                    uc.id,
                    uc.user_id,
                    uc.challenge_id,
                    uc.current_steps,
                    uc.target_steps,
                    uc.progress_percentage,
                    uc.status,
                    uc.updated_at
                FROM user_challenges uc
                WHERE uc.status IN ('active', 'in_progress')
                AND uc.updated_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
            `;
            
            const results = await query(sql);
            
            for (const progress of results) {
                // 更新缓存
                await this.cacheService.set(
                    `challenge_progress:${progress.id}`,
                    progress,
                    'challengeProgress'
                );
                
                // 发送实时更新
                if (this.webSocketServer) {
                    this.webSocketServer.sendNotification(progress.user_id, {
                        type: 'challenge_progress_update',
                        data: {
                            challengeId: progress.challenge_id,
                            currentSteps: progress.current_steps,
                            targetSteps: progress.target_steps,
                            progressPercentage: progress.progress_percentage,
                            status: progress.status,
                            timestamp: new Date().toISOString()
                        }
                    });
                }
            }
            
            logger.debug(`✅ 同步了 ${results.length} 个用户挑战进度`);
            
        } catch (error) {
            logger.error('❌ 同步用户挑战进度失败:', error.message);
        }
    }
    
    // 同步团队挑战进度
    async syncTeamChallengeProgress() {
        try {
            const sql = `
                SELECT 
                    tc.id,
                    tc.team_id,
                    tc.challenge_id,
                    tc.total_steps,
                    tc.target_steps,
                    tc.progress_percentage,
                    tc.status,
                    tc.updated_at
                FROM team_challenges tc
                WHERE tc.status IN ('active', 'in_progress')
                AND tc.updated_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
            `;
            
            const results = await query(sql);
            
            for (const progress of results) {
                // 更新缓存
                await this.cacheService.set(
                    `team_challenge_progress:${progress.id}`,
                    progress,
                    'challengeProgress'
                );
                
                // 获取团队成员并发送通知
                const teamMembers = await this.getTeamMembers(progress.team_id);
                for (const member of teamMembers) {
                    if (this.webSocketServer) {
                        this.webSocketServer.sendNotification(member.user_id, {
                            type: 'team_challenge_progress_update',
                            data: {
                                teamId: progress.team_id,
                                challengeId: progress.challenge_id,
                                totalSteps: progress.total_steps,
                                targetSteps: progress.target_steps,
                                progressPercentage: progress.progress_percentage,
                                status: progress.status,
                                timestamp: new Date().toISOString()
                            }
                        });
                    }
                }
            }
            
            logger.debug(`✅ 同步了 ${results.length} 个团队挑战进度`);
            
        } catch (error) {
            logger.error('❌ 同步团队挑战进度失败:', error.message);
        }
    }
    
    // 同步排行榜数据
    async syncLeaderboardData() {
        try {
            // 个人排行榜
            const personalLeaderboard = await this.getPersonalLeaderboard();
            await this.cacheService.set(
                'leaderboard:personal',
                personalLeaderboard,
                'hotData'
            );
            
            // 团队排行榜
            const teamLeaderboard = await this.getTeamLeaderboard();
            await this.cacheService.set(
                'leaderboard:team',
                teamLeaderboard,
                'hotData'
            );
            
            // 发送排行榜更新通知
            if (this.webSocketServer) {
                this.webSocketServer.broadcastSystemNotification({
                    type: 'leaderboard_update',
                    data: {
                        personal: personalLeaderboard.length,
                        team: teamLeaderboard.length,
                        timestamp: new Date().toISOString()
                    }
                });
            }
            
            logger.debug('✅ 排行榜数据同步完成');
            
        } catch (error) {
            logger.error('❌ 同步排行榜数据失败:', error.message);
        }
    }
    
    // 获取团队成员
    async getTeamMembers(teamId) {
        try {
            const sql = `
                SELECT user_id FROM team_members 
                WHERE team_id = ? AND status = 'active'
            `;
            
            const results = await query(sql, [teamId]);
            return results;
            
        } catch (error) {
            logger.error(`❌ 获取团队成员失败 [${teamId}]:`, error.message);
            return [];
        }
    }
    
    // 获取个人排行榜
    async getPersonalLeaderboard() {
        try {
            const sql = `
                SELECT 
                    u.id,
                    u.username,
                    u.avatar,
                    SUM(uc.current_steps) as total_steps,
                    COUNT(uc.id) as challenges_count
                FROM users u
                LEFT JOIN user_challenges uc ON u.id = uc.user_id
                WHERE uc.status IN ('completed', 'active')
                GROUP BY u.id
                ORDER BY total_steps DESC
                LIMIT 100
            `;
            
            const results = await query(sql);
            return results;
            
        } catch (error) {
            logger.error('❌ 获取个人排行榜失败:', error.message);
            return [];
        }
    }
    
    // 获取团队排行榜
    async getTeamLeaderboard() {
        try {
            const sql = `
                SELECT 
                    t.id,
                    t.name,
                    t.avatar,
                    SUM(tc.total_steps) as total_steps,
                    COUNT(tc.id) as challenges_count
                FROM teams t
                LEFT JOIN team_challenges tc ON t.id = tc.team_id
                WHERE tc.status IN ('completed', 'active')
                GROUP BY t.id
                ORDER BY total_steps DESC
                LIMIT 50
            `;
            
            const results = await query(sql);
            return results;
            
        } catch (error) {
            logger.error('❌ 获取团队排行榜失败:', error.message);
            return [];
        }
    }
    
    // 清理过期缓存
    async cleanupExpiredCache() {
        try {
            // 清理过期的挑战进度缓存
            await this.cacheService.clearStrategy('challengeProgress');
            
            // 清理过期的热点数据缓存
            await this.cacheService.clearStrategy('hotData');
            
            logger.debug('✅ 过期缓存清理完成');
            
        } catch (error) {
            logger.error('❌ 清理过期缓存失败:', error.message);
        }
    }
    
    // 手动同步特定用户进度
    async syncUserProgress(userId) {
        try {
            const sql = `
                SELECT 
                    uc.id,
                    uc.user_id,
                    uc.challenge_id,
                    uc.current_steps,
                    uc.target_steps,
                    uc.progress_percentage,
                    uc.status
                FROM user_challenges uc
                WHERE uc.user_id = ?
                AND uc.status IN ('active', 'in_progress')
            `;
            
            const results = await query(sql, [userId]);
            
            for (const progress of results) {
                // 更新缓存
                await this.cacheService.set(
                    `challenge_progress:${progress.id}`,
                    progress,
                    'challengeProgress'
                );
                
                // 发送实时更新
                if (this.webSocketServer) {
                    this.webSocketServer.sendNotification(userId, {
                        type: 'challenge_progress_update',
                        data: {
                            challengeId: progress.challenge_id,
                            currentSteps: progress.current_steps,
                            targetSteps: progress.target_steps,
                            progressPercentage: progress.progress_percentage,
                            status: progress.status,
                            timestamp: new Date().toISOString()
                        }
                    });
                }
            }
            
            logger.info(`✅ 用户 ${userId} 进度同步完成，共 ${results.length} 个挑战`);
            return results;
            
        } catch (error) {
            logger.error(`❌ 同步用户 ${userId} 进度失败:`, error.message);
            throw error;
        }
    }
    
    // 手动同步特定挑战进度
    async syncChallengeProgress(challengeId) {
        try {
            const sql = `
                SELECT 
                    uc.id,
                    uc.user_id,
                    uc.challenge_id,
                    uc.current_steps,
                    uc.target_steps,
                    uc.progress_percentage,
                    uc.status
                FROM user_challenges uc
                WHERE uc.challenge_id = ?
                AND uc.status IN ('active', 'in_progress')
            `;
            
            const results = await query(sql, [challengeId]);
            
            for (const progress of results) {
                // 更新缓存
                await this.cacheService.set(
                    `challenge_progress:${progress.id}`,
                    progress,
                    'challengeProgress'
                );
                
                // 发送实时更新
                if (this.webSocketServer) {
                    this.webSocketServer.sendNotification(progress.user_id, {
                        type: 'challenge_progress_update',
                        data: {
                            challengeId: progress.challenge_id,
                            currentSteps: progress.current_steps,
                            targetSteps: progress.target_steps,
                            progressPercentage: progress.progress_percentage,
                            status: progress.status,
                            timestamp: new Date().toISOString()
                        }
                    });
                }
            }
            
            logger.info(`✅ 挑战 ${challengeId} 进度同步完成，共 ${results.length} 个用户`);
            return results;
            
        } catch (error) {
            logger.error(`❌ 同步挑战 ${challengeId} 进度失败:`, error.message);
            throw error;
        }
    }
    
    // 获取服务状态
    getStatus() {
        return {
            syncEnabled: this.syncEnabled,
            syncInterval: this.syncInterval ? '30s' : 'stopped',
            lastSync: this.lastSyncTime || 'never',
            cacheService: this.cacheService ? 'available' : 'unavailable',
            webSocketServer: this.webSocketServer ? 'available' : 'unavailable'
        };
    }
    
    // 关闭服务
    close() {
        this.stopSync();
        logger.info('✅ 进度同步服务已关闭');
    }
}

module.exports = ProgressSyncService;
