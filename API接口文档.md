# FitChallenge API接口文档

## 📋 目录
- [概述](#概述)
- [基础信息](#基础信息)
- [认证API](#认证api)
- [用户前端API](#用户前端api)
- [管理员API](#管理员api)
- [数据库表结构](#数据库表结构)
- [错误代码](#错误代码)
- [使用示例](#使用示例)

## 🎯 概述

FitChallenge是一个健身挑战平台，提供用户健身管理、团队协作、成就系统等功能。本文档详细描述了所有可用的API接口。

**服务器地址**: `http://localhost:3002`
**API版本**: v1
**数据格式**: JSON
**认证方式**: JWT Token / 简化Token

## 🔧 基础信息

### 请求头
```http
Content-Type: application/json
Authorization: Bearer {token}  # 需要认证的接口
```

### 响应格式
```json
{
  "success": true/false,
  "message": "操作结果描述",
  "data": {}, // 具体数据
  "token": "用户token", // 认证接口返回
  "user": {} // 用户信息
}
```

### 状态码
- `200`: 成功
- `400`: 请求参数错误
- `401`: 未授权
- `404`: 接口不存在
- `500`: 服务器内部错误

## 🔐 认证API

### 用户注册
- **接口**: `POST /api/auth/register`
- **位置**: `backend/admin-api-server-mysql.js:line 50-100`
- **功能**: 创建新用户账户，自动初始化钱包
- **请求参数**:
  ```json
  {
    "email": "user@example.com",
    "password": "123456",
    "username": "用户名"
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "message": "注册成功",
    "token": "user_123_1703123456789",
    "user": {
      "id": 123,
      "email": "user@example.com",
      "username": "用户名",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
  ```
- **数据库操作**: 
  - 插入`users`表
  - 创建`user_wallets`记录
  - 生成用户token

### 用户登录
- **接口**: `POST /api/auth/login`
- **位置**: `backend/admin-api-server-mysql.js:line 20-49`
- **功能**: 验证用户凭据，返回认证信息
- **请求参数**:
  ```json
  {
    "email": "user@example.com",
    "password": "123456"
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "message": "登录成功",
    "token": "user_123_1703123456789",
    "user": {
      "id": 123,
      "email": "user@example.com",
      "username": "用户名"
    }
  }
  ```
- **认证逻辑**: 简化密码验证（password === '123456'）

### 管理员登录
- **接口**: `POST /api/admin/auth/login`
- **位置**: `backend/admin-api-server-mysql.js:line 102-130`
- **功能**: 管理员身份验证
- **请求参数**:
  ```json
  {
    "username": "admin",
    "password": "Admin123!@#"
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "message": "登录成功",
    "token": "admin_jwt_token",
    "admin": {
      "id": 1,
      "username": "admin",
      "role": "admin"
    }
  }
  ```
- **认证逻辑**: 简化密码验证（password === 'Admin123!@#'）

## 👤 用户前端API

### 钱包信息
- **接口**: `GET /api/wallet/info`
- **位置**: `backend/admin-api-server-mysql.js:line 132-160`
- **功能**: 获取用户钱包余额和统计信息
- **认证**: 需要用户token
- **请求头**: `Authorization: Bearer {token}`
- **响应示例**:
  ```json
  {
    "success": true,
    "data": {
      "balance": 1000.00,
      "total_commission": 500.00,
      "total_rewards": 300.00,
      "today_earnings": 50.00
    }
  }
  ```
- **数据库查询**: `user_wallets`表 + `wallet_transactions`表

### 钱包交易记录
- **接口**: `GET /api/wallet/transactions`
- **位置**: `backend/admin-api-server-mysql.js:line 162-200`
- **功能**: 获取用户钱包交易历史
- **认证**: 需要用户token
- **查询参数**:
  - `page`: 页码（默认1）
  - `limit`: 每页数量（默认10）
  - `type`: 交易类型（可选）
- **响应示例**:
  ```json
  {
    "success": true,
    "data": {
      "transactions": [
        {
          "id": 1,
          "type": "checkin_reward",
          "amount": 10.00,
          "description": "每日签到奖励",
          "created_at": "2024-01-01T00:00:00.000Z"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 1
      }
    }
  }
  ```

### 签到功能
- **接口**: `POST /api/checkin`
- **位置**: `backend/admin-api-server-mysql.js:line 202-250`
- **功能**: 用户每日签到，获得奖励
- **认证**: 需要用户token
- **请求参数**: 无（自动获取用户信息）
- **响应示例**:
  ```json
  {
    "success": true,
    "message": "签到成功",
    "data": {
      "reward": 10.00,
      "consecutive_days": 5,
      "total_checkins": 15
    }
  }
  ```
- **数据库操作**: 
  - 检查`user_checkins`表
  - 更新`user_wallets`余额
  - 记录`wallet_transactions`

### 签到信息查询
- **接口**: `GET /api/checkin/info`
- **位置**: `backend/admin-api-server-mysql.js:line 252-280`
- **功能**: 获取用户签到统计信息
- **认证**: 需要用户token
- **响应示例**:
  ```json
  {
    "success": true,
    "data": {
      "total_checkins": 15,
      "consecutive_days": 5,
      "longest_streak": 10,
      "last_checkin": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### PK挑战列表
- **接口**: `GET /api/pk/challenges`
- **位置**: `backend/admin-api-server-mysql.js:line 282-320`
- **功能**: 获取用户的PK挑战记录
- **认证**: 需要用户token
- **响应示例**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "challenger_name": "挑战者",
        "challenged_name": "被挑战者",
        "step_target": 10000,
        "current_steps": 8000,
        "status": "active",
        "start_date": "2024-01-01T00:00:00.000Z",
        "end_date": "2024-01-07T00:00:00.000Z",
        "isChallenged": true
      }
    ]
  }
  ```

### PK用户搜索
- **接口**: `GET /api/pk/users/search`
- **位置**: `backend/admin-api-server-mysql.js:line 322-350`
- **功能**: 搜索可挑战的用户
- **认证**: 需要用户token
- **查询参数**:
  - `q`: 搜索关键词（用户名或邮箱）
- **响应示例**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 2,
        "username": "用户2",
        "email": "user2@example.com"
      }
    ]
  }
  ```

### 用户成就
- **接口**: `GET /api/achievements/user/achievements`
- **位置**: `backend/admin-api-server-mysql.js:line 352-390`
- **功能**: 获取用户成就列表
- **认证**: 需要用户token
- **响应示例**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "首次签到",
        "description": "完成第一次签到",
        "progress": 1,
        "target": 1,
        "reward_amount": 10.00,
        "reward_claimed": true,
        "isCompleted": true,
        "icon": "checkin.png"
      }
    ]
  }
  ```

### 团队信息
- **接口**: `GET /api/team/info`
- **位置**: `backend/admin-api-server-mysql.js:line 392-430`
- **功能**: 获取用户团队信息
- **认证**: 需要用户token
- **响应示例**:
  ```json
  {
    "success": true,
    "data": {
      "team_id": 1,
      "team_name": "健身团队",
      "member_count": 5,
      "total_steps": 50000,
      "average_steps": 10000,
      "last_updated": "2024-01-01T00:00:00.000Z",
      "members": [
        {
          "id": 1,
          "username": "队长",
          "steps": 12000
        }
      ]
    }
  }
  ```

### VIP挑战
- **接口**: `GET /api/user/vip-challenge/current`
- **位置**: `backend/admin-api-server-mysql.js:line 432-470`
- **功能**: 获取用户当前VIP挑战信息
- **认证**: 需要用户token
- **响应示例**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "vip_level": "Gold",
      "step_target": 15000,
      "current_steps": 12000,
      "progress": 80,
      "reward_amount": 100.00,
      "start_date": "2024-01-01T00:00:00.000Z",
      "end_date": "2024-01-31T00:00:00.000Z",
      "status": "active"
    }
  }
  ```

### 新闻资讯
- **接口**: `GET /api/news`
- **位置**: `backend/admin-api-server-mysql.js:line 472-510`
- **功能**: 获取平台新闻资讯
- **认证**: 无需认证
- **查询参数**:
  - `page`: 页码（默认1）
  - `limit`: 每页数量（默认10）
- **响应示例**:
  ```json
  {
    "success": true,
    "data": {
      "news": [
        {
          "id": 1,
          "title": "健身挑战活动开始",
          "content": "新一轮健身挑战活动正式开始...",
          "image_url": "news1.jpg",
          "published_at": "2024-01-01T00:00:00.000Z"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 1
      }
    }
  }
  ```

## 👨‍💼 管理员API

### 用户管理

#### 获取用户列表
- **接口**: `GET /api/admin/users`
- **位置**: `backend/admin-api-server-mysql.js:line 512-550`
- **功能**: 获取所有用户信息
- **认证**: 需要管理员token
- **查询参数**:
  - `page`: 页码
  - `limit`: 每页数量
  - `search`: 搜索关键词
- **响应示例**:
  ```json
  {
    "success": true,
    "data": {
      "users": [
        {
          "id": 1,
          "email": "user@example.com",
          "username": "用户名",
          "created_at": "2024-01-01T00:00:00.000Z",
          "last_login": "2024-01-01T00:00:00.000Z"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 1
      }
    }
  }
  ```

#### 获取用户详情
- **接口**: `GET /api/admin/users/:id`
- **位置**: `backend/admin-api-server-mysql.js:line 552-590`
- **功能**: 获取指定用户的详细信息
- **认证**: 需要管理员token
- **路径参数**: `:id` - 用户ID
- **响应示例**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": 1,
        "email": "user@example.com",
        "username": "用户名",
        "wallet": {
          "balance": 1000.00,
          "total_commission": 500.00
        },
        "statistics": {
          "total_checkins": 15,
          "total_steps": 50000
        }
      }
    }
  }
  ```

#### 更新用户信息
- **接口**: `PUT /api/admin/users/:id`
- **位置**: `backend/admin-api-server-mysql.js:line 592-630`
- **功能**: 更新用户信息
- **认证**: 需要管理员token
- **请求参数**:
  ```json
  {
    "username": "新用户名",
    "email": "newemail@example.com"
  }
  ```

#### 删除用户
- **接口**: `DELETE /api/admin/users/:id`
- **位置**: `backend/admin-api-server-mysql.js:line 632-670`
- **功能**: 删除指定用户
- **认证**: 需要管理员token

### VIP等级管理

#### 获取VIP等级列表
- **接口**: `GET /api/admin/vip-levels`
- **位置**: `backend/admin-api-server-mysql.js:line 672-710`
- **功能**: 获取所有VIP等级配置
- **认证**: 需要管理员token

#### 创建VIP等级
- **接口**: `POST /api/admin/vip-levels`
- **位置**: `backend/admin-api-server-mysql.js:line 712-750`
- **功能**: 创建新的VIP等级
- **认证**: 需要管理员token
- **请求参数**:
  ```json
  {
    "name": "Gold",
    "step_requirement": 15000,
    "reward_amount": 100.00,
    "benefits": "专属奖励和特权"
  }
  ```

#### 更新VIP等级
- **接口**: `PUT /api/admin/vip-levels/:id`
- **位置**: `backend/admin-api-server-mysql.js:line 752-790`
- **功能**: 更新VIP等级配置
- **认证**: 需要管理员token

#### 删除VIP等级
- **接口**: `DELETE /api/admin/vip-levels/:id`
- **位置**: `backend/admin-api-server-mysql.js:line 792-830`
- **功能**: 删除指定VIP等级
- **认证**: 需要管理员token

### 成就管理

#### 获取成就类型列表
- **接口**: `GET /api/admin/achievement-types`
- **位置**: `backend/admin-api-server-mysql.js:line 832-870`
- **功能**: 获取所有成就类型
- **认证**: 需要管理员token

#### 创建成就类型
- **接口**: `POST /api/admin/achievement-types`
- **位置**: `backend/admin-api-server-mysql.js:line 872-910`
- **功能**: 创建新的成就类型
- **认证**: 需要管理员token
- **请求参数**:
  ```json
  {
    "name": "连续签到",
    "description": "连续签到7天",
    "target_value": 7,
    "reward_amount": 50.00,
    "icon": "streak.png"
  }
  ```

#### 更新成就类型
- **接口**: `PUT /api/admin/achievement-types/:id`
- **位置**: `backend/admin-api-server-mysql.js:line 912-950`
- **功能**: 更新成就类型配置
- **认证**: 需要管理员token

#### 删除成就类型
- **接口**: `DELETE /api/admin/achievement-types/:id`
- **位置**: `backend/admin-api-server-mysql.js:line 952-990`
- **功能**: 删除指定成就类型
- **认证**: 需要管理员token

### 团队管理

#### 获取团队列表
- **接口**: `GET /api/admin/teams`
- **位置**: `backend/admin-api-server-mysql.js:line 992-1030`
- **功能**: 获取所有团队信息
- **认证**: 需要管理员token

#### 获取团队详情
- **接口**: `GET /api/admin/teams/:id`
- **位置**: `backend/admin-api-server-mysql.js:line 1032-1070`
- **功能**: 获取指定团队的详细信息
- **认证**: 需要管理员token

#### 创建团队
- **接口**: `POST /api/admin/teams`
- **位置**: `backend/admin-api-server-mysql.js:line 1072-1110`
- **功能**: 创建新团队
- **认证**: 需要管理员token
- **请求参数**:
  ```json
  {
    "name": "新团队",
    "leader_id": 1,
    "description": "团队描述"
  }
  ```

#### 更新团队信息
- **接口**: `PUT /api/admin/teams/:id`
- **位置**: `backend/admin-api-server-mysql.js:line 1112-1150`
- **功能**: 更新团队信息
- **认证**: 需要管理员token

#### 删除团队
- **接口**: `DELETE /api/admin/teams/:id`
- **位置**: `backend/admin-api-server-mysql.js:line 1152-1190`
- **功能**: 删除指定团队
- **认证**: 需要管理员token

### PK挑战管理

#### 获取PK挑战列表
- **接口**: `GET /api/admin/pk-challenges`
- **位置**: `backend/admin-api-server-mysql.js:line 1192-1230`
- **功能**: 获取所有PK挑战记录
- **认证**: 需要管理员token

#### 获取PK挑战详情
- **接口**: `GET /api/admin/pk-challenges/:id`
- **位置**: `backend/admin-api-server-mysql.js:line 1232-1270`
- **功能**: 获取指定PK挑战的详细信息
- **认证**: 需要管理员token

#### 创建PK挑战
- **接口**: `POST /api/admin/pk-challenges`
- **位置**: `backend/admin-api-server-mysql.js:line 1272-1310`
- **功能**: 创建新的PK挑战
- **认证**: 需要管理员token
- **请求参数**:
  ```json
  {
    "challenger_id": 1,
    "challenged_id": 2,
    "step_target": 10000,
    "start_date": "2024-01-01",
    "end_date": "2024-01-07"
  }
  ```

#### 更新PK挑战
- **接口**: `PUT /api/admin/pk-challenges/:id`
- **位置**: `backend/admin-api-server-mysql.js:line 1312-1350`
- **功能**: 更新PK挑战信息
- **认证**: 需要管理员token

#### 删除PK挑战
- **接口**: `DELETE /api/admin/pk-challenges/:id`
- **位置**: `backend/admin-api-server-mysql.js:line 1352-1390`
- **功能**: 删除指定PK挑战
- **认证**: 需要管理员token

### 新闻管理

#### 获取新闻列表
- **接口**: `GET /api/admin/news`
- **位置**: `backend/admin-api-server-mysql.js:line 1392-1430`
- **功能**: 获取所有新闻文章
- **认证**: 需要管理员token

#### 获取新闻详情
- **接口**: `GET /api/admin/news/:id`
- **位置**: `backend/admin-api-server-mysql.js:line 1432-1470`
- **功能**: 获取指定新闻的详细信息
- **认证**: 需要管理员token

#### 创建新闻
- **接口**: `POST /api/admin/news`
- **位置**: `backend/admin-api-server-mysql.js:line 1472-1510`
- **功能**: 创建新的新闻文章
- **认证**: 需要管理员token
- **请求参数**:
  ```json
  {
    "title": "新闻标题",
    "content": "新闻内容",
    "image_url": "news.jpg",
    "is_published": true
  }
  ```

#### 更新新闻
- **接口**: `PUT /api/admin/news/:id`
- **位置**: `backend/admin-api-server-mysql.js:line 1512-1550`
- **功能**: 更新新闻信息
- **认证**: 需要管理员token

#### 删除新闻
- **接口**: `DELETE /api/admin/news/:id`
- **位置**: `backend/admin-api-server-mysql.js:line 1552-1590`
- **功能**: 删除指定新闻
- **认证**: 需要管理员token

### 统计报表

#### 平台统计概览
- **接口**: `GET /api/admin/statistics/overview`
- **位置**: `backend/admin-api-server-mysql.js:line 1592-1630`
- **功能**: 获取平台整体统计数据
- **认证**: 需要管理员token
- **响应示例**:
  ```json
  {
    "success": true,
    "data": {
      "total_users": 100,
      "total_teams": 20,
      "total_challenges": 50,
      "total_rewards": 5000.00,
      "active_users_today": 30,
      "new_users_this_month": 15
    }
  }
  ```

#### 用户活跃度统计
- **接口**: `GET /api/admin/statistics/user-activity`
- **位置**: `backend/admin-api-server-mysql.js:line 1632-1670`
- **功能**: 获取用户活跃度数据
- **认证**: 需要管理员token

#### 收入统计
- **接口**: `GET /api/admin/statistics/revenue`
- **位置**: `backend/admin-api-server-mysql.js:line 1672-1710`
- **功能**: 获取平台收入统计数据
- **认证**: 需要管理员token

## 🗄️ 数据库表结构

### 核心表

#### users - 用户表
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL
);
```

#### user_wallets - 用户钱包表
```sql
CREATE TABLE user_wallets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0.00,
  total_commission DECIMAL(10,2) DEFAULT 0.00,
  total_rewards DECIMAL(10,2) DEFAULT 0.00,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### wallet_transactions - 钱包交易记录表
```sql
CREATE TABLE wallet_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('checkin_reward', 'pk_reward', 'achievement_reward', 'commission'),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### user_checkins - 用户签到表
```sql
CREATE TABLE user_checkins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  checkin_date DATE NOT NULL,
  consecutive_days INT DEFAULT 1,
  reward_amount DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_user_date (user_id, checkin_date)
);
```

#### pk_challenges - PK挑战表
```sql
CREATE TABLE pk_challenges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  challenger_id INT NOT NULL,
  challenged_id INT NOT NULL,
  step_target INT NOT NULL,
  challenger_steps INT DEFAULT 0,
  challenged_steps INT DEFAULT 0,
  status ENUM('pending', 'active', 'completed', 'cancelled') DEFAULT 'pending',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (challenger_id) REFERENCES users(id),
  FOREIGN KEY (challenged_id) REFERENCES users(id)
);
```

#### user_achievements - 用户成就表
```sql
CREATE TABLE user_achievements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  achievement_type_id INT NOT NULL,
  current_value INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  is_claimed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (achievement_type_id) REFERENCES achievement_types(id)
);
```

#### team_statistics - 团队统计表
```sql
CREATE TABLE team_statistics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  team_id INT NOT NULL,
  total_steps BIGINT DEFAULT 0,
  member_count INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### team_relationships - 团队成员关系表
```sql
CREATE TABLE team_relationships (
  id INT PRIMARY KEY AUTO_INCREMENT,
  leader_id INT NOT NULL,
  member_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (leader_id) REFERENCES users(id),
  FOREIGN KEY (member_id) REFERENCES users(id),
  UNIQUE KEY unique_team_member (leader_id, member_id)
);
```

#### vip_challenge_stats - VIP挑战统计表
```sql
CREATE TABLE vip_challenge_stats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  vip_level_id INT NOT NULL,
  step_target INT NOT NULL,
  current_steps INT DEFAULT 0,
  status ENUM('active', 'completed', 'failed') DEFAULT 'active',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (vip_level_id) REFERENCES vip_levels(id)
);
```

#### news - 新闻表
```sql
CREATE TABLE news (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(500),
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### achievement_types - 成就类型表
```sql
CREATE TABLE achievement_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  target_value INT NOT NULL,
  reward_amount DECIMAL(10,2) DEFAULT 0.00,
  icon VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### vip_levels - VIP等级表
```sql
CREATE TABLE vip_levels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  step_requirement INT NOT NULL,
  reward_amount DECIMAL(10,2) DEFAULT 0.00,
  benefits TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### admin_users - 管理员用户表
```sql
CREATE TABLE admin_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'super_admin') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## ❌ 错误代码

### 通用错误
- `400`: 请求参数错误
- `401`: 未授权访问
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

### 业务错误
- `USER_NOT_FOUND`: 用户不存在
- `INVALID_CREDENTIALS`: 凭据无效
- `EMAIL_EXISTS`: 邮箱已存在
- `USERNAME_EXISTS`: 用户名已存在
- `WALLET_NOT_FOUND`: 钱包不存在
- `ALREADY_CHECKED_IN`: 今日已签到
- `CHALLENGE_NOT_FOUND`: 挑战不存在
- `INSUFFICIENT_PERMISSIONS`: 权限不足

## 💡 使用示例

### 前端JavaScript调用示例

#### 用户登录
```javascript
const loginData = {
  email: 'user@example.com',
  password: '123456'
};

try {
  const response = await fetch('http://localhost:3002/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(loginData)
  });
  
  const result = await response.json();
  
  if (result.success) {
    // 保存token和用户信息
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    // 跳转到主页
    window.location.href = '/home';
  } else {
    alert(result.message);
  }
} catch (error) {
  console.error('登录失败:', error);
}
```

#### 获取钱包信息
```javascript
const token = localStorage.getItem('token');

try {
  const response = await fetch('http://localhost:3002/api/wallet/info', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const result = await response.json();
  
  if (result.success) {
    const walletInfo = result.data;
    console.log('余额:', walletInfo.balance);
    console.log('今日收益:', walletInfo.today_earnings);
  }
} catch (error) {
  console.error('获取钱包信息失败:', error);
}
```

#### 用户签到
```javascript
const token = localStorage.getItem('token');

try {
  const response = await fetch('http://localhost:3002/api/checkin', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const result = await response.json();
  
  if (result.success) {
    alert(`签到成功！获得奖励: ${result.data.reward}元`);
    // 刷新钱包信息
    updateWalletInfo();
  } else {
    alert(result.message);
  }
} catch (error) {
  console.error('签到失败:', error);
}
```

### PowerShell测试示例

#### 测试用户登录
```powershell
$loginData = @{
  email = "user@example.com"
  password = "123456"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3002/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
Write-Host "登录结果: $($response | ConvertTo-Json -Depth 3)"
```

#### 测试获取钱包信息
```powershell
$token = "user_123_1703123456789"
$headers = @{
  "Authorization" = "Bearer $token"
  "Content-Type" = "application/json"
}

$response = Invoke-RestMethod -Uri "http://localhost:3002/api/wallet/info" -Method GET -Headers $headers
Write-Host "钱包信息: $($response | ConvertTo-Json -Depth 3)"
```

#### 测试管理员登录
```powershell
$adminData = @{
  username = "admin"
  password = "Admin123!@#"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3002/api/admin/auth/login" -Method POST -Body $adminData -ContentType "application/json"
Write-Host "管理员登录结果: $($response | ConvertTo-Json -Depth 3)"
```

## 🔧 开发工具

### 测试页面
- `frontend/public/test-fixed.html` - 登录注册功能测试
- `frontend/public/test-complete-frontend.html` - 前端功能完整测试
- `frontend/public/test-all-apis.html` - 所有API接口测试

### 启动脚本
- `start-simple.ps1` - 一键启动所有服务
- `check-status.ps1` - 检查服务状态
- `stop-all.ps1` - 停止所有服务

### 数据库连接
- 服务器: `localhost`
- 端口: `3306`
- 数据库: `fitchallenge`
- 用户: `root`
- 密码: 根据实际配置

## 📝 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 包含用户认证、钱包、签到、PK挑战等核心功能
- 支持管理员后台管理

### v1.1.0 (2024-01-02)
- 修复用户登录注册问题
- 完善前端API接口
- 优化数据库查询性能

## 📞 技术支持

如有问题或建议，请联系开发团队或查看相关文档。

---

**文档版本**: v1.1.0  
**最后更新**: 2024-01-02  
**维护者**: FitChallenge开发团队
