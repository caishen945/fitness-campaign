import api from '../src/services/api.js';

class Challenge {
    constructor(app) {
        this.app = app;
        this.selectedLevel = 1; // 默认选择青铜等级
        this.vipLevels = []; // 存储从API获取的VIP等级数据
    }

    render(token, user) {
        return `
            <div class="challenge-page">
                <div class="page-header">
                    <h1>挑战中心</h1>
                </div>

                <!-- 当前VIP等级信息 -->
                <div class="current-vip-info" style="background: linear-gradient(135deg,rgb(0, 255, 166) 0%, #FFA500 100%); color: white; border-radius: 20px; padding: 2rem; margin-bottom: 2rem;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                        <div style="font-size: 48px;">👑</div>
                        <div>
                            <h2 style="margin: 0 0 0.5rem 0; font-size: 24px; font-weight: 600;">当前挑战状态</h2>
                            <p style="margin: 0; font-size: 16px; opacity: 0.9;">查看您的挑战进度和收益详情</p>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 1.5rem;">
                        <div style="background: rgba(255,255,255,0.2); padding: 1.5rem; border-radius: 12px; text-align: center;">
                            <div style="font-size: 28px; font-weight: 600; margin-bottom: 0.5rem;">🥉 青铜</div>
                            <div style="font-size: 14px; opacity: 0.9;">当前等级</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.2); padding: 1.5rem; border-radius: 12px; text-align: center;">
                            <div style="font-size: 28px; font-weight: 600; margin-bottom: 0.5rem;">15.5 USDT</div>
                            <div style="font-size: 14px; opacity: 0.9;">累计获得奖金</div>
                        </div>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.2); padding: 1rem; border-radius: 12px; margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <span style="font-size: 14px;">当日已达到步数</span>
                            <span style="font-size: 14px; font-weight: 600;">850 / 1,000 步</span>
                        </div>
                        <div style="background: rgba(255,255,255,0.3); height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="background: white; height: 100%; width: 85%; border-radius: 4px;"></div>
                        </div>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.2); padding: 1rem; border-radius: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 14px;">次日预计可获得奖金</span>
                            <span style="font-size: 16px; font-weight: 600; color: #FFD700;">5.0 USDT</span>
                        </div>
                    </div>
                </div>

                <!-- 挑战等级选择 -->
                <div class="vip-levels-selection">
                    <h3 style="margin-bottom: 1.5rem; font-size: 20px; text-align: center;">选择挑战等级</h3>
                    <div class="vip-levels-grid" style="display: grid; gap: 1.5rem; margin-bottom: 2rem;">
                        <div id="vip-levels-loading" style="text-align: center; padding: 2rem;">
                            <div style="font-size: 1.2rem; color: var(--gray);">正在加载VIP等级...</div>
                        </div>
                    </div>

                    <!-- 挑战说明 -->
                    <div class="vip-challenge-info" style="background: #f8f9fa; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
                        <h4 style="margin: 0 0 1rem 0; font-size: 16px;">挑战规则</h4>
                        <ul style="margin: 0; padding-left: 1.5rem; color: var(--gray);">
                            <li>选择挑战等级并支付相应押金</li>
                            <li>每日完成步数目标即可获得奖励</li>
                            <li>连续完成挑战可获得额外奖励</li>
                            <li>挑战期间可随时取消，押金将退还</li>
                        </ul>
                    </div>
                    
                    <!-- 挑战历史摘要 -->
                    <div class="challenge-history-summary" style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 2rem;">
                        <h4 style="margin: 0 0 1rem 0; font-size: 16px; color: #333;">📊 挑战历史摘要</h4>
                        <div class="history-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                            <div class="stat-item" style="text-align: center; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                                <div style="font-size: 24px; font-weight: 600; color: #007AFF; margin-bottom: 0.5rem;" id="total-challenges">-</div>
                                <div style="font-size: 12px; color: var(--gray);">总挑战次数</div>
                            </div>
                            <div class="stat-item" style="text-align: center; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                                <div style="font-size: 24px; font-weight: 600; color: #34C759; margin-bottom: 0.5rem;" id="successful-challenges">-</div>
                                <div style="font-size: 12px; color: var(--gray);">成功次数</div>
                            </div>
                            <div class="stat-item" style="text-align: center; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                                <div style="font-size: 24px; font-weight: 600; color: #FF9500; margin-bottom: 0.5rem;" id="total-rewards">-</div>
                                <div style="font-size: 12px; color: var(--gray);">累计收益</div>
                            </div>
                            <div class="stat-item" style="text-align: center; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                                <div style="font-size: 24px; font-weight: 600; color: #FF3B30; margin-bottom: 0.5rem;" id="success-rate">-</div>
                                <div style="font-size: 12px; color: var(--gray);">成功率</div>
                            </div>
                        </div>
                        <div style="text-align: center;">
                            <button class="btn btn-outline" onclick="this.app.showPage('challenge-records')" style="padding: 0.5rem 1rem; border: 1px solid #007AFF; color: #007AFF; background: transparent; border-radius: 6px; font-weight: 500;">
                                查看完整记录 →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async afterRender(token, user) {
        try {
            // 加载当前挑战状态
            const currentChallenge = await api.getCurrentChallenge(token);
            console.log('当前挑战状态:', currentChallenge);
            
            // 确保currentChallenge.data不为null
            this.currentChallenge = currentChallenge.success && currentChallenge.data ? currentChallenge.data : null;
            console.log('处理后的挑战状态:', this.currentChallenge);

            // 加载VIP等级数据
            await this.loadVipLevels();
            
            // 加载挑战统计信息
            await this.loadChallengeStats(token);
            
            // 更新UI以反映当前挑战状态
            this.updateChallengeUI();
            
            // 绑定事件监听器
            this.bindEvents();
        } catch (error) {
            console.error('初始化挑战页面失败:', error);
            this.app.showToast('加载挑战信息失败', 'error');
        }
    }

    async loadChallengeStats(token) {
        try {
            // 使用真实API获取挑战统计信息
            const statsResponse = await api.getChallengeStats();
            if (statsResponse.success && statsResponse.data) {
                this.updateChallengeStats(statsResponse.data);
            } else {
                throw new Error(statsResponse.message || '获取统计信息失败');
            }
        } catch (error) {
            console.error('加载挑战统计信息失败:', error);
            // 显示友好的错误提示
            this.showChallengeStatsError('无法加载挑战统计信息');
        }
    }

    showChallengeStatsError(message) {
        const container = document.querySelector('.challenge-history-summary');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #6c757d;">
                    <div style="font-size: 24px; margin-bottom: 1rem;">📊</div>
                    <div style="font-size: 16px; margin-bottom: 1rem;">${message}</div>
                    <button class="btn btn-outline" onclick="this.loadChallengeStats()" style="padding: 0.5rem 1rem; border: 1px solid #6c757d; color: #6c757d; background: transparent; border-radius: 6px; font-weight: 500;">
                        重新加载
                    </button>
                </div>
            `;
        }
    }

    updateChallengeStats(stats) {
        const totalChallengesEl = document.getElementById('total-challenges');
        const successfulChallengesEl = document.getElementById('successful-challenges');
        const totalRewardsEl = document.getElementById('total-rewards');
        const successRateEl = document.getElementById('success-rate');

        // 使用后端返回的数据结构
        const statsData = stats.stats || stats.basic || stats;
        
        if (totalChallengesEl) totalChallengesEl.textContent = statsData.totalChallenges || 0;
        if (successfulChallengesEl) successfulChallengesEl.textContent = statsData.completedChallenges || 0;
        if (totalRewardsEl) totalRewardsEl.textContent = `${(statsData.totalRewards || 0).toFixed(2)} USDT`;
        if (successRateEl) successRateEl.textContent = `${statsData.successRate || 0}%`;

        // 根据成功率设置颜色
        if (successRateEl) {
            const successRate = parseFloat(statsData.successRate || 0);
            if (successRate >= 80) {
                successRateEl.style.color = '#34C759'; // 绿色
            } else if (successRate >= 60) {
                successRateEl.style.color = '#FF9500'; // 橙色
            } else {
                successRateEl.style.color = '#FF3B30'; // 红色
            }
        }

        // 更新挑战历史摘要，添加更多统计信息
        this.updateChallengeHistorySummary(stats);
    }

    updateChallengeHistorySummary(stats) {
        const container = document.querySelector('.challenge-history-summary');
        if (!container) return;

        // 构建详细的统计摘要
        const summaryHTML = `
            <h4 style="margin: 0 0 1rem 0; font-size: 16px; color: #333;">📊 挑战历史摘要</h4>
            
            <!-- 基础统计 -->
            <div class="history-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                <div class="stat-item" style="text-align: center; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: 600; color: #007AFF; margin-bottom: 0.5rem;" id="total-challenges">${(stats.stats || stats.basic || stats).totalChallenges || 0}</div>
                    <div style="font-size: 12px; color: var(--gray);">总挑战次数</div>
                </div>
                <div class="stat-item" style="text-align: center; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: 600; color: #34C759; margin-bottom: 0.5rem;" id="successful-challenges">${(stats.stats || stats.basic || stats).completedChallenges || 0}</div>
                    <div style="font-size: 12px; color: var(--gray);">成功次数</div>
                </div>
                <div class="stat-item" style="text-align: center; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: 600; color: #FF9500; margin-bottom: 0.5rem;" id="total-rewards">${((stats.stats || stats.basic || stats).totalRewards || 0).toFixed(2)} USDT</div>
                    <div style="font-size: 12px; color: var(--gray);">累计收益</div>
                </div>
                <div class="stat-item" style="text-align: center; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: 600; color: #FF3B30; margin-bottom: 0.5rem;" id="success-rate">${(stats.stats || stats.basic || stats).successRate || 0}%</div>
                    <div style="font-size: 12px; color: var(--gray);">成功率</div>
                </div>
            </div>

            <!-- 详细统计信息 -->
            <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <h5 style="margin: 0 0 0.5rem 0; font-size: 14px; color: #333;">📈 详细统计</h5>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.5rem; font-size: 12px;">
                    <div><strong>取消挑战:</strong> ${(stats.stats || stats.basic || stats).cancelledChallenges || 0}</div>
                    <div><strong>进行中:</strong> ${(stats.stats || stats.basic || stats).activeChallenges || 0}</div>
                    <div><strong>平均奖励:</strong> ${((stats.stats || stats.basic || stats).avgReward || 0).toFixed(2)} USDT</div>
                </div>
            </div>

            <!-- 当前挑战状态 -->
            ${stats.currentChallenge ? `
                <div style="background: #e8f5e8; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #28a745;">
                    <h5 style="margin: 0 0 0.5rem 0; font-size: 14px; color: #333;">🎯 当前挑战</h5>
                    <div style="font-size: 12px; color: #666;">
                        <div><strong>挑战等级:</strong> ${stats.currentChallenge.levelName || '未知'}</div>
                        <div><strong>开始时间:</strong> ${new Date(stats.currentChallenge.startDate).toLocaleDateString()}</div>
                        <div><strong>当前步数:</strong> ${stats.currentChallenge.currentSteps || 0} / ${stats.currentChallenge.stepTarget || 0}</div>
                        <div><strong>剩余天数:</strong> ${stats.currentChallenge.remainingDays || 0} 天</div>
                    </div>
                </div>
            ` : `
                <div style="background: #fff3cd; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #ffc107;">
                    <h5 style="margin: 0 0 0.5rem 0; font-size: 14px; color: #333;">💡 提示</h5>
                    <div style="font-size: 12px; color: #666;">
                        您还没有开始任何挑战，选择一个VIP等级开始您的挑战之旅吧！
                    </div>
                </div>
            `}

            <div style="text-align: center;">
                <button class="btn btn-outline" onclick="this.app.showPage('challenge-records')" style="padding: 0.5rem 1rem; border: 1px solid #007AFF; color: #007AFF; background: transparent; border-radius: 6px; font-weight: 500;">
                    查看完整记录 →
                </button>
            </div>
        `;

        container.innerHTML = summaryHTML;

        // 重新绑定事件监听器
        this.bindEvents();
    }

    updateChallengeUI() {
        // 更新当前VIP等级信息
        const currentVipInfo = document.querySelector('.current-vip-info');
        if (!currentVipInfo) return;

        if (this.currentChallenge && this.currentChallenge.id) {
            // 找到对应的VIP等级信息
            const vipLevel = this.vipLevels.find(level => level.stepTarget === this.currentChallenge.stepTarget);
            if (!vipLevel) {
                console.error('找不到对应的VIP等级信息，步数目标:', this.currentChallenge.stepTarget);
                return;
            }

            const progress = Math.min((this.currentChallenge.currentSteps / this.currentChallenge.stepTarget) * 100, 100);
            const nextDayReward = vipLevel.dailyReward || vipLevel.daily_reward || (vipLevel.rewardAmount / 30) || 0;
            const totalRewards = this.currentChallenge.totalRewards || 0;
            
            // 计算剩余天数
            const startDate = new Date(this.currentChallenge.startDate);
            const currentDate = new Date();
            const daysPassed = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
            const requiredDays = vipLevel.required_consecutive_days || vipLevel.requiredConsecutiveDays || 1;
            const remainingDays = Math.max(0, requiredDays - daysPassed);
            
            currentVipInfo.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="font-size: 48px;">${vipLevel.icon || '👑'}</div>
                    <div>
                        <h2 style="margin: 0 0 0.5rem 0; font-size: 24px; font-weight: 600;">当前挑战状态</h2>
                        <p style="margin: 0; font-size: 16px; opacity: 0.9;">查看您的挑战进度和收益详情</p>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 1.5rem;">
                    <div style="background: rgba(255,255,255,0.2); padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <div style="font-size: 28px; font-weight: 600; margin-bottom: 0.5rem;">${vipLevel.icon} ${vipLevel.name}</div>
                        <div style="font-size: 14px; opacity: 0.9;">当前等级</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.2); padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <div style="font-size: 28px; font-weight: 600; margin-bottom: 0.5rem;">${totalRewards.toFixed(2)} USDT</div>
                        <div style="font-size: 14px; opacity: 0.9;">累计获得奖金</div>
                    </div>
                </div>
                
                <div style="background: rgba(255,255,255,0.2); padding: 1rem; border-radius: 12px; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span style="font-size: 14px;">当日已达到步数</span>
                        <span style="font-size: 14px; font-weight: 600;">${this.currentChallenge.currentSteps.toLocaleString()} / ${this.currentChallenge.stepTarget.toLocaleString()} 步</span>
                    </div>
                    <div style="background: rgba(255,255,255,0.3); height: 8px; border-radius: 4px; overflow: hidden;">
                        <div style="background: white; height: 100%; width: ${progress}%; border-radius: 4px; transition: width 0.3s ease;"></div>
                    </div>
                    <div style="text-align: center; margin-top: 0.5rem; font-size: 12px; opacity: 0.8;">
                        进度: ${progress.toFixed(1)}%
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div style="background: rgba(255,255,255,0.2); padding: 1rem; border-radius: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 14px;">次日预计可获得奖金</span>
                            <span style="font-size: 16px; font-weight: 600; color: #FFD700;">${nextDayReward.toFixed(2)} USDT</span>
                        </div>
                    </div>
                    <div style="background: rgba(255,255,255,0.2); padding: 1rem; border-radius: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 14px;">剩余挑战天数</span>
                            <span style="font-size: 16px; font-weight: 600; color: #FFD700;">${remainingDays} 天</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            currentVipInfo.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="font-size: 48px;">👑</div>
                    <div>
                        <h2 style="margin: 0 0 0.5rem 0; font-size: 24px; font-weight: 600;">VIP等级挑战</h2>
                        <p style="margin: 0; font-size: 16px; opacity: 0.9;">选择一个等级开始挑战</p>
                    </div>
                </div>
                
                <div style="text-align: center; padding: 2rem;">
                    <p style="margin: 0; color: rgba(255,255,255,0.8);">您当前没有进行中的挑战</p>
                    <p style="margin: 0.5rem 0 0 0; color: rgba(255,255,255,0.8);">选择下方的等级开始挑战吧！</p>
                </div>
            `;
        }

        // 更新VIP等级卡片的按钮状态
        document.querySelectorAll('.vip-level-card').forEach(card => {
            const levelId = card.getAttribute('data-level');
            const startButton = card.querySelector('[data-action="start-challenge"]');
            const cancelButton = card.querySelector('[data-action="cancel-challenge"]');
            
            if (this.currentChallenge && this.currentChallenge.id) {
                // 找到当前挑战对应的等级
                const currentVipLevel = this.vipLevels.find(level => level.stepTarget === this.currentChallenge.stepTarget);
                if (currentVipLevel) {
                    // 如果有进行中的挑战
                    if (currentVipLevel.id == levelId) {
                        // 当前等级的挑战
                        startButton.style.display = 'none';
                        cancelButton.style.display = 'block';
                        
                        // 添加当前挑战标识
                        card.style.border = '3px solid #28a745';
                        card.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.3)';
                        
                        // 添加"进行中"标签
                        let statusLabel = card.querySelector('.challenge-status-label');
                        if (!statusLabel) {
                            statusLabel = document.createElement('div');
                            statusLabel.className = 'challenge-status-label';
                            statusLabel.style.cssText = `
                                position: absolute; top: 1rem; right: 1rem; 
                                background: #28a745; color: white; padding: 0.25rem 0.75rem; 
                                border-radius: 20px; font-size: 12px; font-weight: 600;
                            `;
                            statusLabel.textContent = '进行中';
                            card.style.position = 'relative';
                            card.appendChild(statusLabel);
                        }
                    } else {
                        // 其他等级
                        startButton.style.display = 'none';
                        cancelButton.style.display = 'none';
                        
                        // 重置样式
                        card.style.border = '';
                        card.style.boxShadow = '';
                        card.style.position = '';
                        
                        // 移除状态标签
                        const statusLabel = card.querySelector('.challenge-status-label');
                        if (statusLabel) statusLabel.remove();
                    }
                }
            } else {
                // 没有进行中的挑战
                startButton.style.display = 'block';
                cancelButton.style.display = 'none';
                
                // 重置样式
                card.style.border = '';
                card.style.boxShadow = '';
                card.style.position = '';
                
                // 移除状态标签
                const statusLabel = card.querySelector('.challenge-status-label');
                if (statusLabel) statusLabel.remove();
            }
        });
    }

    async loadVipLevels() {
        try {
            const data = await api.getVipLevels();
            
            if (data.success && data.data) {
                this.vipLevels = data.data;
                console.log('加载的VIP等级数据:', this.vipLevels);
                this.renderVipLevels();
            } else {
                console.error('加载VIP等级失败:', data.message);
                this.showVipLevelsError('加载VIP等级失败');
            }
        } catch (error) {
            console.error('加载VIP等级失败:', error);
            this.showVipLevelsError('网络错误，请稍后重试');
        }
    }

    renderVipLevels() {
        const container = document.querySelector('.vip-levels-grid');
        if (!container) return;

        if (this.vipLevels.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--gray);">
                    <div style="font-size: 1.2rem;">暂无可用的VIP等级</div>
                </div>
            `;
            return;
        }

        const levelsHtml = this.vipLevels.map(level => this.renderVipLevelCard(level)).join('');
        container.innerHTML = levelsHtml;
    }

    renderVipLevelCard(level) {
        const color = level.color || '#FFD700';
        const icon = level.icon || '🏆';
        
        // 支持多种字段名格式，优先使用后端返回的字段名
        const depositAmount = level.depositAmount || level.deposit_amount || level.deposit || 0;
        const rewardAmount = level.rewardAmount || level.reward_amount || level.reward || 0;
        const stepTarget = level.stepTarget || level.step_target || level.stepGoal || 0;
        const duration = level.duration || 1;
        const dailyReward = level.dailyReward || level.daily_reward || (rewardAmount / duration);
        const requiredConsecutiveDays = level.required_consecutive_days || level.requiredConsecutiveDays || 1;
        const maxChallenges = level.max_challenges || level.maxChallenges || 1;
        
        const roi = depositAmount > 0 ? ((rewardAmount - depositAmount) / depositAmount * 100).toFixed(2) : '0.00';

        return `
            <div class="vip-level-card" data-level="${level.id}" style="border: 2px solid ${color}; border-radius: 16px; padding: 2rem; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: all 0.3s;">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="font-size: 40px;">${icon}</div>
                    <div>
                        <h4 style="margin: 0 0 0.5rem 0; font-size: 20px; color: ${color}; font-weight: 600;">${level.name}</h4>
                        <p style="margin: 0; color: var(--gray); font-size: 14px;">${level.description || '挑战等级'}</p>
                    </div>
                </div>
                
                <!-- 挑战详情 -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 12px;">
                    <div style="text-align: center;">
                        <div style="font-size: 18px; font-weight: 600; color: ${color}; margin-bottom: 0.5rem;">${depositAmount} USDT</div>
                        <div style="font-size: 12px; color: var(--gray);">解锁金额</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 18px; font-weight: 600; color: ${color}; margin-bottom: 0.5rem;">${requiredConsecutiveDays} 天</div>
                        <div style="font-size: 12px; color: var(--gray);">挑战天数</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 18px; font-weight: 600; color: ${color}; margin-bottom: 0.5rem;">${stepTarget} 步</div>
                        <div style="font-size: 12px; color: var(--gray);">每日目标</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 18px; font-weight: 600; color: ${color}; margin-bottom: 0.5rem;">${dailyReward.toFixed(2)} USDT</div>
                        <div style="font-size: 12px; color: var(--gray);">次日奖励</div>
                    </div>
                </div>
                
                <!-- 挑战限制信息 -->
                <div style="background: ${color}10; padding: 1rem; border-radius: 8px; margin-bottom: 2rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span style="font-size: 14px; color: var(--gray);">剩余挑战次数</span>
                        <span style="font-size: 14px; font-weight: 600; color: ${color};">${maxChallenges} 次</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 14px; color: var(--gray);">回报率</span>
                        <span style="font-size: 14px; font-weight: 600; color: ${color};">${roi}%</span>
                    </div>
                </div>
                
                <!-- 操作按钮 -->
                <div style="display: flex; gap: 1rem;">
                    <button class="btn btn-outline" data-action="cancel-challenge" data-level="${level.id}" style="flex: 1; padding: 0.75rem; border: 1px solid ${color}; color: ${color}; background: transparent; border-radius: 8px; font-weight: 500;">取消挑战</button>
                    <button class="btn btn-primary" data-action="start-challenge" data-level="${level.id}" style="flex: 1; padding: 0.75rem; background: ${color}; color: white; border: none; border-radius: 8px; font-weight: 500;">开始挑战</button>
                </div>
            </div>
        `;
    }

    showVipLevelsError(message) {
        const container = document.querySelector('.vip-levels-grid');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #dc3545;">
                    <div style="font-size: 1.2rem; margin-bottom: 1rem;">${message}</div>
                    <button class="btn btn-primary" onclick="location.reload()">重新加载</button>
                </div>
            `;
        }
    }

    bindEvents() {
        // 移除所有旧的事件监听器，使用更简单的方法
        const startButtons = document.querySelectorAll('[data-action="start-challenge"]');
        
        startButtons.forEach(button => {
            // 克隆节点来移除所有事件监听器
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
        });
        
        document.querySelectorAll('[data-action="cancel-challenge"]').forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
        });

        // 绑定新的事件监听器
        const newStartButtons = document.querySelectorAll('[data-action="start-challenge"]');
        
        newStartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const level = e.currentTarget.getAttribute('data-level');
                this.startChallenge(level);
            });
        });

        document.querySelectorAll('[data-action="cancel-challenge"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const level = e.currentTarget.getAttribute('data-level');
                this.cancelChallenge(level);
            });
        });
    }

    getLevelName(levelId) {
        const level = this.vipLevels.find(l => l.id == levelId);
        return level ? level.name : '未知等级';
    }

    async startChallenge(levelId) {
        const levelName = this.getLevelName(levelId);
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                this.app.showToast('请先登录', 'error');
                return;
            }

            // 获取VIP等级信息
            const vipLevel = this.vipLevels.find(level => level.id == levelId);
            if (!vipLevel) {
                this.app.showToast('无法找到对应的VIP等级', 'error');
                return;
            }

            // 获取用户钱包余额
            const walletResponse = await api.getWalletInfo(token);
            if (!walletResponse.success) {
                this.app.showToast('获取钱包信息失败', 'error');
                return;
            }

            // 从正确的路径获取余额数据
            const balance = parseFloat(walletResponse.data.wallet?.balance || walletResponse.data.stats?.balance || walletResponse.data.balance || 0);
            const requiredAmount = parseFloat(vipLevel.depositAmount || vipLevel.deposit_amount || 0);
            
            if (balance < requiredAmount) {
                this.app.showModal(
                    '余额不足',
                    `<div style="text-align: center; line-height: 1.6;">
                        <div style="font-size: 24px; color: #dc3545; margin-bottom: 1rem;">❌</div>
                        <strong>无法参加${levelName}挑战</strong><br><br>
                        
                        <div style="background: #f8d7da; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #dc3545;">
                            <strong>💰 余额信息:</strong><br>
                            • 当前余额: ${balance.toFixed(2)} USDT<br>
                            • 需要金额: ${requiredAmount.toFixed(2)} USDT<br>
                            • 差额: ${(requiredAmount - balance).toFixed(2)} USDT
                        </div>
                        
                        <div style="background: #d1ecf1; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #17a2b8;">
                            <strong>💡 解决方案:</strong><br>
                            • 充值钱包余额<br>
                            • 选择较低等级的挑战<br>
                            • 联系客服获取帮助
                        </div>
                    </div>`,
                    'error'
                );
                return;
            }

            // 构建挑战详情信息
            const stepTarget = vipLevel.stepTarget || vipLevel.step_target || vipLevel.stepGoal || 0;
            const duration = vipLevel.duration || 1;
            const dailyReward = vipLevel.dailyReward || vipLevel.daily_reward || 0;
            const finalReward = vipLevel.finalReward || vipLevel.final_reward || 0;
            const requiredConsecutiveDays = vipLevel.required_consecutive_days || vipLevel.requiredConsecutiveDays || 1;
            const maxFailedDays = vipLevel.max_failed_days || vipLevel.maxFailedDays || 3;
            const maxChallenges = vipLevel.max_challenges || vipLevel.maxChallenges || 1;
            const cancelDeductRatio = vipLevel.cancel_deduct_ratio || vipLevel.cancelDeductRatio || 0.1;
            const partialRefundRatio = vipLevel.partial_refund_ratio || vipLevel.partialRefundRatio || 0.8;

            const challengeInfo = `
                <div style="text-align: left; line-height: 1.4; font-size: 14px;">
                    <div style="margin-bottom: 0.2rem;"><strong>挑战等级：</strong>${vipLevel.name}</div>
                    <div style="margin-bottom: 0.2rem;"><strong>押金：</strong>${requiredAmount.toFixed(2)} USDT</div>
                    <div style="margin-bottom: 0.2rem;"><strong>每日步数：</strong>${stepTarget.toLocaleString()} 步</div>
                    <div style="margin-bottom: 0.2rem;"><strong>挑战周期：</strong>${requiredConsecutiveDays} 天</div>
                    <div style="margin-bottom: 0.3rem;"><strong>最终奖励：</strong>${finalReward.toFixed(2)} USDT</div>
                </div>
            `;

            // 显示挑战确认对话框
            this.app.showModal(
                '确认开始挑战',
                challengeInfo,
                'info',
                {
                    showCancel: true,
                    confirmText: '开始挑战',
                    cancelText: '取消',
                    onConfirm: async () => {
                        this.app.showToast(`开始${levelName}挑战...`, 'info');
                        const result = await api.startVipChallenge(token, levelId);
                        
                        if (result.success) {
                            // 构建成功消息
                            const successMessage = `
                                <div style="text-align: left; line-height: 1.4; font-size: 14px;">
                                    <div style="margin-bottom: 0.2rem;"><strong>挑战等级：</strong>${levelName}</div>
                                    <div style="margin-bottom: 0.2rem;"><strong>押金：</strong>${requiredAmount.toFixed(2)} USDT</div>
                                    <div style="margin-bottom: 0.2rem;"><strong>每日步数：</strong>${stepTarget.toLocaleString()} 步</div>
                                    <div style="margin-bottom: 0.2rem;"><strong>挑战周期：</strong>${requiredConsecutiveDays} 天</div>
                                    <div style="margin-bottom: 0.3rem;"><strong>最终奖励：</strong>${finalReward.toFixed(2)} USDT</div>
                                </div>
                            `;
                            
                            this.app.showModal(
                                '挑战开始成功',
                                successMessage,
                                'success'
                            );
                            
                            // 重新加载当前挑战状态
                            const currentChallenge = await api.getCurrentChallenge(token);
                            this.currentChallenge = currentChallenge.success ? currentChallenge.data : null;
                            
                            // 更新UI
                            this.updateChallengeUI();
                        } else {
                            const errorMessage = result.message || '开始挑战失败，请稍后重试';
                            this.app.showModal(
                                '开始挑战失败',
                                `<div style="text-align: center; line-height: 1.6;">
                                    <div style="font-size: 24px; color: #dc3545; margin-bottom: 1rem;">❌</div>
                                    <strong>${errorMessage}</strong><br><br>
                                    <div style="background: #f8d7da; padding: 1rem; border-radius: 8px; border-left: 4px solid #dc3545;">
                                        <strong>💡 建议:</strong> 请稍后重试，或联系客服获取帮助
                                    </div>
                                </div>`,
                                'error'
                            );
                        }
                    }
                }
            );
        } catch (error) {
            console.error('开始挑战失败:', error);
            
            let errorMessage = '开始挑战失败，请稍后重试';
            if (error.message) {
                errorMessage = error.message;
            } else if (error.details) {
                errorMessage = `操作失败: ${error.details}`;
            }
            
            this.app.showModal(
                '操作失败',
                `<div style="text-align: center; line-height: 1.6;">
                    <div style="font-size: 24px; color: #dc3545; margin-bottom: 1rem;">❌</div>
                    <strong>${errorMessage}</strong><br><br>
                    <div style="background: #f8d7da; padding: 1rem; border-radius: 8px; border-left: 4px solid #dc3545;">
                        <strong>💡 建议:</strong> 请检查网络连接，或联系客服获取帮助
                    </div>
                </div>`,
                'error'
            );
        }
    }

    async cancelChallenge(levelId) {
        const levelName = this.getLevelName(levelId);
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                this.app.showToast('请先登录', 'error');
                return;
            }

            // 使用已经加载的当前挑战信息
            if (!this.currentChallenge || !this.currentChallenge.id) {
                this.app.showToast('没有进行中的挑战', 'error');
                return;
            }

            // 找到当前挑战对应的等级
            const currentVipLevel = this.vipLevels.find(level => level.stepTarget === this.currentChallenge.stepTarget);
            if (!currentVipLevel) {
                this.app.showToast('无法确定当前挑战等级', 'error');
                return;
            }

            // 确认是否是同一个等级的挑战
            if (currentVipLevel.id != levelId) {
                this.app.showToast('这不是您当前的挑战等级', 'error');
                return;
            }

            // 获取最新的挑战记录
            const challengeRecord = await api.getCurrentChallenge(token);
            console.log('挑战记录:', challengeRecord);
            
            if (!challengeRecord.success || !challengeRecord.data) {
                this.app.showToast('获取挑战信息失败', 'error');
                return;
            }

            // 更新当前挑战信息
            this.currentChallenge = challengeRecord.data;

            // 获取挑战记录数据
            const challengeData = challengeRecord.data;
            if (!challengeData) {
                console.error('无法获取挑战记录数据');
                return;
            }

            // 获取金额和比例（从VIP等级配置中获取）
            let depositAmount = 0;
            let deductRatio = 0;
            let rewardRatio = 0;
            let partialRefundRatio = 0;
            let maxFailedDays = 0;
            let currentFailedDays = 0;

            // 从VIP等级配置获取参数
            if (currentVipLevel.depositAmount) {
                depositAmount = parseFloat(currentVipLevel.depositAmount);
            } else if (currentVipLevel.deposit_amount) {
                depositAmount = parseFloat(currentVipLevel.deposit_amount);
            } else {
                depositAmount = 50.00; // 默认值
            }

            // 获取取消挑战扣除比例
            if (currentVipLevel.cancel_deduct_ratio !== undefined) {
                deductRatio = parseFloat(currentVipLevel.cancel_deduct_ratio);
            } else if (currentVipLevel.cancelDeductRatio !== undefined) {
                deductRatio = parseFloat(currentVipLevel.cancelDeductRatio);
            } else {
                deductRatio = 0.1; // 默认10%
            }

            // 获取取消挑战奖励比例
            if (currentVipLevel.cancel_reward_ratio !== undefined) {
                rewardRatio = parseFloat(currentVipLevel.cancel_reward_ratio);
            } else if (currentVipLevel.cancelRewardRatio !== undefined) {
                rewardRatio = parseFloat(currentVipLevel.cancelRewardRatio);
            } else {
                rewardRatio = 0.0; // 默认不发放奖励
            }

            // 获取部分失败退还比例
            if (currentVipLevel.partial_refund_ratio !== undefined) {
                partialRefundRatio = parseFloat(currentVipLevel.partial_refund_ratio);
            } else if (currentVipLevel.partialRefundRatio !== undefined) {
                partialRefundRatio = parseFloat(currentVipLevel.partialRefundRatio);
            } else {
                partialRefundRatio = 0.8; // 默认80%
            }

            // 获取最大失败天数
            if (currentVipLevel.max_failed_days !== undefined) {
                maxFailedDays = parseInt(currentVipLevel.max_failed_days);
            } else if (currentVipLevel.maxFailedDays !== undefined) {
                maxFailedDays = parseInt(currentVipLevel.maxFailedDays);
            } else {
                maxFailedDays = 3; // 默认3天
            }

            // 获取当前失败天数（从挑战记录中）
            if (challengeData.failed_days !== undefined) {
                currentFailedDays = parseInt(challengeData.failed_days);
            } else if (challengeData.failedDays !== undefined) {
                currentFailedDays = parseInt(challengeData.failedDays);
            } else {
                currentFailedDays = 0;
            }

            // 保存当前挑战记录
            this.currentChallenge = challengeData;

            console.log('解析后的配置参数:', {
                depositAmount,
                deductRatio,
                rewardRatio,
                partialRefundRatio,
                maxFailedDays,
                currentFailedDays
            });
            
            // 计算各种金额
            const deductAmount = depositAmount * deductRatio;
            const returnAmount = depositAmount - deductAmount;
            const dailyReward = currentVipLevel.dailyReward || currentVipLevel.daily_reward || 0;
            const rewardAmount = dailyReward * rewardRatio;

            // 构建简化的提示消息
            const message = `
                <div style="text-align: left; line-height: 1.4; font-size: 14px;">
                    <div style="margin-bottom: 0.2rem;"><strong>取消无法获得次日奖励。</strong></div>
                    <div style="margin-bottom: 0.2rem;"><strong>当前挑战失败天数：</strong>${currentFailedDays} 天</div>
                    <div style="margin-bottom: 0.2rem;"><strong>扣除比例：</strong>${(deductRatio * 100).toFixed(1)}%</div>
                    <div style="margin-bottom: 0.2rem;"><strong>扣除金额：</strong>${deductAmount.toFixed(2)} USDT</div>
                    <div style="margin-bottom: 0.3rem;"><strong>退还金额：</strong>${returnAmount.toFixed(2)} USDT</div>
                </div>
            `;

            // 显示确认对话框
            this.app.showModal(
                '确认取消挑战',
                message,
                'warning',
                {
                    showCancel: true,
                    confirmText: '确认取消',
                    cancelText: '继续挑战',
                    onConfirm: async () => {
                        this.app.showToast(`取消${levelName}挑战...`, 'info');
                        const result = await api.cancelVipChallenge(token, this.currentChallenge.id);
                        
                        if (result.success) {
                            // 构建简化的成功消息
                            const successMessage = `
                                <div style="text-align: left; line-height: 1.4; font-size: 14px;">
                                    <div style="margin-bottom: 0.2rem;"><strong>取消无法获得次日奖励。</strong></div>
                                    <div style="margin-bottom: 0.2rem;"><strong>当前挑战失败天数：</strong>${currentFailedDays} 天</div>
                                    <div style="margin-bottom: 0.2rem;"><strong>扣除比例：</strong>${(deductRatio * 100).toFixed(1)}%</div>
                                    <div style="margin-bottom: 0.2rem;"><strong>扣除金额：</strong>${deductAmount.toFixed(2)} USDT</div>
                                    <div style="margin-bottom: 0.3rem;"><strong>退还金额：</strong>${returnAmount.toFixed(2)} USDT</div>
                                </div>
                            `;
                            
                            this.app.showModal(
                                '挑战已取消',
                                successMessage,
                                'success'
                            );
                            
                            // 重新加载当前挑战状态
                            const currentChallenge = await api.getCurrentChallenge(token);
                            this.currentChallenge = currentChallenge.success ? currentChallenge.data : null;
                            this.updateChallengeUI();
                        } else {
                            const errorMessage = result.message || '取消挑战失败';
                            this.app.showModal(
                                '取消挑战失败',
                                `<div style="text-align: center; line-height: 1.6;">
                                    <div style="font-size: 24px; color: #dc3545; margin-bottom: 1rem;">❌</div>
                                    <strong>${errorMessage}</strong><br><br>
                                    <div style="background: #f8d7da; padding: 1rem; border-radius: 8px; border-left: 4px solid #dc3545;">
                                        <strong>💡 建议:</strong> 请稍后重试，或联系客服获取帮助
                                    </div>
                                </div>`,
                                'error'
                            );
                            console.error('取消挑战失败:', result);
                        }
                    }
                }
            );
        } catch (error) {
            console.error('取消挑战失败:', error);
            console.error('错误详情:', error.details);
            console.error('完整响应:', error.response);
            
            let errorMessage = '取消挑战失败，请稍后重试';
            if (error.message) {
                errorMessage = error.message;
            } else if (error.details) {
                errorMessage = `操作失败: ${error.details}`;
            }
            
            this.app.showModal(
                '操作失败',
                `<div style="text-align: center; line-height: 1.6;">
                    <div style="font-size: 24px; color: #dc3545; margin-bottom: 1rem;">❌</div>
                    <strong>${errorMessage}</strong><br><br>
                    <div style="background: #f8d7da; padding: 1rem; border-radius: 8px; border-left: 4px solid #dc3545;">
                        <strong>💡 建议:</strong> 请检查网络连接，或联系客服获取帮助
                    </div>
                </div>`,
                'error'
            );
        }
    }
}

export default Challenge;
