class News {
    render(token, user) {
        return `
            <div class="news-page">
                <div class="news-container" style="max-width: 800px; margin: 0 auto;">
                    <h2 style="margin-bottom: 1.5rem; color: var(--dark); border-left: 5px solid var(--primary); padding-left: 15px;">健康资讯</h2>
                    
                    <div id="newsList">
                        <div class="news-loading" style="text-align: center; padding: 2rem;">
                            <div>正在加载新闻...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    afterRender(token, user) {
        this.loadNews();
    }

    async loadNews() {
        try {
            const response = await fetch('http://localhost:3000/api/news');
            const newsList = await response.json();
            
            const newsListElement = document.getElementById('newsList');
            if (newsListElement) {
                if (response.ok) {
                    newsListElement.innerHTML = newsList.map(news => `
                        <div class="news-item" style="background: white; margin-bottom: 1.5rem; padding: 1.5rem; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h3 style="margin-bottom: 0.5rem; color: var(--dark);">${news.title}</h3>
                            <div style="color: var(--gray); margin-bottom: 1rem; font-size: 0.9rem;">
                                作者: ${news.author} | 发布时间: ${new Date(news.publishedAt).toLocaleString()}
                            </div>
                            <p style="line-height: 1.6; color: #555;">${news.content}</p>
                            <button class="btn btn-outline news-detail-btn" data-id="${news.id}" style="margin-top: 1rem;">阅读全文</button>
                        </div>
                    `).join('');
                    
                    // 添加详情按钮事件
                    document.querySelectorAll('.news-detail-btn').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const newsId = e.target.getAttribute('data-id');
                            this.showNewsDetail(newsId);
                        });
                    });
                } else {
                    newsListElement.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--danger);">加载新闻失败</div>';
                }
            }
        } catch (error) {
            const newsListElement = document.getElementById('newsList');
            if (newsListElement) {
                newsListElement.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--danger);">网络错误，请稍后重试</div>';
            }
        }
    }

    async showNewsDetail(newsId) {
        try {
            const response = await fetch(`http://localhost:3000/api/news/${newsId}`);
            const news = await response.json();
            
            if (response.ok) {
                const newsListElement = document.getElementById('newsList');
                if (newsListElement) {
                    newsListElement.innerHTML = `
                        <div class="news-detail" style="background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <button id="backToNews" class="btn btn-outline" style="margin-bottom: 1rem;">&larr; 返回新闻列表</button>
                            <h2 style="margin-bottom: 1rem; color: var(--dark);">${news.title}</h2>
                            <div style="color: var(--gray); margin-bottom: 1.5rem; font-size: 0.9rem;">
                                作者: ${news.author} | 发布时间: ${new Date(news.publishedAt).toLocaleString()}
                            </div>
                            <div style="line-height: 1.8; color: #333;">
                                ${news.content.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                    `;
                    
                    // 添加返回按钮事件
                    document.getElementById('backToNews').addEventListener('click', () => {
                        this.loadNews();
                    });
                }
            }
        } catch (error) {
            alert('加载新闻详情失败');
        }
    }
}

export default News;