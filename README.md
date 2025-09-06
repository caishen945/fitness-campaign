# FitChallenge - 健康挑战平台

## 🏆 项目简介

FitChallenge 是一个创新的健康挑战平台，通过VIP等级挑战系统激励用户保持健康的生活方式。用户可以通过缴纳押金参与不同等级的步数挑战，完成目标后获得USDT奖励。

## ✨ 核心特性

### 🥇 VIP等级挑战系统
- **5个挑战等级**: 青铜、白银、黄金、钻石、王者
- **押金机制**: 不同等级对应不同押金金额
- **步数目标**: 从1000步到12000步的多样化挑战
- **USDT奖励**: 完成挑战获得丰厚奖励
- **投资回报**: 清晰的投资回报率计算

### 🎯 挑战机制
- **每日挑战**: 24小时内完成步数目标
- **进度跟踪**: 实时显示挑战进度和剩余时间
- **自动完成**: 达到目标后自动完成挑战
- **奖励发放**: 完成挑战后自动发放USDT奖励

### 👥 社交功能
- **团队协作**: 与好友组队共同挑战
- **PK对决**: 用户之间的步数对决
- **排行榜**: 多维度排名竞争
- **成就系统**: 33个徽章和荣誉体系

### 💰 经济模型
- **押金挑战**: 通过押金确保用户参与度
- **风险控制**: 合理的押金和奖励比例
- **等级分化**: 满足不同用户的需求和预算
- **USDT集成**: 区块链支付和奖励

## 🚀 快速开始

### 环境要求
- Node.js 16+
- MySQL 8.0+
- Redis 6.0+
- WSL 2 (Windows用户)

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/fitchallenge.git
cd fitchallenge
```

2. **安装依赖**
```bash
# 后端依赖
cd backend
npm install

# 前端依赖
cd ../frontend
npm install

# 管理后台依赖
cd ../admin
npm install
```

3. **配置数据库 (WSL Ubuntu)**
```bash
# 启动MySQL服务
wsl -d Ubuntu-22.04 --exec sudo systemctl start mysql

# 创建数据库和用户
wsl -d Ubuntu-22.04 --exec sudo mysql -e "CREATE DATABASE IF NOT EXISTS fitchallenge;"
wsl -d Ubuntu-22.04 --exec sudo mysql -e "CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY 'fitchallenge123';"
wsl -d Ubuntu-22.04 --exec sudo mysql -e "GRANT ALL PRIVILEGES ON fitchallenge.* TO 'root'@'localhost';"
wsl -d Ubuntu-22.04 --exec sudo mysql -e "FLUSH PRIVILEGES;"

# 导入数据库结构
mysql -u root -p fitchallenge < database/schema.sql
```

4. **配置Redis (WSL Ubuntu)**
```bash
# 启动Redis服务
wsl -d Ubuntu-22.04 --exec sudo systemctl start redis-server
```

5. **配置环境变量**
```bash
# 后端配置
cd backend
cp env.template .env
# 编辑 .env 文件，配置数据库连接等信息
```

6. **启动服务**
```bash
# 启动后端服务
cd backend
node start-server-simple.js

# 启动前端服务
cd frontend
npm run dev

# 启动管理后台
cd admin
npm run dev
```

7. **访问应用**
- 后端API: http://localhost:3000
- 前端应用: http://localhost:8080
- 管理后台: http://localhost:8081
- API文档: http://localhost:3000/api/docs

## 🏗️ 系统架构

### 后端架构
```
backend/
├── config/          # 配置文件
├── controllers/     # 控制器层
├── models/         # 数据模型
├── routes/         # 路由定义
├── services/       # 业务逻辑层
├── middleware/     # 中间件
├── websocket/      # WebSocket服务
└── utils/          # 工具函数
```

### 前端架构
```
frontend/
├── public/         # 静态资源
├── src/            # 源代码
│   ├── components/ # 组件
│   ├── pages/      # 页面
│   ├── services/   # 服务层
│   └── utils/      # 工具函数
└── style.css       # 样式文件
```

### 数据库设计
- **用户表**: 用户基本信息
- **VIP等级表**: 挑战等级配置
- **用户VIP状态表**: 用户VIP状态和统计
- **VIP挑战表**: 挑战记录和进度
- **步数记录表**: 用户步数数据
- **团队表**: 团队信息
- **钱包交易表**: USDT交易记录
- **成就表**: 成就系统数据

## 📱 功能模块

### 1. 用户认证
- 用户注册/登录
- JWT Token认证
- 密码加密存储 (bcrypt)
- 用户权限管理

### 2. VIP等级管理
- 等级配置管理
- 押金和奖励设置
- 步数目标配置
- 挑战次数限制

### 3. 挑战系统
- 挑战创建和参与
- 步数进度跟踪
- 挑战状态管理
- 自动完成检测

### 4. 钱包系统
- USDT余额管理
- 押金缴纳和退还
- 奖励发放
- 交易记录

### 5. 签到系统
- 每日签到功能
- 连续签到奖励
- 签到统计

### 6. 成就系统
- 33个成就徽章
- 成就进度跟踪
- 成就奖励发放

### 7. 数据统计
- 挑战完成率统计
- 用户活跃度分析
- 排行榜系统
- 投资回报率计算

## 🔧 技术栈

### 后端
- **Node.js**: 运行环境
- **Express**: Web框架
- **MySQL**: 关系型数据库
- **Redis**: 缓存和会话存储
- **JWT**: 身份认证
- **bcrypt**: 密码加密
- **WebSocket**: 实时通信

## 🛡️ 系统修改影响评估

### 快速开始

在进行任何系统修改前，请先使用我们的影响评估工具：

```bash
# 系统健康检查
npm run health-check

# 查看影响分析指南
npm run impact-analysis

# 修改前的完整检查
npm run pre-deploy
```

### 影响评估文档

- **[快速指南](IMPACT_ASSESSMENT_QUICK_GUIDE.md)** - 5分钟了解基本流程
- **[完整框架](.tasks/Impact_Analysis_Framework.md)** - 详细的评估体系

### 风险等级说明

- 🔴 **高风险**: 必须使用完整RIPER-5流程 (数据库结构变更、认证修改等)
- 🟡 **中风险**: 需要标准评估流程 (新功能添加、API修改等)  
- 🟢 **低风险**: 简化评估即可 (文案修改、注释更新等)

### 前端
- **原生JavaScript**: 核心语言
- **CSS3**: 样式设计
- **HTML5**: 页面结构
- **Font Awesome**: 图标库
- **响应式设计**: 移动端适配

### 管理后台
- **React**: 前端框架
- **Ant Design**: UI组件库
- **Axios**: HTTP客户端
- **Chart.js**: 数据可视化

## 📊 API接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户资料

### 钱包接口
- `GET /api/wallet/info` - 获取钱包信息
- `GET /api/wallet/transactions` - 获取交易记录
- `POST /api/wallet/withdraw` - 申请提现

### 签到接口
- `POST /api/checkin` - 用户签到

### 成就接口
- `GET /api/achievements/user/achievements` - 获取用户成就
- `POST /api/achievements/user/claim/:achievementId` - 领取成就奖励

### VIP接口
- `GET /api/admin/vip-levels` - 获取VIP等级列表
- `GET /api/admin/vip-challenges` - 获取VIP挑战列表

详细的API文档请参考: [API接口文档.md](API接口文档.md)

## 🎨 界面预览

### VIP等级展示
- 精美的等级卡片设计
- 渐变色彩和图标
- 清晰的价格和奖励信息
- 投资回报率显示

### 挑战进度
- 实时进度条显示
- 剩余步数和时间
- 挑战状态标识
- 操作按钮布局

### 用户仪表板
- VIP状态概览
- 挑战统计信息
- 收益分析图表
- 快速操作入口

## 🔒 安全特性

- **JWT认证**: 安全的身份验证
- **密码加密**: bcrypt哈希加密
- **输入验证**: 严格的数据验证
- **权限控制**: 基于角色的访问控制
- **SQL注入防护**: 参数化查询
- **CORS配置**: 跨域安全控制

## 📈 性能优化

- **数据库索引**: 优化查询性能
- **Redis缓存**: 缓存热点数据
- **分页查询**: 大数据量分页处理
- **异步处理**: 非阻塞操作
- **连接池**: 数据库连接优化

## 🚀 部署指南

### 开发环境 (Windows + WSL)
1. **安装WSL 2**
```bash
wsl --install -d Ubuntu-22.04
```

2. **配置Docker Desktop**
- 启用WSL 2后端
- 配置资源分配

3. **安装服务**
```bash
# 在WSL中安装MySQL和Redis
wsl -d Ubuntu-22.04 --exec sudo apt update
wsl -d Ubuntu-22.04 --exec sudo apt install -y mysql-server redis-server
```

### 生产环境部署
1. **服务器配置**
   - 推荐配置: 2核4G内存
   - 操作系统: Ubuntu 20.04+
   - 数据库: MySQL 8.0+
   - 缓存: Redis 6.0+

2. **环境配置**
   - 配置生产环境变量
   - 设置数据库连接池
   - 配置日志记录
   - 设置监控告警

3. **服务启动**
   - 使用PM2管理进程
   - 配置Nginx反向代理
   - 设置SSL证书
   - 配置防火墙规则

### Docker部署
```bash
# 构建镜像
docker build -t fitchallenge .

# 运行容器
docker run -d -p 3000:3000 fitchallenge
```

## 🧪 测试

### 运行完整系统测试
```bash
cd backend
node test-complete-system.js
```

### 测试覆盖范围
- ✅ 用户认证系统
- ✅ 钱包功能
- ✅ 签到系统
- ✅ 成就系统
- ✅ VIP等级系统
- ✅ 数据库连接
- ✅ Redis缓存

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 贡献方式
1. **提交Issue**: 报告bug或提出新功能建议
2. **提交PR**: 修复bug或实现新功能
3. **完善文档**: 改进代码注释和文档
4. **分享经验**: 在社区分享使用经验

### 开发流程
1. Fork项目到个人仓库
2. 创建功能分支
3. 提交代码变更
4. 创建Pull Request
5. 等待代码审查

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系我们

- **项目地址**: https://github.com/your-username/fitchallenge
- **问题反馈**: https://github.com/your-username/fitchallenge/issues
- **邮箱联系**: support@fitchallenge.com
- **技术交流**: 加入我们的技术交流群

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

**FitChallenge** - 让健康挑战更有趣，让运动更有价值！ 🏃‍♂️💪
