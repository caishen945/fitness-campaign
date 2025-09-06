import apiService from '../services/apiService.js';

class Notifications {
    constructor() {
        this.notifications = [];
        this.isLoading = false;
        this.currentPage = 1;
        this.hasMore = true;
        this.currentFilter = 'all';
    }

    render(token, user) {
        if (!token || !user) {
            return `
                <div class="notifications-page">
                    <div class="container" style="max-width: 800px; margin: 2rem auto; text-align: center;">
                        <div style="background: #fff3e0; padding: 2rem; border-radius: 10px;">
                            <h2 style="color: var(--warning); margin-bottom: 1rem;">请先登录</h2>
                            <p style="margin-bottom: 1.5rem;">您需要登录后才能查看通知</p>
                            <a href="#" data-page="login" class="btn btn-primary">立即登录</a>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="notifications-page">
                <div class="notifications-container" style="max-width: 800px; margin: 0 auto; background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <div class="notifications-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <h2 style="color: var(--dark); border-left: 5px solid var(--primary); padding-left: 15px;">消息通知</h2>
                        <div class="notifications-stats">
                            <span id="unreadCount" class="badge badge-primary" style="font-size: 0.9rem;">加载中...</span>
                        </div>
                    </div>
                    
                    <div class="notifications-filter" style="margin-bottom: 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap;">
                        <button class="filter-btn btn btn-outline active" data-filter="all" style="padding: 0.5rem 1rem;">全部</button>
                        <button class="filter-btn btn btn-outline" data-filter="challenge" style="padding: 0.5rem 1rem;">挑战</button>
                        <button class="filter-btn btn btn-outline" data-filter="reward" style="padding: 0.5rem 1rem;">奖励</button>
                        <button class="filter-btn btn btn-outline" data-filter="checkin" style="padding: 0.5rem 1rem;">签到</button>
                        <button class="filter-btn btn btn-outline" data-filter="system" style="padding: 0.5rem 1rem;">系统</button>
                    </div>
                    
                    <div id="notificationsLoading" class="loading-spinner" style="text-align: center; padding: 2rem; display: none;">
                        <i class="fas fa-spinner fa-spin fa-2x"></i>
                        <p style="margin-top: 1rem;">加载通知中...</p>
                    </div>
                    
                    <div id="notificationsList" class="notifications-list">
                        <!-- 通知列表将通过JavaScript动态加载 -->
                    </div>
                    
                    <div id="noNotifications" class="no-notifications" style="text-align: center; padding: 2rem; display: none;">
                        <i class="fas fa-bell-slash fa-3x" style="color: var(--gray); margin-bottom: 1rem;"></i>
                        <p style="color: var(--gray);">暂无通知</p>
                    </div>
                    
                    <div id="loadMoreContainer" style="margin-top: 2rem; text-align: center; display: none;">
                        <button id="loadMoreBtn" class="btn btn-outline">加载更多</button>
                    </div>
                </div>
            </div>
        `;
    }

    async afterRender(token, user) {
        if (!token || !user) {
            // 绑定登录按钮事件
            const loginButton = document.querySelector('[data-page="login"]');
            if (loginButton) {
                loginButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    const event = new CustomEvent('navigate', { detail: { page: 'login' } });
                    document.dispatchEvent(event);
                });
            }
            return;
        }

        // 绑定筛选按钮事件
        this.bindFilterEvents();
        
        // 绑定加载更多按钮事件
        this.bindLoadMoreEvents();
        
        // 加载通知数据
        await this.loadNotifications();
        
        // 加载未读通知数量
        await this.loadUnreadCount();
    }

    /**
     * 绑定筛选按钮事件
     */
    bindFilterEvents() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                // 更新按钮状态
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // 更新筛选器
                this.currentFilter = button.dataset.filter;
                
                // 重新加载通知
                this.currentPage = 1;
                this.loadNotifications();
            });
        });
    }

    /**
     * 绑定加载更多按钮事件
     */
    bindLoadMoreEvents() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.loadMoreNotifications();
            });
        }
    }

    /**
     * 加载通知数据
     */
    async loadNotifications() {
        try {
            this.isLoading = true;
            this.showLoadingState();

            // 构建查询参数
            const params = {
                page: this.currentPage,
                limit: 10,
                filter: this.currentFilter !== 'all' ? this.currentFilter : undefined
            };

            // 调用API获取通知列表
            const response = await apiService.getNotifications(params);
            
            if (response.success) {
                this.notifications = response.data.notifications || [];
                this.hasMore = response.data.has_more || false;
                this.renderNotifications();
                this.updateLoadMoreButton();
            } else {
                throw new Error(response.error || '获取通知失败');
            }
        } catch (error) {
            console.error('加载通知失败:', error);
            this.showError('加载通知失败: ' + error.message);
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    /**
     * 加载更多通知
     */
    async loadMoreNotifications() {
        if (this.isLoading || !this.hasMore) return;

        try {
            this.currentPage++;
            this.isLoading = true;
            
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (loadMoreBtn) {
                loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 加载中...';
                loadMoreBtn.disabled = true;
            }

            // 构建查询参数
            const params = {
                page: this.currentPage,
                limit: 10,
                filter: this.currentFilter !== 'all' ? this.currentFilter : undefined
            };

            // 调用API获取更多通知
            const response = await apiService.getNotifications(params);
            
            if (response.success) {
                const newNotifications = response.data.notifications || [];
                this.notifications = [...this.notifications, ...newNotifications];
                this.hasMore = response.data.has_more || false;
                this.renderNotifications();
                this.updateLoadMoreButton();
            } else {
                throw new Error(response.error || '加载更多通知失败');
            }
        } catch (error) {
            console.error('加载更多通知失败:', error);
            this.currentPage--; // 回退页码
            this.showError('加载更多通知失败: ' + error.message);
        } finally {
            this.isLoading = false;
            
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (loadMoreBtn) {
                loadMoreBtn.innerHTML = '加载更多';
                loadMoreBtn.disabled = false;
            }
        }
    }

    /**
     * 渲染通知列表
     */
    renderNotifications() {
        const notificationsList = document.getElementById('notificationsList');
        const noNotifications = document.getElementById('noNotifications');
        
        if (!notificationsList) return;

        if (this.notifications.length === 0) {
            notificationsList.style.display = 'none';
            if (noNotifications) {
                noNotifications.style.display = 'block';
            }
            return;
        }

        notificationsList.style.display = 'block';
        if (noNotifications) {
            noNotifications.style.display = 'none';
        }

        notificationsList.innerHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.is_read ? 'read' : 'unread'}" 
                 style="padding: 1rem; border-bottom: 1px solid #eee; display: flex; align-items: flex-start; ${!notification.is_read ? 'background-color: #f8f9fa;' : ''}">
                <div style="margin-right: 1rem; font-size: 1.5rem; color: var(--primary);">
                    ${this.getNotificationIcon(notification.type)}
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 500; margin-bottom: 0.5rem; ${!notification.is_read ? 'color: var(--primary);' : ''}">
                        ${notification.title}
                        ${!notification.is_read ? '<span class="badge badge-primary" style="margin-left: 0.5rem;">新</span>' : ''}
                    </div>
                    <div style="color: var(--gray); margin-bottom: 0.5rem;">${notification.content}</div>
                    <div style="font-size: 0.8rem; color: var(--gray);">
                        ${new Date(notification.created_at).toLocaleString()}
                    </div>
                </div>
                <div style="margin-left: 1rem;">
                    ${!notification.is_read ? 
                        `<button class="btn btn-primary btn-sm mark-read-btn" data-id="${notification.id}">标记已读</button>` : 
                        `<span class="text-muted">已读</span>`
                    }
                </div>
            </div>
        `).join('');

        // 绑定标记已读按钮事件
        this.bindMarkAsReadEvents();
    }

    /**
     * 获取通知图标
     */
    getNotificationIcon(type) {
        const iconMap = {
            'challenge': '🏆',
            'reward': '💰',
            'checkin': '📅',
            'system': '🔔',
            'default': '📢'
        };
        return iconMap[type] || iconMap.default;
    }

    /**
     * 绑定标记已读事件
     */
    bindMarkAsReadEvents() {
        const markReadButtons = document.querySelectorAll('.mark-read-btn');
        markReadButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                const notificationId = button.dataset.id;
                await this.markNotificationAsRead(notificationId);
            });
        });
    }

    /**
     * 标记通知为已读
     */
    async markNotificationAsRead(notificationId) {
        try {
            const response = await apiService.markNotificationAsRead(notificationId);
            
            if (response.success) {
                // 更新本地通知状态
                const notification = this.notifications.find(n => n.id == notificationId);
                if (notification) {
                    notification.is_read = true;
                }
                
                // 重新渲染通知列表
                this.renderNotifications();
                
                // 更新未读数量
                await this.loadUnreadCount();
                
                // 显示成功消息
                this.showMessage('通知已标记为已读', 'success');
            } else {
                throw new Error(response.error || '标记已读失败');
            }
        } catch (error) {
            console.error('标记已读失败:', error);
            this.showMessage('标记已读失败: ' + error.message, 'danger');
        }
    }

    /**
     * 加载未读通知数量
     */
    async loadUnreadCount() {
        try {
            const response = await apiService.getUnreadNotificationCount();
            
            if (response.success) {
                const unreadCount = document.getElementById('unreadCount');
                if (unreadCount) {
                    const count = response.data.count || 0;
                    unreadCount.textContent = count > 0 ? `${count} 条未读` : '全部已读';
                    unreadCount.className = count > 0 ? 'badge badge-primary' : 'badge badge-success';
                }
            }
        } catch (error) {
            console.error('获取未读数量失败:', error);
        }
    }

    /**
     * 更新加载更多按钮
     */
    updateLoadMoreButton() {
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        if (loadMoreContainer) {
            loadMoreContainer.style.display = this.hasMore ? 'block' : 'none';
        }
    }

    /**
     * 显示加载状态
     */
    showLoadingState() {
        const loadingElement = document.getElementById('notificationsLoading');
        if (loadingElement) {
            loadingElement.style.display = 'block';
        }
    }

    /**
     * 隐藏加载状态
     */
    hideLoadingState() {
        const loadingElement = document.getElementById('notificationsLoading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    /**
     * 显示消息
     */
    showMessage(message, type) {
        // 创建临时消息提示
        const messageDiv = document.createElement('div');
        messageDiv.className = `alert alert-${type} alert-dismissible fade show`;
        messageDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        messageDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(messageDiv);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        const notificationsList = document.getElementById('notificationsList');
        if (notificationsList) {
            notificationsList.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i> ${message}
                    <button class="btn btn-sm btn-outline-danger ml-2" onclick="location.reload()">重试</button>
                </div>
            `;
        }
    }
}

export default Notifications;