# 📱 Telegram 快捷登录使用说明

## 🚀 功能概述

FitChallenge 平台现已支持 Telegram 快捷登录和注册功能，用户可以通过 Telegram 应用一键登录，无需输入邮箱和密码。

## 🔧 使用方法

### 1. 在 Telegram 应用中打开

**重要：** 要使用 Telegram 登录功能，必须在 Telegram 应用中打开网页，而不是在普通浏览器中。

#### 方法一：通过 Bot 链接
1. 在 Telegram 中搜索您的 Bot（例如：@fitchallenge_bot）
2. 发送 `/start` 命令
3. 点击 Bot 发送的网页链接

#### 方法二：通过分享链接
1. 将网页链接分享到 Telegram 聊天
2. 在 Telegram 中点击链接打开

### 2. 登录页面

在登录页面，您会看到：
- 传统的邮箱/密码登录表单
- **Telegram 快捷登录** 按钮（蓝色按钮，带有 Telegram 图标）

点击 **Telegram 快捷登录** 按钮即可一键登录。

### 3. 注册页面

在注册页面，您会看到：
- 传统的邮箱/密码注册表单
- **Telegram 快捷注册** 按钮

点击 **Telegram 快捷注册** 按钮即可一键注册新账户。

## 🎯 功能特点

### ✅ 快捷注册
- 自动创建用户账户
- 自动生成用户名和临时邮箱
- 无需手动输入密码
- 自动关联 Telegram 账户

### ✅ 快捷登录
- 一键登录，无需输入凭据
- 自动识别已注册用户
- 支持新用户自动注册

### ✅ 安全可靠
- 使用 Telegram 官方认证
- 时间戳验证（5分钟内有效）
- 支持签名验证（生产环境）

## 🧪 测试功能

我们提供了一个专门的测试页面来验证 Telegram 登录功能：

**测试页面：** `telegram-test.html`

### 测试步骤：
1. 在 Telegram 应用中打开测试页面
2. 检查 Telegram Web App 状态
3. 测试 Telegram 快捷登录
4. 测试获取 Bot 信息

## ⚠️ 注意事项

### 环境要求
- **必须在 Telegram 应用中打开**：普通浏览器无法使用此功能
- **需要网络连接**：用于与后端 API 通信
- **需要 Bot 配置**：后端需要配置正确的 Telegram Bot Token

### 常见问题

#### Q: 为什么显示"无法获取Telegram用户信息"？
**A:** 这通常意味着：
1. 页面不是在 Telegram 应用中打开的
2. 用户没有授权 Telegram 访问
3. Telegram Web App 脚本加载失败

#### Q: 为什么显示"请在Telegram应用中打开此页面"？
**A:** 这是正常的安全提示，确保功能只在 Telegram 环境中使用。

#### Q: 登录后如何修改用户信息？
**A:** 登录成功后，可以在个人资料页面修改用户名、邮箱等信息。

## 🔗 相关链接

- [Telegram Web App 文档](https://core.telegram.org/bots/webapps)
- [Telegram Bot API 文档](https://core.telegram.org/bots/api)
- [FitChallenge 主页](../index.html)

## 🔧 故障排除

### 使用环境检测工具
我们提供了一个专门的工具来帮助您诊断Telegram环境问题：

**检测页面：** `telegram-debug.html`

这个工具会：
- 检测Telegram脚本是否正确加载
- 检查WebApp是否正确初始化
- 验证用户数据是否可用
- 提供详细的调试信息

### 常见错误及解决方案

| 错误信息 | 原因 | 解决方案 |
|---------|------|----------|
| "无法获取Telegram用户信息" | 不在Telegram环境中 | 在Telegram应用中打开页面 |
| "Telegram脚本加载失败" | 网络问题或脚本加载失败 | 检查网络连接，刷新页面 |
| "平台检测：unknown" | 不在Telegram环境中 | 确保在Telegram中打开 |
| "用户数据不可用" | 未授权或环境问题 | 在Telegram中重新打开页面 |

### 调试步骤
1. **首先使用环境检测工具**：在Telegram中打开 `telegram-debug.html`
2. **检查控制台输出**：打开浏览器开发者工具查看控制台信息
3. **确认环境状态**：确保显示"平台检测：android/ios/desktop"而不是"unknown"
4. **测试API连接**：使用检测工具测试后端API是否正常

## 📞 技术支持

如果您在使用过程中遇到问题，请联系技术支持团队。
