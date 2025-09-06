import api from '../src/services/api.js';

class Checkin {
    constructor(app) {
        this.app = app;
        this.checkinInfo = null;
    }

    render(token, user) {
        if (!token || !user) {
            return `
                <div class="checkin-page">
                    <div class="container" style="max-width: 800px; margin: 2rem auto; text-align: center;">
                        <div style="background: #fff3e0; padding: 2rem; border-radius: 10px;">
                            <h2 style="color: var(--warning); margin-bottom: 1rem;">请先登录</h2>
                            <p style="margin-bottom: 1.5rem;">您需要登录后才能进行签到</p>
                            <a href="#" data-page="login" class="btn btn-primary">立即登录</a>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="checkin-page">
                <div class="checkin-container" style="max-width: 800px; margin: 0 auto; background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="margin-bottom: 1.5rem; color: var(--dark); border-left: 5px solid var(--primary); padding-left: 15px;">每日签到</h2>
                    
                    <div class="checkin-status" style="margin-bottom: 2rem; text-align: center;">
                        <div style="background: #e3f2fd; padding: 2rem; border-radius: 10px;">
                            <div class="checkin-icon" style="font-size: 4rem; margin-bottom: 1rem;">📅</div>
                            <h3 style="margin-bottom: 1rem; color: var(--primary);">今日签到</h3>
                            <p style="margin-bottom: 1rem;">连续签到奖励递增，不要错过哦！</p>
                            <div id="checkinButtonContainer">
                                <button id="checkinBtn" class="btn btn-primary" style="padding: 1rem 2rem; font-size: 1.2rem;">
                                    <span class="loading-spinner" style="display: none;"></span>
                                    <span class="button-text">加载中...</span>
                                </button>
                            </div>
                            <div id="checkinMessage" style="margin-top: 1rem; min-height: 1.5rem;"></div>
                        </div>
                    </div>
                    
                    <div class="checkin-stats" style="margin-bottom: 2rem;">
                        <h3 style="margin-bottom: 1rem; color: var(--primary);">签到统计</h3>
                        <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                            <div class="stat-card" style="background: #e3f2fd; padding: 1.5rem; border-radius: 8px; text-align: center;">
                                <div id="consecutiveDays" class="stat-value" style="font-size: 2rem; font-weight: bold; color: var(--primary);">-</div>
                                <div class="stat-label" style="color: var(--gray);">连续签到(天)</div>
                            </div>
                            <div class="stat-card" style="background: #e8f5e9; padding: 1.5rem; border-radius: 8px; text-align: center;">
                                <div id="totalReward" class="stat-value" style="font-size: 2rem; font-weight: bold; color: var(--success);">-</div>
                                <div class="stat-label" style="color: var(--gray);">累计奖励(USDT)</div>
                            </div>
                            <div class="stat-card" style="background: #fff3e0; padding: 1.5rem; border-radius: 8px; text-align: center;">
                                <div id="monthlyCheckins" class="stat-value" style="font-size: 2rem; font-weight: bold; color: var(--warning);">-</div>
                                <div class="stat-label" style="color: var(--gray);">本月签到(天)</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="checkin-calendar">
                        <h3 style="margin-bottom: 1rem; color: var(--primary);">签到日历</h3>
                        <div class="calendar-header" style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-weight: bold; margin-bottom: 0.5rem;">
                            <div>日</div>
                            <div>一</div>
                            <div>二</div>
                            <div>三</div>
                            <div>四</div>
                            <div>五</div>
                            <div>六</div>
                        </div>
                        <div id="calendarDays" class="calendar-days" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px;">
                            <div class="calendar-loading" style="grid-column: span 7; text-align: center; padding: 2rem;">
                                <div class="loading-spinner"></div>
                                <p>加载中...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateCalendar(calendarData) {
        if (!calendarData || !Array.isArray(calendarData)) {
            return '<div style="grid-column: span 7; text-align: center;">无法加载日历数据</div>';
        }
        
        return calendarData.map(day => {
            if (day.day === 0) {
                return `<div style="aspect-ratio: 1; display: flex; align-items: center; justify-content: center;"></div>`;
            }
            
            return `
                <div style="aspect-ratio: 1; display: flex; align-items: center; justify-content: center; 
                    ${day.isChecked ? 'background: var(--success); color: white;' : 
                      day.isToday ? 'background: var(--primary); color: white;' : 
                      'background: #f5f7fb;'} 
                    border-radius: 50%;">
                    ${day.day}
                </div>
            `;
        }).join('');
    }

    async afterRender(token, user) {
        if (!token || !user) return;

        try {
            // 获取签到信息
            await this.loadCheckinInfo(token);
            
            // 绑定签到按钮事件
            this.bindCheckinButton(token);
        } catch (error) {
            console.error('初始化签到页面失败:', error);
            this.app.showToast('加载签到信息失败，请稍后再试', 'error');
        }
    }
    
    async loadCheckinInfo(token) {
        try {
            const response = await api.getCheckinInfo(token);
            
            if (!response.success) {
                throw new Error(response.message || '获取签到信息失败');
            }
            
            this.checkinInfo = response.data;
            
            // 更新UI
            this.updateCheckinUI();
            
        } catch (error) {
            console.error('获取签到信息失败:', error);
            throw error;
        }
    }
    
    updateCheckinUI() {
        if (!this.checkinInfo) return;
        
        // 更新签到按钮状态
        const checkinBtn = document.getElementById('checkinBtn');
        const buttonText = checkinBtn.querySelector('.button-text');
        
        if (this.checkinInfo.hasCheckedInToday) {
            checkinBtn.disabled = true;
            buttonText.textContent = '今日已签到';
            checkinBtn.classList.add('btn-disabled');
            checkinBtn.classList.remove('btn-primary');
        } else {
            checkinBtn.disabled = false;
            buttonText.textContent = '立即签到';
        }
        
        // 更新统计数据
        document.getElementById('consecutiveDays').textContent = this.checkinInfo.consecutiveDays || 0;
        document.getElementById('totalReward').textContent = this.checkinInfo.totalReward || '0.00';
        document.getElementById('monthlyCheckins').textContent = this.checkinInfo.monthlyCheckins || 0;
        
        // 更新日历
        const calendarContainer = document.getElementById('calendarDays');
        if (calendarContainer) {
            calendarContainer.innerHTML = this.generateCalendar(this.checkinInfo.calendarData);
        }
    }
    
    bindCheckinButton(token) {
        const checkinBtn = document.getElementById('checkinBtn');
        if (!checkinBtn) return;
        
        checkinBtn.addEventListener('click', async () => {
            if (checkinBtn.disabled) return;
            
            try {
                // 显示加载状态
                checkinBtn.disabled = true;
                const spinner = checkinBtn.querySelector('.loading-spinner');
                const buttonText = checkinBtn.querySelector('.button-text');
                spinner.style.display = 'inline-block';
                buttonText.textContent = '签到中...';
                
                // 发送签到请求
                const response = await api.checkin(token);
                
                if (!response.success) {
                    throw new Error(response.message || '签到失败');
                }
                
                // 显示签到成功消息
                this.app.showToast(
                    `🎉 签到成功！获得 ${response.data.rewardAmount.toFixed(2)} USDT 奖励，连续签到 ${response.data.consecutiveDays} 天`,
                    'success'
                );
                
                // 重新加载签到信息
                await this.loadCheckinInfo(token);
                
                // 确保隐藏加载动画
                spinner.style.display = 'none';
                
            } catch (error) {
                console.error('签到失败:', error);
                this.app.showToast(error.message || '签到失败，请稍后再试', 'error');
                
                // 恢复按钮状态
                checkinBtn.disabled = false;
                const spinner = checkinBtn.querySelector('.loading-spinner');
                const buttonText = checkinBtn.querySelector('.button-text');
                spinner.style.display = 'none';
                buttonText.textContent = '立即签到';
            }
        });
    }
}

export default Checkin;