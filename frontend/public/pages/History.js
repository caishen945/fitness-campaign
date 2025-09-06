class History {
    render(token, user) {
        if (!token || !user) {
            return `
                <div class="history-page">
                    <div class="container" style="max-width: 800px; margin: 2rem auto; text-align: center;">
                        <div style="background: #fff3e0; padding: 2rem; border-radius: 10px;">
                            <h2 style="color: var(--warning); margin-bottom: 1rem;">请先登录</h2>
                            <p style="margin-bottom: 1.5rem;">您需要登录后才能查看运动历史</p>
                            <a href="#" data-page="login" class="btn btn-primary">立即登录</a>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="history-page">
                <div class="history-container" style="max-width: 800px; margin: 0 auto; background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="margin-bottom: 1.5rem; color: var(--dark); border-left: 5px solid var(--primary); padding-left: 15px;">运动历史</h2>
                    
                    <div class="filter-section" style="margin-bottom: 2rem;">
                        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 0.5rem;">年份</label>
                                <select id="yearSelect" style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                                    <option value="2025">2025</option>
                                    <option value="2024">2024</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 0.5rem;">月份</label>
                                <select id="monthSelect" style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                                    <option value="1">1月</option>
                                    <option value="2">2月</option>
                                    <option value="3">3月</option>
                                    <option value="4">4月</option>
                                    <option value="5">5月</option>
                                    <option value="6">6月</option>
                                    <option value="7">7月</option>
                                    <option value="8">8月</option>
                                    <option value="9">9月</option>
                                    <option value="10">10月</option>
                                    <option value="11">11月</option>
                                    <option value="12">12月</option>
                                </select>
                            </div>
                            <div style="display: flex; align-items: flex-end;">
                                <button id="loadHistory" class="btn btn-primary">查询</button>
                            </div>
                        </div>
                    </div>
                    
                    <div id="historyChart" style="margin-bottom: 2rem;">
                        <div style="text-align: center; padding: 2rem; color: var(--gray);">
                            请选择年份和月份查询运动历史
                        </div>
                    </div>
                    
                    <div id="historyTable">
                        <div style="text-align: center; padding: 2rem; color: var(--gray);">
                            暂无数据
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    afterRender(token, user) {
        if (!token || !user) return;

        // 设置默认选中当前月份
        const now = new Date();
        document.getElementById('yearSelect').value = now.getFullYear();
        document.getElementById('monthSelect').value = now.getMonth() + 1;

        const loadBtn = document.getElementById('loadHistory');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => {
                const year = document.getElementById('yearSelect').value;
                const month = document.getElementById('monthSelect').value;
                this.loadHistory(token, year, month);
            });
        }
    }

    async loadHistory(token, year, month) {
        try {
            const response = await fetch(`http://localhost:3000/api/steps/history?year=${year}&month=${month}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.displayHistory(data, year, month);
            } else {
                document.getElementById('historyChart').innerHTML = 
                    '<div style="text-align: center; padding: 2rem; color: var(--danger);">加载数据失败</div>';
                document.getElementById('historyTable').innerHTML = 
                    '<div style="text-align: center; padding: 2rem; color: var(--danger);">加载数据失败</div>';
            }
        } catch (error) {
            document.getElementById('historyChart').innerHTML = 
                '<div style="text-align: center; padding: 2rem; color: var(--danger);">网络错误，请稍后重试</div>';
            document.getElementById('historyTable').innerHTML = 
                '<div style="text-align: center; padding: 2rem; color: var(--danger);">网络错误，请稍后重试</div>';
        }
    }

    displayHistory(data, year, month) {
        // 显示图表
        const chartContainer = document.getElementById('historyChart');
        if (data.length === 0) {
            chartContainer.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--gray);">该月暂无步数记录</div>';
        } else {
            // 简单的柱状图展示
            const maxSteps = Math.max(...data.map(item => item.steps));
            chartContainer.innerHTML = `
                <h3 style="margin-bottom: 1rem;">${year}年${month}月步数趋势</h3>
                <div style="display: flex; align-items: flex-end; height: 200px; gap: 2px; padding: 1rem; border: 1px solid #eee; border-radius: 4px;">
                    ${data.map(item => {
                        const height = maxSteps > 0 ? (item.steps / maxSteps) * 180 : 0;
                        return `
                            <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
                                <div style="width: 100%; background: var(--primary); height: ${height}px; border-radius: 4px 4px 0 0;"></div>
                                <div style="margin-top: 5px; font-size: 0.8rem;">${new Date(item.recordDate).getDate()}</div>
                                <div style="font-size: 0.7rem; color: var(--gray);">${item.steps}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        // 显示表格
        const tableContainer = document.getElementById('historyTable');
        if (data.length === 0) {
            tableContainer.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--gray);">该月暂无步数记录</div>';
        } else {
            tableContainer.innerHTML = `
                <h3 style="margin-bottom: 1rem;">详细记录</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f5f7fb;">
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e0e0e0;">日期</th>
                            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e0e0e0;">步数</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(item => `
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 1rem;">${new Date(item.recordDate).toLocaleDateString()}</td>
                                <td style="padding: 1rem;">${item.steps.toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    }
}

export default History;