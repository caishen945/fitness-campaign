import adminApi from '../services/adminApi.js';
import { CHANNEL_OPTIONS, TEMPLATE_KEY_SUGGESTIONS, SELECT_OPTION_CUSTOM_VALUE } from '../constants/notifications.js';

class NotificationManagement {
    constructor(app) {
        this.app = app;
        this.notifications = [];
        this.currentPage = 1;
        this.pageSize = 20;
        this.totalPages = 0;
        this.total = 0;
        this.filters = { userId: '', email: '', isRead: '' };
        this.isLoading = false;
    }

    render() {
        const channelOptionsHtml = CHANNEL_OPTIONS.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
        const keyOptionsHtml = TEMPLATE_KEY_SUGGESTIONS.map(k => `<option value="${k}">${k}</option>`).join('') + `<option value="${SELECT_OPTION_CUSTOM_VALUE}">自定义...</option>`;

        return `
            <div class="notification-management-page">
                <h1 style="margin-bottom: 1.5rem; color: #2c3e50;">
                    <i class="fas fa-bell" style="margin-right: 10px;"></i>通知管理
                </h1>
                <div class="toolbar" style="margin-bottom: 1.5rem; padding: 1rem; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                        <div>
                            <label style="display:block;margin-bottom:4px;color:#555;">用户ID</label>
                            <input type="number" id="filterUserId" placeholder="输入用户ID" style="width:100%;padding:0.5rem;border:1px solid #ddd;border-radius:4px;">
                        </div>
                        <div>
                            <label style="display:block;margin-bottom:4px;color:#555;">邮箱</label>
                            <input type="email" id="filterEmail" placeholder="输入邮箱" style="width:100%;padding:0.5rem;border:1px solid #ddd;border-radius:4px;">
                        </div>
                        <div>
                            <label style="display:block;margin-bottom:4px;color:#555;">已读状态</label>
                            <select id="filterIsRead" style="width:100%;padding:0.5rem;border:1px solid #ddd;border-radius:4px;">
                                <option value="">全部</option>
                                <option value="true">已读</option>
                                <option value="false">未读</option>
                            </select>
                        </div>
                    </div>
                    <div style="display:flex;gap:0.5rem;">
                        <button id="searchNotifications" class="btn btn-primary"><i class="fas fa-search" style="margin-right:6px;"></i>搜索</button>
                        <button id="clearNotifications" class="btn btn-secondary"><i class="fas fa-times" style="margin-right:6px;"></i>清除</button>
                        <button id="refreshNotifications" class="btn btn-secondary"><i class="fas fa-sync-alt" style="margin-right:6px;"></i>刷新</button>
                    </div>
                </div>

                <div class="send-box" style="margin-bottom: 1.5rem; padding: 1rem; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h3 style="margin-top:0; color:#2c3e50;">发送单用户通知</h3>
                    <div style="display:grid;grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));gap:1rem;">
                        <div>
                            <label style="display:block;margin-bottom:4px;color:#555;">用户ID（与邮箱二选一）</label>
                            <input type="number" id="sendUserId" placeholder="输入用户ID" style="width:100%;padding:0.5rem;border:1px solid #ddd;border-radius:4px;">
                        </div>
                        <div>
                            <label style="display:block;margin-bottom:4px;color:#555;">邮箱（与用户ID二选一）</label>
                            <input type="email" id="sendEmail" placeholder="输入邮箱" style="width:100%;padding:0.5rem;border:1px solid #ddd;border-radius:4px;">
                        </div>
                        <div>
                            <label style="display:block;margin-bottom:4px;color:#555;">标题</label>
                            <input type="text" id="sendTitle" placeholder="输入标题" style="width:100%;padding:0.5rem;border:1px solid #ddd;border-radius:4px;">
                        </div>
                        <div style="grid-column: 1 / -1;">
                            <label style="display:block;margin-bottom:4px;color:#555;">内容</label>
                            <textarea id="sendMessage" rows="3" placeholder="输入内容" style="width:100%;padding:0.5rem;border:1px solid #ddd;border-radius:4px;"></textarea>
                        </div>
                    </div>
                    <div style="margin-top:0.75rem;display:flex;gap:0.5rem;justify-content:flex-end;">
                        <button id="sendNotificationBtn" class="btn btn-success"><i class="fas fa-paper-plane" style="margin-right:6px;"></i>发送</button>
                    </div>
                </div>

                <div class="batch-box" style="margin-bottom: 1.5rem; padding: 1rem; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h3 style="margin-top:0; color:#2c3e50;">批量发送（模板 + 多渠道）</h3>
                    <div style="display:grid;grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));gap:1rem;">
                        <div>
                            <label style="display:block;margin-bottom:4px;color:#555;">模板Key *</label>
                            <div style="display:flex; gap:8px;">
                                <select id="batchTemplateKeySelect" style="flex:1;padding:0.5rem;border:1px solid #ddd;border-radius:4px;">${keyOptionsHtml}</select>
                                <input type="text" id="batchTemplateKeyCustom" placeholder="自定义模板Key" style="flex:1;padding:0.5rem;border:1px solid #ddd;border-radius:4px;display:none;">
                            </div>
                        </div>
                        <div>
                            <label style="display:block;margin-bottom:4px;color:#555;">渠道（可多选）*</label>
                            <select id="batchChannelsSelect" multiple style="width:100%;padding:0.5rem;border:1px solid #ddd;border-radius:4px;min-height:110px;">
                                ${channelOptionsHtml}
                            </select>
                            <input type="hidden" id="batchChannels" value="">
                            <div style="color:#6c757d;font-size:12px;margin-top:6px;">支持：web / email / telegram / push / sms</div>
                        </div>
                        <div style="grid-column: 1 / -1;">
                            <label style="display:block;margin-bottom:4px;color:#555;">变量 (JSON)</label>
                            <textarea id="batchVariables" rows="3" placeholder='{"userName":"Alice"}' style="width:100%;padding:0.5rem;border:1px solid #ddd;border-radius:4px;"></textarea>
                        </div>
                        <div style="grid-column: 1 / -1; display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:1rem;">
                            <div>
                                <label style="display:block;margin-bottom:4px;color:#555;">用户ID列表（逗号分隔）</label>
                                <input type="text" id="batchUserIds" placeholder="如 1,2,3" style="width:100%;padding:0.5rem;border:1px solid #ddd;border-radius:4px;">
                            </div>
                            <div>
                                <label style="display:block;margin-bottom:4px;color:#555;">筛选：注册起始时间</label>
                                <input type="datetime-local" id="filterFrom" style="width:100%;padding:0.5rem;border:1px solid #ddd;border-radius:4px;">
                            </div>
                            <div>
                                <label style="display:block;margin-bottom:4px;color:#555;">筛选：注册结束时间</label>
                                <input type="datetime-local" id="filterTo" style="width:100%;padding:0.5rem;border:1px solid #ddd;border-radius:4px;">
                            </div>
                            <div>
                                <label style="display:block;margin-bottom:4px;color:#555;">筛选：用户是否活跃</label>
                                <select id="filterActive" style="width:100%;padding:0.5rem;border:1px solid #ddd;border-radius:4px;">
                                    <option value="">不限制</option>
                                    <option value="true">是</option>
                                    <option value="false">否</option>
                                </select>
                            </div>
                            <div>
                                <label style="display:block;margin-bottom:4px;color:#555;">筛选：绑定Telegram</label>
                                <select id="filterHasTelegram" style="width:100%;padding:0.5rem;border:1px solid #ddd;border-radius:4px;">
                                    <option value="">不限制</option>
                                    <option value="true">是</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div style="margin-top:0.75rem;display:flex;gap:0.5rem;justify-content:flex-end;flex-wrap:wrap;">
                        <button id="batchSendBtn" class="btn btn-warning"><i class="fas fa-layer-group" style="margin-right:6px;"></i>批量发送</button>
                        <button id="exportBtn" class="btn btn-outline-secondary"><i class="fas fa-file-export" style="margin-right:6px;"></i>导出当前筛选</button>
                    </div>
                </div>

                <div class="list-box" style="background:white;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);overflow:hidden;">
                    <div style="padding:1rem;background:#f8f9fa;border-bottom:1px solid #dee2e6;display:flex;align-items:center;justify-content:space-between;">
                        <h3 style="margin:0;color:#495057;">通知列表</h3>
                        <div id="listSummary" style="color:#6c757d;font-size:0.9rem;"></div>
                    </div>
                    <div style="overflow-x:auto;">
                        <table style="width:100%;border-collapse:collapse;">
                            <thead>
                                <tr style="background:#f8f9fa;">
                                    <th style="padding:0.75rem;border-bottom:1px solid #dee2e6;text-align:left;">ID</th>
                                    <th style="padding:0.75rem;border-bottom:1px solid #dee2e6;text-align:left;">用户ID</th>
                                    <th style="padding:0.75rem;border-bottom:1px solid #dee2e6;text-align:left;">标题</th>
                                    <th style="padding:0.75rem;border-bottom:1px solid #dee2e6;text-align:left;">内容</th>
                                    <th style="padding:0.75rem;border-bottom:1px solid #dee2e6;text-align:left;">已读</th>
                                    <th style="padding:0.75rem;border-bottom:1px solid #dee2e6;text-align:left;">时间</th>
                                    <th style="padding:0.75rem;border-bottom:1px solid #dee2e6;text-align:left;">操作</th>
                                </tr>
                            </thead>
                            <tbody id="notificationTableBody">
                                <tr>
                                    <td colspan="7" style="padding:2rem;text-align:center;color:#6c757d;">
                                        <span id="loadingState">加载中...</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div style="padding:1rem;background:#f8f9fa;border-top:1px solid #dee2e6;display:flex;align-items:center;justify-content:space-between;">
                        <div>第 <span id="paginationCurrent">1</span> / <span id="paginationPages">1</span> 页</div>
                        <div>
                            <button id="prevPageBtn" class="btn btn-sm btn-outline-secondary" disabled><i class="fas fa-chevron-left"></i> 上一页</button>
                            <button id="nextPageBtn" class="btn btn-sm btn-outline-secondary">下一页 <i class="fas fa-chevron-right"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    afterRender() {
        this.bindEvents();
        this.loadNotifications();
    }

    bindEvents() {
        const id = (x) => document.getElementById(x);
        // 下拉+自定义（模板Key）显隐
        const tplSel = id('batchTemplateKeySelect');
        const tplCustom = id('batchTemplateKeyCustom');
        if (tplSel && tplCustom) {
            tplSel.addEventListener('change', () => {
                const isCustom = tplSel.value === SELECT_OPTION_CUSTOM_VALUE;
                tplCustom.style.display = isCustom ? 'block' : 'none';
                if (!isCustom) tplCustom.value = '';
            });
        }
        // 多选渠道 → 隐藏输入同步
        const chSel = id('batchChannelsSelect');
        const chHidden = id('batchChannels');
        const syncChannels = () => {
            if (!chSel || !chHidden) return;
            const selected = Array.from(chSel.options).filter(o => o.selected).map(o => o.value);
            chHidden.value = selected.join(',');
        };
        if (chSel && chHidden) {
            chSel.addEventListener('change', syncChannels);
            syncChannels();
        }
        id('searchNotifications')?.addEventListener('click', () => {
            this.currentPage = 1;
            this.filters.userId = id('filterUserId')?.value.trim();
            this.filters.email = id('filterEmail')?.value.trim();
            this.filters.isRead = id('filterIsRead')?.value;
            this.loadNotifications();
        });
        id('clearNotifications')?.addEventListener('click', () => {
            ['filterUserId','filterEmail','filterIsRead'].forEach(k => { const el = id(k); if (el) el.value = ''; });
            this.filters = { userId: '', email: '', isRead: '' };
            this.currentPage = 1;
            this.loadNotifications();
        });
        id('refreshNotifications')?.addEventListener('click', () => this.loadNotifications());
        id('prevPageBtn')?.addEventListener('click', () => { if (this.currentPage > 1) { this.currentPage--; this.loadNotifications(); } });
        id('nextPageBtn')?.addEventListener('click', () => { if (this.currentPage < this.totalPages) { this.currentPage++; this.loadNotifications(); } });

        id('sendNotificationBtn')?.addEventListener('click', () => this.handleSend());
        id('batchSendBtn')?.addEventListener('click', () => this.handleBatchSend());
        id('exportBtn')?.addEventListener('click', () => this.handleExport());
    }

    async loadNotifications() {
        try {
            this.isLoading = true;
            const tbody = document.getElementById('notificationTableBody');
            if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="padding:2rem;text-align:center;color:#6c757d;">加载中...</td></tr>`;

            const params = {
                page: this.currentPage,
                limit: this.pageSize
            };
            if (this.filters.userId) params.userId = this.filters.userId;
            if (this.filters.email) params.email = this.filters.email;
            if (this.filters.isRead !== '') params.isRead = this.filters.isRead;

            const res = await adminApi.adminGetNotifications(params);
            if (!res.success) throw new Error(res.message || '获取通知失败');

            const data = res.data || {};
            this.notifications = data.notifications || [];
            const pagination = data.pagination || { page: 1, pages: 1, total: 0 };
            this.currentPage = pagination.page || 1;
            this.totalPages = pagination.pages || 1;
            this.total = pagination.total || 0;

            this.renderTable();
            this.updatePagination();
        } catch (e) {
            const tbody = document.getElementById('notificationTableBody');
            if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="padding:2rem;text-align:center;color:#dc3545;">加载失败：${e.message}</td></tr>`;
            if (this.app?.showToast) this.app.showToast('加载通知失败：' + e.message, 'error');
        } finally {
            this.isLoading = false;
        }
    }

    renderTable() {
        const tbody = document.getElementById('notificationTableBody');
        const summary = document.getElementById('listSummary');
        if (summary) summary.textContent = `共 ${this.total} 条记录`;

        if (!tbody) return;
        if (!this.notifications || this.notifications.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="padding:2rem;text-align:center;color:#6c757d;">暂无数据</td></tr>`;
            return;
        }

        tbody.innerHTML = this.notifications.map(n => `
            <tr style="border-bottom:1px solid #eee;">
                <td style="padding:0.75rem;">${n.id}</td>
                <td style="padding:0.75rem;">${n.user_id}</td>
                <td style="padding:0.75rem;">${this.escape(n.title)}</td>
                <td style="padding:0.75rem;max-width:420px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${this.escape(n.message)}">${this.escape(n.message)}</td>
                <td style="padding:0.75rem;">
                    <span style="padding:0.2rem 0.4rem;border-radius:4px;color:#fff;background:${n.is_read ? '#28a745' : '#ffc107'};font-size:12px;">${n.is_read ? '已读' : '未读'}</span>
                </td>
                <td style="padding:0.75rem;">${n.created_at ? new Date(n.created_at).toLocaleString('zh-CN') : '-'}</td>
                <td style="padding:0.75rem;display:flex;gap:0.5rem;flex-wrap:wrap;">
                    ${!n.is_read ? `<button class="btn btn-sm btn-outline-success" data-action="mark" data-id="${n.id}"><i class="fas fa-check"></i> 标记已读</button>` : ''}
                    <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${n.id}"><i class="fas fa-trash"></i> 删除</button>
                </td>
            </tr>
        `).join('');

        // 行内按钮事件
        tbody.querySelectorAll('button[data-action]')?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.getAttribute('data-action');
                const id = parseInt(btn.getAttribute('data-id'));
                if (action === 'mark') this.markAsRead(id);
                if (action === 'delete') this.deleteNotification(id);
            });
        });
    }

    updatePagination() {
        const curEl = document.getElementById('paginationCurrent');
        const pagesEl = document.getElementById('paginationPages');
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        if (curEl) curEl.textContent = String(this.currentPage);
        if (pagesEl) pagesEl.textContent = String(this.totalPages);
        if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
        if (nextBtn) nextBtn.disabled = this.currentPage >= this.totalPages;
    }

    async handleSend() {
        try {
            const userId = (document.getElementById('sendUserId')?.value || '').trim();
            const email = (document.getElementById('sendEmail')?.value || '').trim();
            const title = (document.getElementById('sendTitle')?.value || '').trim();
            const message = (document.getElementById('sendMessage')?.value || '').trim();

            if (!userId && !email) throw new Error('请填写用户ID或邮箱');
            if (!title) throw new Error('请填写标题');
            if (!message) throw new Error('请填写内容');

            const payload = { title, message };
            if (userId) payload.userId = parseInt(userId);
            if (!userId && email) payload.email = email;

            const res = await adminApi.adminCreateNotification(payload);
            if (!res.success) throw new Error(res.message || '发送失败');

            if (this.app?.showToast) this.app.showToast('发送成功', 'success');
            // 清空内容，刷新列表
            const clear = (id) => { const el = document.getElementById(id); if (el) el.value = ''; };
            clear('sendTitle'); clear('sendMessage');
            this.loadNotifications();
        } catch (e) {
            if (this.app?.showToast) this.app.showToast('发送失败：' + e.message, 'error');
        }
    }

    async markAsRead(id) {
        try {
            const res = await adminApi.adminMarkNotificationRead(id);
            if (!res.success) throw new Error(res.message || '标记失败');
            if (this.app?.showToast) this.app.showToast('已标记为已读', 'success');
            this.loadNotifications();
        } catch (e) {
            if (this.app?.showToast) this.app.showToast('标记失败：' + e.message, 'error');
        }
    }

    async deleteNotification(id) {
        try {
            if (!confirm('确定删除该通知吗？')) return;
            const res = await adminApi.adminDeleteNotification(id);
            if (!res.success) throw new Error(res.message || '删除失败');
            if (this.app?.showToast) this.app.showToast('删除成功', 'success');
            this.loadNotifications();
        } catch (e) {
            if (this.app?.showToast) this.app.showToast('删除失败：' + e.message, 'error');
        }
    }

    async handleBatchSend() {
        try {
            const getSelectWithCustomValue = (selectId, customInputId) => {
                const sel = document.getElementById(selectId);
                const val = (sel?.value || '').trim();
                if (val === SELECT_OPTION_CUSTOM_VALUE) {
                    const custom = document.getElementById(customInputId);
                    return (custom?.value || '').trim();
                }
                return val;
            };
            const templateKey = getSelectWithCustomValue('batchTemplateKeySelect','batchTemplateKeyCustom');
            const channelsStr = (document.getElementById('batchChannels')?.value || '').trim();
            const userIdsStr = (document.getElementById('batchUserIds')?.value || '').trim();
            const varsStr = (document.getElementById('batchVariables')?.value || '').trim();
            const createdFrom = (document.getElementById('filterFrom')?.value || '').trim();
            const createdTo = (document.getElementById('filterTo')?.value || '').trim();
            const isActive = document.getElementById('filterActive')?.value;
            const hasTelegram = document.getElementById('filterHasTelegram')?.value;

            if (!templateKey) throw new Error('请填写模板Key');
            const channels = channelsStr.split(',').map(s => s.trim()).filter(Boolean);
            const allowed = new Set(CHANNEL_OPTIONS.map(o => o.value));
            if (channels.some(c => !allowed.has(c))) throw new Error('包含无效渠道，请仅选择 web/email/telegram/push/sms');
            if (channels.length === 0) throw new Error('请填写至少一个渠道');

            let variables = {};
            if (varsStr) {
                try { variables = JSON.parse(varsStr); } catch (_) { throw new Error('变量 JSON 格式不正确'); }
            }

            const target = {};
            if (userIdsStr) {
                const ids = userIdsStr.split(',').map(s => parseInt(s.trim())).filter(n => Number.isFinite(n));
                if (ids.length === 0) throw new Error('用户ID列表格式不正确');
                target.user_ids = ids;
            } else {
                const filters = {};
                if (createdFrom) filters.created_at_from = createdFrom;
                if (createdTo) filters.created_at_to = createdTo;
                if (isActive !== '') filters.is_active = (isActive === 'true');
                if (hasTelegram === 'true') filters.has_telegram = true;
                target.filters = filters;
            }

            if (!confirm('确定按模板批量发送通知吗？该操作将被审计。')) return;
            const res = await adminApi.adminBatchSendNotifications({ channels, template_key: templateKey, variables, target });
            if (!res.success) throw new Error(res.message || '批量发送失败');
            const info = res.data || {};
            if (this.app?.showToast) this.app.showToast(`任务已入队：共${info.totalJobs || 0}，排队成功${info.queued || 0}，失败${info.failed || 0}`, 'success');
        } catch (e) {
            if (this.app?.showToast) this.app.showToast('批量发送失败：' + e.message, 'error');
        }
    }

    async handleExport() {
        try {
            const params = {};
            if (this.filters.userId) params.userId = this.filters.userId;
            if (this.filters.email) params.email = this.filters.email;
            if (this.filters.isRead !== '') params.isRead = this.filters.isRead;
            const from = (document.getElementById('filterFrom')?.value || '').trim();
            const to = (document.getElementById('filterTo')?.value || '').trim();
            const channel = (document.getElementById('batchChannels')?.value || '').trim();
            const status = '';
            if (from) params.from = from;
            if (to) params.to = to;
            if (channel) params.channel = channel.split(',')[0].trim();
            if (status) params.status = status;
            await adminApi.adminExportNotifications(params);
        } catch (e) {
            if (this.app?.showToast) this.app.showToast('导出失败：' + e.message, 'error');
        }
    }

    escape(text) {
        if (text == null) return '';
        return String(text).replace(/[&<>"]+/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
    }
}

export default NotificationManagement;


