class Leaderboard {
    render(token, user) {
        return `
            <div class="leaderboard-page">
                <div class="leaderboard-container" style="max-width: 800px; margin: 0 auto; background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="margin-bottom: 1.5rem; color: var(--dark); border-left: 5px solid var(--primary); padding-left: 15px;">排行榜</h2>
                    
                    <div class="leaderboard-filter" style="margin-bottom: 1.5rem; display: flex; gap: 1rem;">
                        <button class="btn btn-primary filter-btn active" data-period="yesterday" style="flex: 1;">昨日排行</button>
                        <button class="btn btn-outline filter-btn" data-period="week" style="flex: 1;">本周排行</button>
                        <button class="btn btn-outline filter-btn" data-period="month" style="flex: 1;">本月排行</button>
                    </div>
                    
                    <div class="leaderboard-table" style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f5f7fb;">
                                    <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e0e0e0;">排名</th>
                                    <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e0e0e0;">用户</th>
                                    <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e0e0e0;">步数</th>
                                    <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e0e0e0;">奖励</th>
                                </tr>
                            </thead>
                            <tbody id="leaderboardBody">
                                <tr style="border-bottom: 1px solid #eee;">
                                    <td style="padding: 1rem;"><i class="fas fa-trophy" style="color: gold; margin-right: 0.5rem;"></i> 1</td>
                                    <td style="padding: 1rem; font-weight: 500;">用户A</td>
                                    <td style="padding: 1rem;">25,680</td>
                                    <td style="padding: 1rem; color: var(--success);">10 USDT</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #eee;">
                                    <td style="padding: 1rem;"><i class="fas fa-trophy" style="color: silver; margin-right: 0.5rem;"></i> 2</td>
                                    <td style="padding: 1rem; font-weight: 500;">用户B</td>
                                    <td style="padding: 1rem;">23,450</td>
                                    <td style="padding: 1rem; color: var(--success);">8 USDT</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #eee;">
                                    <td style="padding: 1rem;"><i class="fas fa-trophy" style="color: #cd7f32; margin-right: 0.5rem;"></i> 3</td>
                                    <td style="padding: 1rem; font-weight: 500;">用户C</td>
                                    <td style="padding: 1rem;">21,320</td>
                                    <td style="padding: 1rem; color: var(--success);">6 USDT</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #eee;">
                                    <td style="padding: 1rem;">4</td>
                                    <td style="padding: 1rem; font-weight: 500;">用户D</td>
                                    <td style="padding: 1rem;">19,870</td>
                                    <td style="padding: 1rem; color: var(--success);">4 USDT</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #eee;">
                                    <td style="padding: 1rem;">5</td>
                                    <td style="padding: 1rem; font-weight: 500;">用户E</td>
                                    <td style="padding: 1rem;">18,540</td>
                                    <td style="padding: 1rem; color: var(--success);">2 USDT</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    ${user ? `
                        <div class="my-ranking" style="margin-top: 2rem; padding: 1.5rem; background: #e3f2fd; border-radius: 8px; text-align: center;">
                            <h3 style="margin-bottom: 1rem;">我的排名</h3>
                            <div style="font-size: 2rem; font-weight: bold; color: var(--primary);">#25</div>
                            <div style="margin-top: 0.5rem; color: var(--gray);">继续努力，还有25名就能进入奖励区</div>
                        </div>
                    ` : `
                        <div style="margin-top: 2rem; padding: 1.5rem; background: #fff3e0; border-radius: 8px; text-align: center;">
                            <h3 style="margin-bottom: 1rem; color: var(--warning);">登录后查看个人排名</h3>
                            <a href="#" data-page="login" class="btn btn-primary">立即登录</a>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    afterRender(token, user) {
        // 排行榜筛选功能
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // 更新按钮状态
                filterButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                // 获取选择的时间段
                const period = e.target.getAttribute('data-period');
                
                // 这里应该调用API获取对应时间段的数据
                // 为演示目的，我们只是显示一个提示
                alert(`正在加载${period === 'yesterday' ? '昨日' : period === 'week' ? '本周' : '本月'}排行榜数据...`);
            });
        });
    }
}

export default Leaderboard;