# FitChallenge 管理后台使用指南

## 🚀 快速启动（Vite）

### 开发模式
```bash
cd admin
npm run dev
```

### 预览构建（本地端口 8081）
```bash
cd admin
npm run build
npm run serve
```

> 迁移说明：原 `start-admin-complete.bat` 与 `admin-api-server.js` 已废弃，现统一使用 Vite 开发与预览命令。

## 🔐 登录信息

- **访问地址**: http://localhost:8081
- **用户名**: admin
- **密码**: Admin123!@#

## 📊 功能模块

### 1. 仪表盘 (Dashboard)
- **功能**: 系统概览和统计数据
- **快捷键**: Ctrl+1
- **内容**: 
  - 总用户数统计
  - 总步数统计
  - 总奖励发放统计
  - 进行中的挑战统计

### 2. 用户管理 (User Management)
- **功能**: 管理平台用户
- **快捷键**: Ctrl+2
- **特性**:
  - ✅ 用户列表查看
  - ✅ 搜索功能 (用户名/邮箱)
  - ✅ 状态筛选 (活跃/非活跃)
  - ✅ 分页显示
  - ✅ 用户统计信息
  - ✅ 实时数据更新

### 3. VIP管理 (VIP Management)
- **功能**: 管理VIP等级系统
- **快捷键**: Ctrl+3
- **特性**:
  - ✅ VIP等级列表
  - ✅ 等级创建/编辑
  - ✅ 权益管理
  - ✅ 折扣设置
  - ✅ VIP挑战记录

### 4. 钱包管理 (Wallet Management)
- **功能**: 管理用户钱包
- **快捷键**: Ctrl+4
- **特性**:
  - ✅ 钱包列表查看
  - ✅ 余额统计
  - ✅ 充值/提现记录
  - ✅ 交易历史
  - ✅ 财务统计

### 5. 签到管理 (Check-in Management)
- **功能**: 管理用户签到
- **特性**:
  - ✅ 签到记录查看
  - ✅ 连续签到统计
  - ✅ 积分奖励记录
  - ✅ 签到趋势分析

### 6. PK挑战管理 (PK Challenge Management)
- **功能**: 管理挑战活动
- **快捷键**: Ctrl+5
- **特性**:
  - ✅ 挑战活动列表
  - ✅ 参与人数统计
  - ✅ 奖励池管理
  - ✅ 活动状态管理

### 7. 成就管理 (Achievement Management)
- **功能**: 管理成就系统
- **快捷键**: Ctrl+6
- **特性**:
  - ✅ 成就列表
  - ✅ 解锁统计
  - ✅ 积分奖励设置
  - ✅ 成就图标管理

### 8. 团队管理 (Team Management)
- **功能**: 管理用户团队
- **快捷键**: Ctrl+7
- **特性**:
  - ✅ 团队列表
  - ✅ 成员管理
  - ✅ 团队积分统计
  - ✅ 团队活动管理

## 🎯 高级功能

### 搜索和筛选
- **全局搜索**: 支持用户名、邮箱等字段搜索
- **状态筛选**: 按用户状态、VIP等级等筛选
- **日期范围**: 支持按时间范围筛选数据

### 数据统计
- **实时统计**: 所有模块都提供实时数据统计
- **图表展示**: 数据以图表形式直观展示
- **趋势分析**: 提供数据趋势分析功能

### 错误处理
- **网络错误**: 自动检测网络连接问题
- **重试机制**: 提供一键重试功能
- **用户反馈**: 友好的错误提示信息

### 用户体验
- **加载状态**: 异步操作显示加载动画
- **响应式设计**: 支持不同屏幕尺寸
- **快捷键**: 支持键盘快捷键操作

## 🔧 技术特性

### 前端技术
- **框架**: 原生JavaScript + ES6模块
- **样式**: Bootstrap 5 + 自定义CSS
- **图标**: Font Awesome 6
- **架构**: 模块化设计，易于维护

### 后端技术
- **框架**: Node.js + Express.js
- **API**: RESTful API设计
- **数据**: 模拟数据 + 真实API结构
- **CORS**: 支持跨域请求

### 数据管理
- **分页**: 支持大数据量分页显示
- **缓存**: 智能数据缓存机制
- **同步**: 实时数据同步更新

## 🚨 故障排除

### 常见问题

#### 1. 页面显示空白
**解决方案**:
- 检查浏览器控制台错误
- 确认后端API服务器已启动
- 刷新页面 (Ctrl+F5)

#### 2. 登录失败
**解决方案**:
- 确认用户名密码正确
- 检查网络连接
- 确认API服务器端口3002正常

#### 3. 数据加载失败
**解决方案**:
- 点击重试按钮
- 检查API服务器状态
- 查看浏览器网络面板

#### 4. 模块加载缓慢
**解决方案**:
- 等待加载完成
- 检查网络连接
- 刷新页面重试

### 调试工具
- **浏览器开发者工具**: F12 打开
- **网络面板**: 查看API请求状态
- **控制台**: 查看错误日志
- **完整系统测试**: 在仓库根目录执行 `node ./complete-system-test.js`（或 `--strict` 严格模式）

## 📈 性能优化

### 前端优化
- **模块懒加载**: 按需加载模块
- **数据缓存**: 智能缓存机制
- **防抖搜索**: 优化搜索性能

### 后端优化
- **连接池**: 数据库连接池管理
- **响应缓存**: API响应缓存
- **错误处理**: 完善的错误处理机制

## 🔮 未来规划

### 计划功能
- [ ] 实时数据推送
- [ ] 数据导出功能
- [ ] 批量操作功能
- [ ] 高级报表功能
- [ ] 移动端适配
- [ ] 多语言支持

### 技术升级
- [ ] 数据库集成
- [ ] 用户认证系统
- [ ] 权限管理
- [ ] 日志系统
- [ ] 监控告警

## 📞 技术支持

如有问题，请检查：
1. 服务是否正常启动
2. 网络连接是否正常
3. 浏览器控制台错误信息
4. API服务器日志

---

**FitChallenge 管理后台** - 专业的健身挑战平台管理工具 🏃‍♂️💪

## Backend startup (Windows PowerShell)

1. Create `backend/.env` with:

```text
PORT=3000
```

2. Start server:

```powershell
cd backend; npm start
```

3. Health check:

```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:3000/api/health' -Method GET | ConvertTo-Json -Depth 5
```

### 挑战超时检查服务（运维）

该服务负责定期扫描已到期的 `vip_challenges` 并根据规则发放奖励或进行押金扣减。默认关闭，可通过环境变量和管理接口控制。

- 环境变量
  - `CHALLENGE_TIMEOUT_ENABLED`：是否启用（默认 `false`）
  - `CHALLENGE_TIMEOUT_INTERVAL_MS`：扫描间隔（毫秒，默认 `300000` 即 5 分钟）

- 健康检查
  - `GET /api/health` 返回 `services.challengeTimeout` 字段，包含：
    - `isRunning`、`checkInterval`、`lastRunAt`、`lastSuccessAt`、`lastErrorAt`、`lastRunError`

- 管理接口（需管理员权限）
  - `GET  /api/admin/challenge-timeout/status` 查看状态
  - `POST /api/admin/challenge-timeout/start` 启动服务（若 `CHALLENGE_TIMEOUT_ENABLED=false`，会记录提示并保持不启动）
  - `POST /api/admin/challenge-timeout/stop` 停止服务
  - `POST /api/admin/challenge-timeout/run-once` 手动执行一次检查
  - `POST /api/admin/challenge-timeout/config` 调整间隔，示例：`{ "intervalMs": 60000 }`

注意：上述接口均需携带有效管理员令牌。

4. If port 3000 is busy:

```powershell
Get-NetTCPConnection -LocalPort 3000 | Select-Object -First 1 | ForEach-Object { Get-Process -Id $_.OwningProcess }
```