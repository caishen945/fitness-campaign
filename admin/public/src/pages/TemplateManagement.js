import adminApi from '../services/adminApi.js';
import { CHANNEL_OPTIONS, TEMPLATE_KEY_SUGGESTIONS, LOCALE_OPTIONS_MINIMAL, SELECT_OPTION_CUSTOM_VALUE } from '../constants/notifications.js';

class TemplateManagement {
    constructor(app) {
        this.app = app;
        this.templates = [];
        this.currentPage = 1;
        this.pageSize = 20;
        this.totalPages = 1;
        this.total = 0;
        this.filters = { template_key: '', locale: '', channel: '', active: '' };
        this.isLoading = false;
        this.currentEditingId = null;
    }

    normalizeChannel(value) {
        if (!value) return '';
        const s = String(value).trim().toLowerCase();
        const map = {
            web: 'web',
            email: 'email',
            mail: 'email',
            telegram: 'telegram',
            tg: 'telegram',
            push: 'push',
            sms: 'sms',
            message: 'sms'
        };
        return map[s] || s;
    }

    getSelectWithCustomValue(selectId, customInputId) {
        const selectEl = document.getElementById(selectId);
        if (!selectEl) return '';
        const val = (selectEl.value || '').trim();
        if (val === SELECT_OPTION_CUSTOM_VALUE) {
            const customEl = document.getElementById(customInputId);
            return (customEl?.value || '').trim();
        }
        return val;
    }

    isValidChannel(value) {
        const v = this.normalizeChannel(value);
        return ['web','email','telegram','push','sms'].includes(v);
    }

    render() {
        const channelOptionsHtml = CHANNEL_OPTIONS.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
        const channelFilterOptionsHtml = `<option value="">全部</option>` + CHANNEL_OPTIONS.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
        const keyOptionsHtml = TEMPLATE_KEY_SUGGESTIONS.map(k => `<option value="${k}">${k}</option>`).join('') + `<option value="${SELECT_OPTION_CUSTOM_VALUE}">自定义...</option>`;
        const keyFilterOptionsHtml = `<option value="">全部</option>` + TEMPLATE_KEY_SUGGESTIONS.map(k => `<option value="${k}">${k}</option>`).join('') + `<option value="${SELECT_OPTION_CUSTOM_VALUE}">自定义...</option>`;
        const localeOptionsHtml = LOCALE_OPTIONS_MINIMAL.map(o => `<option value="${o.value}">${o.label}</option>`).join('') + `<option value="${SELECT_OPTION_CUSTOM_VALUE}">自定义...</option>`;
        const localeFilterOptionsHtml = `<option value="">全部</option>` + LOCALE_OPTIONS_MINIMAL.map(o => `<option value="${o.value}">${o.label}</option>`).join('') + `<option value="${SELECT_OPTION_CUSTOM_VALUE}">自定义...</option>`;

        return `
            <div class="template-management-page">
                <h1 style="margin-bottom: 1.5rem; color: #2c3e50;">
                    <i class="fas fa-file-alt" style="margin-right: 10px;"></i>模板管理
                </h1>

                <div class="toolbar" style="margin-bottom: 1.5rem; padding: 1rem; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                        <div>
                            <label style="display:block;margin-bottom:4px;color:#555;">模板Key</label>
                            <div style="display:flex; gap:8px;">
                                <select id="tplFilterKeySelect" style="flex:1;padding:0.5rem;border:1px solid #ddd;border-radius:4px;">${keyFilterOptionsHtml}</select>
                                <input type="text" id="tplFilterKeyCustom" placeholder="自定义Key" style="flex:1;padding:0.5rem;border:1px solid #ddd;border-radius:4px;display:none;">
                            </div>
                        </div>
                        <div>
                            <label style="display:block;margin-bottom:4px;color:#555;">语言</label>
                            <div style="display:flex; gap:8px;">
                                <select id="tplFilterLocaleSelect" style="flex:1;padding:0.5rem;border:1px solid #ddd;border-radius:4px;">${localeFilterOptionsHtml}</select>
                                <input type="text" id="tplFilterLocaleCustom" placeholder="自定义语言，如 zh-CN" style="flex:1;padding:0.5rem;border:1px solid #ddd;border-radius:4px;display:none;">
                            </div>
                        </div>
                        <div>
                            <label style="display:block;margin-bottom:4px;color:#555;">渠道</label>
                            <select id="tplFilterTypeSelect" style="width:100%;padding:0.5rem;border:1px solid #ddd;border-radius:4px;">${channelFilterOptionsHtml}</select>
                        </div>
                        <div>
                            <label style="display:block;margin-bottom:4px;color:#555;">启用状态</label>
                            <select id="tplFilterActive" style="width:100%;padding:0.5rem;border:1px solid #ddd;border-radius:4px;">
                                <option value="">全部</option>
                                <option value="true">启用</option>
                                <option value="false">禁用</option>
                            </select>
                        </div>
                    </div>
                    <div style="display:flex;gap:0.5rem;">
                        <button id="tplSearch" class="btn btn-primary"><i class="fas fa-search" style="margin-right:6px;"></i>搜索</button>
                        <button id="tplClear" class="btn btn-secondary"><i class="fas fa-times" style="margin-right:6px;"></i>清除</button>
                        <button id="tplRefresh" class="btn btn-secondary"><i class="fas fa-sync-alt" style="margin-right:6px;"></i>刷新</button>
                        <button id="tplCreate" class="btn btn-success" style="margin-left:auto;"><i class="fas fa-plus" style="margin-right:6px;"></i>新增模板</button>
                    </div>
                </div>

                <div id="tplLatest" style="margin-bottom:1rem; padding:0.75rem; background:white; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1); display:none;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div id="tplLatestText" style="color:#495057;font-size:0.95rem;"></div>
                        <button id="tplLatestRefresh" class="btn btn-sm btn-outline-secondary">刷新</button>
                    </div>
                </div>

                <div class="list-box" style="background:white;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);overflow:hidden;">
                    <div style="padding:1rem;background:#f8f9fa;border-bottom:1px solid #dee2e6;display:flex;align-items:center;justify-content:space-between;">
                        <h3 style="margin:0;color:#495057;">模板列表</h3>
                        <div id="tplListSummary" style="color:#6c757d;font-size:0.9rem;"></div>
                    </div>
                    <div style="overflow-x:auto;">
                        <table style="width:100%;border-collapse:collapse;">
                            <thead>
                                <tr style="background:#f8f9fa;">
                                    <th style="padding:0.75rem;border-bottom:1px solid #dee2e6;text-align:left;">ID</th>
                                    <th style="padding:0.75rem;border-bottom:1px solid #dee2e6;text-align:left;">模板Key</th>
                                    <th style="padding:0.75rem;border-bottom:1px solid #dee2e6;text-align:left;">语言</th>
                                    <th style="padding:0.75rem;border-bottom:1px solid #dee2e6;text-align:left;">渠道</th>
                                    <th style="padding:0.75rem;border-bottom:1px solid #dee2e6;text-align:left;">启用</th>
                                    <th style="padding:0.75rem;border-bottom:1px solid #dee2e6;text-align:left;">更新时间</th>
                                    <th style="padding:0.75rem;border-bottom:1px solid #dee2e6;text-align:left;">操作</th>
                                </tr>
                            </thead>
                            <tbody id="tplTableBody">
                                <tr>
                                    <td colspan="7" style="padding:2rem;text-align:center;color:#6c757d;">
                                        <span>加载中...</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div style="padding:1rem;background:#f8f9fa;border-top:1px solid #dee2e6;display:flex;align-items:center;justify-content:space-between;">
                        <div>第 <span id="tplPaginationCurrent">1</span> / <span id="tplPaginationPages">1</span> 页</div>
                        <div>
                            <button id="tplPrevPage" class="btn btn-sm btn-outline-secondary" disabled><i class="fas fa-chevron-left"></i> 上一页</button>
                            <button id="tplNextPage" class="btn btn-sm btn-outline-secondary">下一页 <i class="fas fa-chevron-right"></i></button>
                        </div>
                    </div>
                </div>

                <!-- 模板编辑模态框 -->
                <div class="modal" id="tplEditModal" style="display:none;align-items:center;justify-content:center;position:fixed;left:0;top:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10000;">
                    <div style="background:#fff;border-radius:8px;width:640px;max-width:95%;padding:16px;box-shadow:0 10px 30px rgba(0,0,0,0.2);">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                            <h3 id="tplModalTitle" style="margin:0;">新增模板</h3>
                            <button id="tplCloseModal" class="btn btn-sm btn-secondary">关闭</button>
                        </div>
                        <div>
                            <div class="form-row" style="display:grid;grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));gap:1rem;">
                                <div>
                                    <label>名称 *</label>
                                    <input type="text" id="tplName" style="width:100%;padding:0.5rem;border:1px solid #ddd;border-radius:4px;" required>
                                </div>
                                <div>
                                    <label>渠道 *</label>
                                    <select id="tplChannelSelect" style="width:100%;padding:0.5rem;border:1px solid #ddd;border-radius:4px;" required>
                                        ${channelOptionsHtml}
                                    </select>
                                </div>
                                <div>
                                    <label>启用</label>
                                    <select id="tplActive" style="width:100%;padding:0.5rem;border:1px solid #ddd;border-radius:4px;">
                                        <option value="true">是</option>
                                        <option value="false">否</option>
                                    </select>
                                </div>
                            </div>
                            <div style="margin-top:1rem;">
                                <label>标题</label>
                                <input type="text" id="tplTitle" style="width:100%;padding:0.5rem;border:1px solid #ddd;border-radius:4px;">
                            </div>
                            <div style="margin-top:1rem;">
                                <label>内容</label>
                                <textarea id="tplBody" rows="6" style="width:100%;padding:0.5rem;border:1px solid #ddd;border-radius:4px;"></textarea>
                            </div>
                            <div style="margin-top:1rem;">
                                <label>变量 (JSON)</label>
                                <textarea id="tplVariables" rows="3" placeholder='{"userName":"Alice"}' style="width:100%;padding:0.5rem;border:1px solid #ddd;border-radius:4px;"></textarea>
                                <div style="color:#6c757d;font-size:12px;margin-top:6px;">预览将使用此 JSON 作为变量渲染。</div>
                            </div>
                            <div style="margin-top:1rem;">
                                <button type="button" id="tplToggleAdvanced" class="btn btn-sm btn-outline-secondary">高级设置</button>
                            </div>
                            <div id="tplAdvanced" style="display:none;margin-top:0.75rem;padding:0.75rem;border:1px dashed #ced4da;border-radius:6px;background:#fafafa;">
                                <div class="form-row" style="display:grid;grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));gap:1rem;">
                                    <div>
                                        <label>模板Key</label>
                                        <div style="display:flex; gap:8px;">
                                            <select id="tplKeySelect" style="flex:1;padding:0.5rem;border:1px solid #ddd;border-radius:4px;">${keyOptionsHtml}</select>
                                            <input type="text" id="tplKey" placeholder="自动由名称生成，可手动修改" style="flex:1;padding:0.5rem;border:1px solid #ddd;border-radius:4px;display:none;">
                                        </div>
                                    </div>
                                    <div>
                                        <label>语言</label>
                                        <div style="display:flex; gap:8px;">
                                            <select id="tplLocaleSelect" style="flex:1;padding:0.5rem;border:1px solid #ddd;border-radius:4px;">${localeOptionsHtml}</select>
                                            <input type="text" id="tplLocale" placeholder="例如: zh-CN" style="flex:1;padding:0.5rem;border:1px solid #ddd;border-radius:4px;display:none;">
                                        </div>
                                    </div>
                                </div>
                                <div style="color:#6c757d;font-size:12px;margin-top:6px;">不填写时：模板Key将根据名称自动生成，语言默认 en，渠道默认 web（仅对“保存为新版本”生效）。</div>
                            </div>
                        </div>
                        <div style="margin-top:12px;text-align:right;display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;">
                            <button id="tplSaveCurrent" class="btn btn-warning">保存到当前版本</button>
                            <button id="tplSave" class="btn btn-primary">保存为新版本</button>
                        </div>
                    </div>
                </div>
                <!-- 预览模态框 -->
                <div class="modal" id="tplPreviewModal" style="display:none;align-items:center;justify-content:center;position:fixed;left:0;top:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10001;">
                    <div style="background:#fff;border-radius:8px;width:720px;max-width:95%;padding:16px;box-shadow:0 10px 30px rgba(0,0,0,0.2);">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                            <h3 id="tplPreviewTitle" style="margin:0;">预览</h3>
                            <button id="tplPreviewClose" class="btn btn-sm btn-secondary">关闭</button>
                        </div>
                        <div>
                            <div style="margin-bottom:8px;color:#495057;">
                                <strong>Subject:</strong> <span id="tplPreviewSubject"></span>
                            </div>
                            <div style="white-space:pre-wrap;border:1px solid #eee;border-radius:6px;padding:10px;background:#fcfcfc;" id="tplPreviewBody"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    afterRender() {
        this.bindEvents();
        this.loadTemplates();
        this.loadLatest();
    }

    bindEvents() {
        const $ = (id) => document.getElementById(id?.startsWith('#') ? id.slice(1) : id);
        $('#tplSearch')?.addEventListener('click', () => {
            this.currentPage = 1;
            this.filters.template_key = this.getSelectWithCustomValue('tplFilterKeySelect','tplFilterKeyCustom');
            this.filters.locale = this.getSelectWithCustomValue('tplFilterLocaleSelect','tplFilterLocaleCustom');
            this.filters.channel = this.normalizeChannel($('#tplFilterTypeSelect')?.value || '');
            this.filters.active = $('#tplFilterActive')?.value;
            this.loadTemplates();
            this.loadLatest();
        });
        $('#tplClear')?.addEventListener('click', () => {
            ['tplFilterKeySelect','tplFilterLocaleSelect','tplFilterTypeSelect','tplFilterActive'].forEach(k => { const el = $(k); if (el) el.value = ''; });
            ['tplFilterKeyCustom','tplFilterLocaleCustom'].forEach(k => { const el = $(k); if (el) { el.value = ''; el.style.display = 'none'; } });
            this.filters = { template_key: '', locale: '', channel: '', active: '' };
            this.currentPage = 1;
            this.loadTemplates();
            this.loadLatest();
        });
        $('#tplRefresh')?.addEventListener('click', () => this.loadTemplates());
        $('#tplPrevPage')?.addEventListener('click', () => { if (this.currentPage > 1) { this.currentPage--; this.loadTemplates(); } });
        $('#tplNextPage')?.addEventListener('click', () => { if (this.currentPage < this.totalPages) { this.currentPage++; this.loadTemplates(); } });
        $('#tplCreate')?.addEventListener('click', () => this.openEditModal());
        $('#tplCloseModal')?.addEventListener('click', () => this.closeEditModal());
        document.getElementById('tplPreviewClose')?.addEventListener('click', () => {
            const modal = document.getElementById('tplPreviewModal');
            if (modal) modal.style.display = 'none';
        });
        const advBtn = document.getElementById('tplToggleAdvanced');
        if (advBtn) {
            advBtn.addEventListener('click', () => {
                const adv = document.getElementById('tplAdvanced');
                if (adv) adv.style.display = adv.style.display === 'none' ? 'block' : 'none';
            });
        }
        $('#tplSave')?.addEventListener('click', () => this.handleSave());
        document.getElementById('tplSaveCurrent')?.addEventListener('click', () => this.handleSaveCurrent());
        document.getElementById('tplLatestRefresh')?.addEventListener('click', () => this.loadLatest());

        // 选择器与自定义输入显隐（筛选区）
        const keyFilterSel = document.getElementById('tplFilterKeySelect');
        const keyFilterCustom = document.getElementById('tplFilterKeyCustom');
        if (keyFilterSel && keyFilterCustom) {
            keyFilterSel.addEventListener('change', () => {
                keyFilterCustom.style.display = keyFilterSel.value === SELECT_OPTION_CUSTOM_VALUE ? 'block' : 'none';
                if (keyFilterSel.value !== SELECT_OPTION_CUSTOM_VALUE) keyFilterCustom.value = '';
            });
        }
        const localeFilterSel = document.getElementById('tplFilterLocaleSelect');
        const localeFilterCustom = document.getElementById('tplFilterLocaleCustom');
        if (localeFilterSel && localeFilterCustom) {
            localeFilterSel.addEventListener('change', () => {
                localeFilterCustom.style.display = localeFilterSel.value === SELECT_OPTION_CUSTOM_VALUE ? 'block' : 'none';
                if (localeFilterSel.value !== SELECT_OPTION_CUSTOM_VALUE) localeFilterCustom.value = '';
            });
        }

        // 选择器与自定义输入显隐（高级设置）
        const keySel = document.getElementById('tplKeySelect');
        const keyCustom = document.getElementById('tplKey');
        if (keySel && keyCustom) {
            keySel.addEventListener('change', () => {
                keyCustom.style.display = keySel.value === SELECT_OPTION_CUSTOM_VALUE ? 'block' : 'none';
                if (keySel.value !== SELECT_OPTION_CUSTOM_VALUE) keyCustom.value = '';
            });
        }
        const localeSel = document.getElementById('tplLocaleSelect');
        const localeCustom = document.getElementById('tplLocale');
        if (localeSel && localeCustom) {
            localeSel.addEventListener('change', () => {
                localeCustom.style.display = localeSel.value === SELECT_OPTION_CUSTOM_VALUE ? 'block' : 'none';
                if (localeSel.value !== SELECT_OPTION_CUSTOM_VALUE) localeCustom.value = '';
            });
        }
    }

    async loadTemplates() {
        try {
            this.isLoading = true;
            const tbody = document.getElementById('tplTableBody');
            if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="padding:2rem;text-align:center;color:#6c757d;">加载中...</td></tr>`;

            const params = { page: this.currentPage, page_size: this.pageSize };
            if (this.filters.template_key) params.template_key = this.filters.template_key;
            if (this.filters.locale) params.locale = this.filters.locale;
            if (this.filters.channel) params.channel = this.normalizeChannel(this.filters.channel);
            if (this.filters.active !== '') params.active = this.filters.active;

            const res = await adminApi.adminGetTemplates(params);
            if (!res.success) throw new Error(res.message || '获取模板失败');

            this.templates = Array.isArray(res.data) ? res.data : [];
            const pagination = res.pagination || { page: 1, page_size: this.pageSize, total: this.templates.length };
            this.currentPage = pagination.page || 1;
            const pageSize = pagination.page_size || this.pageSize;
            this.total = pagination.total || this.templates.length;
            this.totalPages = Math.max(1, Math.ceil(this.total / pageSize));

            this.renderTable();
            this.updatePagination();
        } catch (e) {
            const tbody = document.getElementById('tplTableBody');
            if (tbody) tbody.innerHTML = `<tr><td colspan=\"7\" style=\"padding:2rem;text-align:center;color:#dc3545;\">加载失败：${this.escape(e.message)}</td></tr>`;
            if (this.app?.showToast) this.app.showToast('加载模板失败：' + e.message, 'error');
        } finally {
            this.isLoading = false;
        }
    }

    renderTable() {
        const tbody = document.getElementById('tplTableBody');
        const summary = document.getElementById('tplListSummary');
        if (summary) summary.textContent = `共 ${this.total} 条记录`;
        if (!tbody) return;
        if (!this.templates || this.templates.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="padding:2rem;text-align:center;color:#6c757d;">暂无数据</td></tr>`;
            return;
        }

        tbody.innerHTML = this.templates.map(t => `
            <tr style="border-bottom:1px solid #eee;">
                <td style="padding:0.75rem;">${t.id}</td>
                <td style="padding:0.75rem;">${this.escape(t.template_key)}</td>
                <td style="padding:0.75rem;">${this.escape(t.locale || '')}</td>
                <td style="padding:0.75rem;">${this.escape(t.channel || '')}</td>
                <td style="padding:0.75rem;">
                    <span style="padding:0.2rem 0.4rem;border-radius:4px;color:#fff;background:${t.is_active ? '#28a745' : '#6c757d'};font-size:12px;">${t.is_active ? '启用' : '禁用'}</span>
                </td>
                <td style="padding:0.75rem;">${t.updated_at ? new Date(t.updated_at).toLocaleString('zh-CN') : '-'}</td>
                <td style="padding:0.75rem;display:flex;gap:0.5rem;flex-wrap:wrap;">
                    <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${t.id}"><i class="fas fa-code-branch"></i> 基于此版本创建</button>
                    <button class="btn btn-sm btn-outline-secondary" data-action="edit-current" data-id="${t.id}"><i class="fas fa-edit"></i> 编辑此版本</button>
                    <button class="btn btn-sm btn-outline-info" data-action="preview" data-id="${t.id}" data-key="${this.escape(t.template_key)}" data-locale="${this.escape(t.locale || '')}" data-channel="${this.escape(t.channel || '')}"><i class="fas fa-eye"></i> 预览</button>
                    <button class="btn btn-sm btn-outline-warning" data-action="toggle" data-id="${t.id}" data-active="${!t.is_active}"><i class="fas fa-toggle-on"></i> ${t.is_active ? '禁用' : '启用'}</button>
                    <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${t.id}"><i class="fas fa-trash"></i> 删除</button>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('button[data-action]')?.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                const id = parseInt(btn.getAttribute('data-id'));
                if (action === 'edit') this.openEditModal(this.templates.find(x => x.id === id), 'fork');
                if (action === 'edit-current') this.openEditModal(this.templates.find(x => x.id === id), 'edit');
                if (action === 'preview') this.previewTemplate({
                    template_key: btn.getAttribute('data-key'),
                    locale: btn.getAttribute('data-locale') || undefined,
                    channel: btn.getAttribute('data-channel') || undefined
                });
                if (action === 'toggle') this.toggleTemplate(id, btn.getAttribute('data-active') === 'true');
                if (action === 'delete') this.deleteTemplate(id);
            });
        });
    }

    updatePagination() {
        const curEl = document.getElementById('tplPaginationCurrent');
        const pagesEl = document.getElementById('tplPaginationPages');
        const prevBtn = document.getElementById('tplPrevPage');
        const nextBtn = document.getElementById('tplNextPage');
        if (curEl) curEl.textContent = String(this.currentPage);
        if (pagesEl) pagesEl.textContent = String(this.totalPages);
        if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
        if (nextBtn) nextBtn.disabled = this.currentPage >= this.totalPages;
    }

    openEditModal(template, mode = 'fork') {
        this.currentEditingId = template?.id || null;
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };
        const titleEl = document.getElementById('tplModalTitle');
        if (titleEl) titleEl.textContent = this.currentEditingId ? (mode === 'edit' ? '编辑此版本' : '基于此版本创建新版本') : '新增模板';
        set('tplName', template?.name || '');
        const chSel = document.getElementById('tplChannelSelect'); if (chSel) chSel.value = template?.channel || 'web';
        // 模板Key选择/自定义
        const keySel2 = document.getElementById('tplKeySelect');
        const keyCustom2 = document.getElementById('tplKey');
        if (keySel2 && keyCustom2) {
            const key = template?.template_key || '';
            if (key && TEMPLATE_KEY_SUGGESTIONS.includes(key)) {
                keySel2.value = key;
                keyCustom2.style.display = 'none';
                keyCustom2.value = '';
            } else {
                keySel2.value = SELECT_OPTION_CUSTOM_VALUE;
                keyCustom2.style.display = 'block';
                keyCustom2.value = key;
            }
        }
        // 语言选择/自定义，默认 zh-CN
        const locSel2 = document.getElementById('tplLocaleSelect');
        const locCustom2 = document.getElementById('tplLocale');
        if (locSel2 && locCustom2) {
            const loc = template?.locale || 'zh-CN';
            if (LOCALE_OPTIONS_MINIMAL.some(o => o.value === loc)) {
                locSel2.value = loc;
                locCustom2.style.display = 'none';
                locCustom2.value = '';
            } else if (loc) {
                locSel2.value = SELECT_OPTION_CUSTOM_VALUE;
                locCustom2.style.display = 'block';
                locCustom2.value = loc;
            } else {
                locSel2.value = 'zh-CN';
                locCustom2.style.display = 'none';
                locCustom2.value = '';
            }
        }
        set('tplTitle', template?.subject || '');
        set('tplBody', template?.body || '');
        const activeEl = document.getElementById('tplActive'); if (activeEl) activeEl.value = String(!!template?.is_active);
        const varsEl = document.getElementById('tplVariables'); if (varsEl) varsEl.value = '';
        const modal = document.getElementById('tplEditModal'); if (modal) modal.style.display = 'flex';
    }

    closeEditModal() {
        const modal = document.getElementById('tplEditModal');
        if (modal) modal.style.display = 'none';
    }

    async handleSave() {
        try {
            const name = document.getElementById('tplName')?.value.trim();
            const channel = this.normalizeChannel(document.getElementById('tplChannelSelect')?.value || '');
            const subject = document.getElementById('tplTitle')?.value.trim();
            const body = document.getElementById('tplBody')?.value.trim();
            const active = document.getElementById('tplActive')?.value === 'true';
            const keyInput = this.getSelectWithCustomValue('tplKeySelect','tplKey');
            const localeInput = this.getSelectWithCustomValue('tplLocaleSelect','tplLocale');
            if (!name) throw new Error('请填写名称');
            if (!channel) throw new Error('请填写渠道');
            if (!this.isValidChannel(channel)) throw new Error('渠道不在允许范围（web/email/telegram/push/sms）');

            const template_key = keyInput || this.generateTemplateKey(name);
            const locale = localeInput || 'zh-CN';
            const payload = { template_key, locale, channel, name, subject, body, is_active: active };
            const res = await adminApi.adminCreateTemplate(payload);
            if (!res.success) throw new Error(res.message || '保存失败');
            this.app?.showToast && this.app.showToast('保存成功', 'success');
            this.closeEditModal();
            this.loadTemplates();
        } catch (e) {
            this.app?.showToast && this.app.showToast('保存失败：' + e.message, 'error');
        }
    }

    async handleSaveCurrent() {
        try {
            if (!this.currentEditingId) {
                throw new Error('无可编辑的当前版本（请从列表选择“编辑此版本”）');
            }
            if (!confirm('确定要直接修改当前版本吗？该操作将被审计。')) return;
            const name = document.getElementById('tplName')?.value.trim();
            const subject = document.getElementById('tplTitle')?.value.trim();
            const body = document.getElementById('tplBody')?.value.trim();
            const active = document.getElementById('tplActive')?.value === 'true';
            const payload = {};
            if (typeof name !== 'undefined') payload.name = name;
            if (typeof subject !== 'undefined') payload.subject = subject;
            if (typeof body !== 'undefined') payload.body = body;
            if (typeof active !== 'undefined') payload.is_active = active;
            const res = await adminApi.adminUpdateTemplate(this.currentEditingId, payload);
            if (!res.success) throw new Error(res.message || '保存失败');
            this.app?.showToast && this.app.showToast('当前版本已更新', 'success');
            this.closeEditModal();
            this.loadTemplates();
            this.loadLatest();
        } catch (e) {
            this.app?.showToast && this.app.showToast('保存失败：' + e.message, 'error');
        }
    }

    async deleteTemplate(id) {
        try {
            if (!confirm('确定删除该模板版本吗？激活版本不可删除。该操作将被审计。')) return;
            const res = await adminApi.adminDeleteTemplate(id);
            if (!res.success) throw new Error(res.message || '删除失败');
            this.app?.showToast && this.app.showToast('删除成功', 'success');
            this.loadTemplates();
        } catch (e) {
            this.app?.showToast && this.app.showToast('删除失败：' + e.message, 'error');
        }
    }

    async toggleTemplate(id, active) {
        try {
            const res = await adminApi.adminToggleTemplate(id, active);
            if (!res.success) throw new Error(res.message || '切换失败');
            this.app?.showToast && this.app.showToast('状态更新成功', 'success');
            this.loadTemplates();
            this.loadLatest();
        } catch (e) {
            this.app?.showToast && this.app.showToast('状态更新失败：' + e.message, 'error');
        }
    }

    async loadLatest() {
        try {
            const block = document.getElementById('tplLatest');
            const text = document.getElementById('tplLatestText');
            if (!block || !text) return;
            const { template_key, locale, channel } = this.filters || {};
            if (!template_key) {
                block.style.display = 'none';
                return;
            }
            const res = await adminApi.adminGetLatestTemplate({ template_key, locale, channel });
            if (!res.success || !res.data) {
                block.style.display = 'none';
                return;
            }
            const t = res.data;
            text.textContent = `最新激活: key=${t.template_key} / ${t.locale || '-'} / ${t.channel || '-'}，version=${t.version ?? '-'}，状态=${t.is_active ? '启用' : '禁用'}`;
            block.style.display = 'block';
        } catch (e) {
            const block = document.getElementById('tplLatest');
            if (block) block.style.display = 'none';
        }
    }

    async previewTemplate({ template_key, locale, channel }) {
        try {
            let variables = {};
            const varsEl = document.getElementById('tplVariables');
            if (varsEl && varsEl.value.trim()) {
                try {
                    variables = JSON.parse(varsEl.value.trim());
                } catch (_) {
                    throw new Error('变量 JSON 格式不正确');
                }
            }
            const res = await adminApi.adminPreviewTemplate({ template_key, locale, channel: this.normalizeChannel(channel), variables });
            if (!res.success) throw new Error(res.message || '预览失败');
            const { template, rendered } = res.data || {};
            const $s = document.getElementById('tplPreviewSubject');
            const $b = document.getElementById('tplPreviewBody');
            const $m = document.getElementById('tplPreviewModal');
            const $t = document.getElementById('tplPreviewTitle');
            if ($s) $s.textContent = rendered?.subject ?? template?.subject ?? '';
            if ($b) $b.textContent = rendered?.body ?? template?.body ?? '';
            if ($t) $t.textContent = `预览 - ${template_key}${locale ? ' / ' + locale : ''}${channel ? ' / ' + channel : ''}`;
            if ($m) $m.style.display = 'flex';
        } catch (e) {
            this.app?.showToast && this.app.showToast('预览失败：' + e.message, 'error');
        }
    }

    escape(text) {
        if (text == null) return '';
        return String(text).replace(/[&<>"]/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
    }

    generateTemplateKey(name) {
        if (!name) return '';
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .replace(/_{2,}/g, '_');
    }
}

export default TemplateManagement;


