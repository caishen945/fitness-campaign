# FitChallenge 环境变量和第三方API配置指南

## 📋 概述

本文档汇总了FitChallenge项目中需要配置的所有环境变量、第三方API以及相关配置项，方便您了解项目启动前需要准备的各项配置。

## 🔧 环境变量配置

### 基础服务器配置

| 环境变量 | 默认值 | 说明 | 是否必需 |
|---------|-------|------|---------|
| `NODE_ENV` | development | 运行环境 (development/production/test) | 否 |
| `PORT` | 3001 | 后端API服务器端口 | 否 |
| `ADMIN_PORT` | 8081 | 管理后台端口 | 否 |
| `FRONTEND_PORT` | 8080 | 前端服务器端口 | 否 |

### 数据库配置 (MySQL/MariaDB)

| 环境变量 | 默认值 | 说明 | 是否必需 |
|---------|-------|------|---------|
| `DB_HOST` | localhost | 数据库主机地址 | 否 |
| `DB_PORT` | 3306 | 数据库端口 | 否 |
| `DB_NAME` | fitchallenge | 数据库名称 | 否 |
| `DB_USER` | root | 数据库用户名 | 否 |
| `DB_PASSWORD` | (空) | 数据库密码 | **是** |

### JWT认证配置

| 环境变量 | 默认值 | 说明 | 是否必需 |
|---------|-------|------|---------|
| `JWT_SECRET` | your-secret-key | JWT密钥 | **是** |
| `JWT_EXPIRES_IN` | 24h | Token过期时间 | 否 |
| `JWT_EXPIRATION` | 24h | Token过期时间(后端配置) | 否 |

### 第三方API配置

#### Telegram Bot API

| 环境变量 | 默认值 | 说明 | 是否必需 |
|---------|-------|------|---------|
| `TELEGRAM_BOT_TOKEN` | (空) | Telegram Bot Token | **是** |
| `TELEGRAM_BOT_USERNAME` | (空) | Telegram Bot 用户名 | 否 |

#### 邮件服务配置 (SMTP)

| 环境变量 | 默认值 | 说明 | 是否必需 |
|---------|-------|------|---------|
| `SMTP_HOST` | (空) | SMTP服务器地址 | **是** |
| `SMTP_PORT` | 587 | SMTP端口 | 否 |
| `SMTP_USER` | (空) | SMTP用户名 | **是** |
| `SMTP_PASS` | (空) | SMTP密码 | **是** |

#### 支付网关配置

| 环境变量 | 默认值 | 说明 | 是否必需 |
|---------|-------|------|---------|
| `PAYMENT_GATEWAY` | test | 支付网关类型 | 否 |
| `PAYMENT_API_KEY` | (空) | 支付网关API密钥 | **是** |
| `PAYMENT_SECRET` | (空) | 支付网关密钥 | **是** |

#### 区块链钱包配置

| 环境变量 | 默认值 | 说明 | 是否必需 |
|---------|-------|------|---------|
| `TRC20_API_KEY` | your_trc20_api_key | TRC20钱包API密钥 | **是** |

### 文件上传配置

| 环境变量 | 默认值 | 说明 | 是否必需 |
|---------|-------|------|---------|
| `UPLOAD_MAX_SIZE` | 10mb | 文件上传最大尺寸 | 否 |
| `UPLOAD_ALLOWED_TYPES` | jpg,jpeg,png,gif | 允许的文件类型 | 否 |

### 日志配置

| 环境变量 | 默认值 | 说明 | 是否必需 |
|---------|-------|------|---------|
| `LOG_LEVEL` | info | 日志级别 | 否 |
| `LOG_FILE` | app.log | 日志文件名 | 否 |

### 缓存配置

| 环境变量 | 默认值 | 说明 | 是否必需 |
|---------|-------|------|---------|
| `CACHE_TTL` | 3600 | 缓存生存时间(秒) | 否 |

### 安全配置

| 环境变量 | 默认值 | 说明 | 是否必需 |
|---------|-------|------|---------|
| `CORS_ORIGIN` | * | 跨域允许源 | 否 |
| `RATE_LIMIT_WINDOW` | 900000 | 速率限制窗口(毫秒) | 否 |
| `RATE_LIMIT_MAX` | 100 | 速率限制最大请求数 | 否 |

## 🌐 第三方API服务

### 1. Telegram Bot API

**用途**: 用户身份验证、消息通知、Bot交互

**获取方式**:
1. 在Telegram中搜索 @BotFather
2. 发送 `/newbot` 创建新Bot
3. 按照指引设置Bot名称和用户名
4. 获得Bot Token

**配置示例**:
```env
TELEGRAM_BOT_TOKEN=123456789:AABBCCDDEEFFGGHHIIJJKKLLMMNNOOPPQQrr
TELEGRAM_BOT_USERNAME=YourBotName_bot
```

### 2. SMTP邮件服务

**用途**: 用户注册验证、找回密码、系统通知

**常用服务商**:
- Gmail: smtp.gmail.com:587
- Outlook: smtp-mail.outlook.com:587
- 腾讯企业邮箱: smtp.exmail.qq.com:587
- 阿里云邮箱: smtp.mxhichina.com:465

**配置示例**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. 区块链API (TRC20钱包)

**用途**: USDT充值/提现、钱包地址验证、交易查询

**推荐服务商**:
- TRON API: https://www.trongrid.io/
- TronWeb API
- 其他第三方区块链API服务

**配置示例**:
```env
TRC20_API_KEY=your_trc20_api_key_here
```

### 4. 支付网关

**用途**: 法币充值、在线支付处理

**常用支付网关**:
- 支付宝开放平台
- 微信支付
- PayPal API
- Stripe API

**配置示例**:
```env
PAYMENT_GATEWAY=stripe
PAYMENT_API_KEY=pk_test_xxxxxxxxxxxxx
PAYMENT_SECRET=sk_test_xxxxxxxxxxxxx
```

## 📁 配置文件位置

### 主配置文件
- `config/environment.js` - 主环境配置文件
- `backend/config/config.js` - 后端配置文件
- `backend/config/database.js` - 数据库配置文件

### API配置文件
- `config/api-config.js` - API端点配置
- `frontend/public/config/api-config.js` - 前端API配置
- `admin/public/config/api-config.js` - 管理后台API配置

## 🔒 .env 文件创建

在项目根目录创建 `.env` 文件：

```env
# 基础配置
NODE_ENV=development
PORT=3001
ADMIN_PORT=8081
FRONTEND_PORT=8080

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=fitchallenge
DB_USER=root
DB_PASSWORD=your_database_password

# JWT配置
JWT_SECRET=your_very_secure_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Telegram配置
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username

# 邮件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 支付配置
PAYMENT_GATEWAY=stripe
PAYMENT_API_KEY=your_payment_api_key
PAYMENT_SECRET=your_payment_secret

# 区块链配置
TRC20_API_KEY=your_trc20_api_key

# 安全配置
CORS_ORIGIN=http://localhost:8080,http://localhost:8081

# 文件上传配置
UPLOAD_MAX_SIZE=10mb
UPLOAD_ALLOWED_TYPES=jpg,jpeg,png,gif

# 日志配置
LOG_LEVEL=info
LOG_FILE=app.log

# 缓存配置
CACHE_TTL=3600

# 速率限制配置
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

## 🚀 配置优先级

1. **必须配置** (项目无法启动):
   - `DB_PASSWORD` - 数据库密码
   - `JWT_SECRET` - JWT密钥
   - `TELEGRAM_BOT_TOKEN` - Telegram Bot Token

2. **重要配置** (影响核心功能):
   - `SMTP_*` - 邮件服务配置
   - `TRC20_API_KEY` - 钱包功能配置
   - `PAYMENT_*` - 支付功能配置

3. **可选配置** (有默认值):
   - 所有端口配置
   - 日志和缓存配置
   - 文件上传配置

## 📝 配置检查清单

- [ ] 创建 `.env` 文件
- [ ] 配置数据库连接信息
- [ ] 设置JWT密钥
- [ ] 申请Telegram Bot Token
- [ ] 配置SMTP邮件服务
- [ ] 申请TRC20 API密钥
- [ ] 配置支付网关
- [ ] 测试所有第三方API连接
- [ ] 验证项目启动无错误

## ⚠️ 安全注意事项

1. **敏感信息保护**:
   - 不要将 `.env` 文件提交到版本控制
   - 定期更换API密钥
   - 使用强密码

2. **生产环境配置**:
   - 设置 `NODE_ENV=production`
   - 配置适当的CORS源
   - 启用HTTPS
   - 调整速率限制

3. **API密钥管理**:
   - 定期轮换密钥
   - 监控API使用情况
   - 设置合理的权限范围

## 📞 技术支持

如需获取第三方API或配置帮助，请联系开发团队或参考各服务商的官方文档。

---

**最后更新**: 2025年1月7日
**文档版本**: v1.0