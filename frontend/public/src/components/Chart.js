class Chart {
    static renderStepsChart(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const maxValue = Math.max(...data.map(d => d.value));
        const chartHeight = 200;
        const chartWidth = container.clientWidth - 40;

        let chartHTML = `
            <div class="chart-container">
                <div class="chart-header">
                    <h3>步数趋势</h3>
                    <div class="chart-legend">
                        <span class="legend-item">
                            <span class="legend-color" style="background-color: #4361ee;"></span>
                            本周步数
                        </span>
                    </div>
                </div>
                <div class="chart-wrapper">
                    <div class="y-axis">
                        ${Array.from({length: 5}, (_, i) => `
                            <div class="y-axis-label" style="bottom: ${(i * 25)}%">${Math.round(maxValue * (i / 4) / 1000)}k</div>
                        `).join('')}
                    </div>
                    <div class="chart-area" style="height: ${chartHeight}px;">
                        <div class="chart-bars">
                            ${data.map((item, index) => {
                                const height = (item.value / maxValue) * 100;
                                return `
                                    <div class="chart-bar" style="height: ${height}%; left: ${(index * (100 / (data.length - 1)))}%;">
                                        <div class="bar-fill" style="background-color: #4361ee; height: 100%;"></div>
                                        <div class="bar-label">${item.label}</div>
                                        <div class="bar-value">${item.value.toLocaleString()}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = chartHTML;
    }

    static renderProgressChart(containerId, percentage, label) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const chartHTML = `
            <div class="progress-chart">
                <div class="progress-info">
                    <h3>${label}</h3>
                    <span class="progress-percentage">${Math.round(percentage)}%</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%; background: linear-gradient(90deg, #4361ee, #3a0ca3);"></div>
                    </div>
                </div>
                <div class="progress-stats">
                    <span>已完成: ${Math.round(percentage)}%</span>
                </div>
            </div>
        `;

        container.innerHTML = chartHTML;
    }

    static renderAchievementChart(containerId, achievements) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const unlockedCount = achievements.filter(a => a.unlocked).length;
        const totalCount = achievements.length;
        const percentage = (unlockedCount / totalCount) * 100;

        const chartHTML = `
            <div class="achievement-chart">
                <div class="achievement-header">
                    <h3>成就进度</h3>
                    <span class="achievement-count">${unlockedCount}/${totalCount}</span>
                </div>
                <div class="achievement-progress">
                    <div class="progress-ring">
                        <svg viewBox="0 0 36 36" class="circular-chart">
                            <path class="circle-bg"
                                d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path class="circle"
                                stroke-dasharray="${percentage}, 100"
                                d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <text x="18" y="20.5" class="percentage">${Math.round(percentage)}%</text>
                        </svg>
                    </div>
                    <div class="achievement-details">
                        <div class="detail-item">
                            <span class="detail-label">已解锁</span>
                            <span class="detail-value">${unlockedCount}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">待解锁</span>
                            <span class="detail-value">${totalCount - unlockedCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = chartHTML;
    }
}

export default Chart;