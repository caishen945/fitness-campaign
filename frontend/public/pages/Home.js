class Home {
    render(token, user) {
        const isAuthenticated = !!(token && user);
        console.log('Home 页面渲染:', { isAuthenticated, token, user }); // 调试信息
        
        return `
            <div class="home-page">
                <div class="hero-section" style="text-align: center; padding: 2rem 0; margin-top: 20px;">
                    <h1 style="font-size: 32px; font-weight: 700; margin-bottom: 1rem;">欢迎来到 FitChallenge</h1>
                    <p style="font-size: 17px; color: var(--gray); margin-bottom: 2rem; line-height: 1.5;">通过每日步数挑战，改善您的健康状况，赢取丰厚奖励</p>
                    ${isAuthenticated ? 
                        `<div style="margin-bottom: 2rem;">
                            <p>欢迎您，<strong>${user.id ? `ID ${user.id}` : 'ID'}${user.email ? ` (${user.email})` : (user.telegram_username ? ` (${user.telegram_username})` : (user.telegram_id ? ` (TG${user.telegram_id})` : ''))}</strong>！</p>
                            <button id="logoutBtn" class="btn btn-outline" style="margin-top: 10px;">退出登录</button>
                        </div>` :
                        `<div class="cta-buttons" style="margin: 2rem 0; display: flex; flex-direction: column; gap: 12px;">
                            <a href="#" class="btn btn-primary" data-page="register" style="width: 100%;">立即注册</a>
                            <a href="#" class="btn btn-outline" data-page="login" style="width: 100%;">用户登录</a>
                        </div>`
                    }
                </div>
                
                <div class="features-section">
                    <h2 style="text-align: center; margin-bottom: 2rem; font-size: 24px; font-weight: 600;">平台功能</h2>
                    <div class="features-grid" style="display: flex; flex-direction: column; gap: 16px;">
                        <div class="card">
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <div style="background-color: #E0F0FF; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-trophy" style="font-size: 24px; color: var(--primary);"></i>
                                </div>
                                <div>
                                    <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 4px;">排行榜</h3>
                                    <p style="font-size: 15px; color: var(--gray);">实时查看步数排行榜，与全球用户竞争</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <div style="background-color: #E0F8F0; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-users" style="font-size: 24px; color: var(--success);"></i>
                                </div>
                                <div>
                                    <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 4px;">团队系统</h3>
                                    <p style="font-size: 15px; color: var(--gray);">邀请好友加入，建立您的健康团队</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <div style="background-color: #E0F8FF; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-wallet" style="font-size: 24px; color: var(--info);"></i>
                                </div>
                                <div>
                                    <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 4px;">数字钱包</h3>
                                    <p style="font-size: 15px; color: var(--gray);">集成TRC-20钱包，安全存储奖励</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <div style="background-color: #F0E0FF; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-bullseye" style="font-size: 24px; color: var(--warning);"></i>
                                </div>
                                <div>
                                    <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 4px;">挑战系统</h3>
                                    <p style="font-size: 15px; color: var(--gray);">参与步数挑战，赢取USDT奖励</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    afterRender(token, user) {
        // 绑定登出按钮事件
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (window.globalAppInstance) {
                    window.globalAppInstance.logout();
                }
            });
        }
    }
}

export default Home;