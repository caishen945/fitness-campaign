# FitChallenge API 文档

## 概述

FitChallenge 是一个健康挑战平台，提供VIP等级挑战、步数记录、团队协作等功能。本文档描述了所有可用的API接口。

## 基础信息

- **基础URL**: `http://localhost:3000/api`
- **认证方式**: JWT Token (Bearer Token)
- **数据格式**: JSON
- **字符编码**: UTF-8

## 认证

大部分API需要认证，请在请求头中添加：

```
Authorization: Bearer <your_jwt_token>
```

## 通用响应格式

### 成功响应
```json
{
    "success": true,
    "data": {...},
    "message": "操作成功"
}
```

### 错误响应
```json
{
    "success": false,
    "error": "错误描述"
}
```

## VIP挑战系统 API

### 1. VIP等级管理

#### 1.1 获取所有VIP等级
- **URL**: `GET /vip-levels`
- **描述**: 获取平台所有可用的VIP等级
- **权限**: 公开
- **响应示例**:
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "青铜挑战",
            "description": "适合初学者的基础挑战",
            "depositAmount": 500,
            "stepTarget": 1000,
            "rewardAmount": 0.5,
            "maxChallenges": -1,
            "duration": 1,
            "icon": "🥉",
            "color": "#CD7F32",
            "isActive": true,
            "dailyReward": 0.5,
            "challengeValue": 0.5,
            "roi": "0.1%"
        }
    ],
    "message": "获取VIP等级列表成功"
}
```

#### 1.2 根据ID获取VIP等级
- **URL**: `GET /vip-levels/:id`
- **描述**: 获取指定ID的VIP等级详情
- **权限**: 公开
- **参数**: `id` - VIP等级ID
- **响应示例**: 同上

#### 1.3 创建VIP等级 (管理员)
- **URL**: `POST /vip-levels`
- **描述**: 创建新的VIP等级
- **权限**: 管理员
- **请求体**:
```json
{
    "name": "钻石挑战",
    "description": "顶级难度的王者挑战",
    "depositAmount": 5000,
    "stepTarget": 8000,
    "rewardAmount": 8.0,
    "maxChallenges": 20,
    "duration": 1,
    "icon": "💎",
    "color": "#B9F2FF"
}
```

#### 1.4 更新VIP等级 (管理员)
- **URL**: `PUT /vip-levels/:id`
- **描述**: 更新指定VIP等级的信息
- **权限**: 管理员
- **参数**: `id` - VIP等级ID
- **请求体**: 同创建

#### 1.5 删除VIP等级 (管理员)
- **URL**: `DELETE /vip-levels/:id`
- **描述**: 删除指定的VIP等级
- **权限**: 管理员
- **参数**: `id` - VIP等级ID

### 2. 用户VIP状态管理

#### 2.1 获取用户VIP状态
- **URL**: `GET /users/:userId/vip-status`
- **描述**: 获取指定用户的VIP状态信息
- **权限**: 用户本人或管理员
- **参数**: `userId` - 用户ID
- **响应示例**:
```json
{
    "success": true,
    "data": {
        "id": 1,
        "userId": 1,
        "vipLevelId": 2,
        "depositAmount": 1000,
        "depositDate": "2024-01-01T00:00:00.000Z",
        "expireDate": "2024-02-01T00:00:00.000Z",
        "isActive": true,
        "totalChallenges": 15,
        "completedChallenges": 12,
        "totalRewards": 18.0,
        "currentStreak": 5,
        "longestStreak": 8,
        "vipLevel": {...}
    },
    "message": "获取用户VIP状态成功"
}
```

#### 2.2 用户升级VIP
- **URL**: `POST /users/:userId/upgrade-vip`
- **描述**: 用户升级到指定VIP等级
- **权限**: 用户本人
- **参数**: `userId` - 用户ID
- **请求体**:
```json
{
    "vipLevelId": 2,
    "depositAmount": 1000
}
```

#### 2.3 用户续费VIP
- **URL**: `POST /users/:userId/renew-vip`
- **描述**: 用户续费VIP服务
- **权限**: 用户本人
- **参数**: `userId` - 用户ID
- **请求体**:
```json
{
    "durationDays": 30
}
```

#### 2.4 用户取消VIP
- **URL**: `POST /users/:userId/cancel-vip`
- **描述**: 用户取消VIP服务
- **权限**: 用户本人
- **参数**: `userId` - 用户ID

### 3. VIP挑战管理

#### 3.1 创建VIP挑战
- **URL**: `POST /users/:userId/challenges`
- **描述**: 用户创建新的VIP挑战
- **权限**: 用户本人
- **参数**: `userId` - 用户ID
- **请求体**:
```json
{
    "vipLevelId": 2,
    "challengeType": "daily"
}
```

#### 3.2 获取用户挑战列表
- **URL**: `GET /users/:userId/challenges`
- **描述**: 获取指定用户的所有挑战记录
- **权限**: 用户本人或管理员
- **参数**: 
  - `userId` - 用户ID
  - `status` - 挑战状态筛选 (可选: active, completed, failed, cancelled)
- **响应示例**:
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "challengeType": "daily",
            "stepTarget": 3000,
            "currentSteps": 2500,
            "progress": 83.3,
            "remainingSteps": 500,
            "remainingDays": 0,
            "status": "active",
            "depositAmount": 1000,
            "rewardAmount": 1.5,
            "startDate": "2024-01-15T00:00:00.000Z",
            "endDate": "2024-01-16T00:00:00.000Z",
            "completedAt": null,
            "stats": {...},
            "potentialProfit": 0.5,
            "roi": "0.5%"
        }
    ],
    "message": "获取用户挑战列表成功"
}
```

#### 3.3 获取挑战详情
- **URL**: `GET /challenges/:challengeId`
- **描述**: 获取指定挑战的详细信息
- **权限**: 挑战所有者或管理员
- **参数**: `challengeId` - 挑战ID

#### 3.4 更新挑战步数
- **URL**: `PUT /challenges/:challengeId/steps`
- **描述**: 更新指定挑战的当前步数
- **权限**: 挑战所有者
- **参数**: `challengeId` - 挑战ID
- **请求体**:
```json
{
    "steps": 2500
}
```

#### 3.5 取消挑战
- **URL**: `DELETE /challenges/:challengeId`
- **描述**: 取消指定的挑战
- **权限**: 挑战所有者
- **参数**: `challengeId` - 挑战ID

### 4. 统计和排行榜

#### 4.1 获取挑战统计
- **URL**: `GET /stats`
- **描述**: 获取挑战统计数据
- **权限**: 公开
- **查询参数**: `userId` - 用户ID (可选，不传则返回全局统计)
- **响应示例**:
```json
{
    "success": true,
    "data": {
        "totalChallenges": 150,
        "completedChallenges": 120,
        "activeChallenges": 30,
        "successRate": "80.00%",
        "totalRewards": 180.5
    },
    "message": "获取挑战统计成功"
}
```

#### 4.2 获取排行榜
- **URL**: `GET /leaderboard`
- **描述**: 获取VIP挑战排行榜
- **权限**: 公开
- **查询参数**: `limit` - 返回数量限制 (默认10)
- **响应示例**:
```json
{
    "success": true,
    "data": [
        {
            "userId": 1,
            "totalChallenges": 25,
            "completedChallenges": 22,
            "totalRewards": 33.0,
            "currentStreak": 8,
            "successRate": "88.00%"
        }
    ],
    "message": "获取排行榜成功"
}
```

## 用户认证 API

### 1. 用户注册
- **URL**: `POST /auth/register`
- **描述**: 用户注册新账号
- **权限**: 公开
- **请求体**:
```json
{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
}
```

### 2. 用户登录
- **URL**: `POST /auth/login`
- **描述**: 用户登录获取认证令牌
- **权限**: 公开
- **请求体**:
```json
{
    "username": "testuser",
    "password": "password123"
}
```
- **响应示例**:
```json
{
    "success": true,
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
            "id": 1,
            "username": "testuser",
            "email": "test@example.com"
        }
    },
    "message": "登录成功"
}
```

### 3. 用户登出
- **URL**: `POST /auth/logout`
- **描述**: 用户登出，使令牌失效
- **权限**: 已认证用户

## 步数记录 API

### 1. 记录步数
- **URL**: `POST /steps/record`
- **描述**: 记录用户的步数数据
- **权限**: 已认证用户
- **请求体**:
```json
{
    "steps": 8500,
    "date": "2024-01-15",
    "source": "manual"
}
```

### 2. 获取步数记录
- **URL**: `GET /steps/records`
- **描述**: 获取用户的步数记录
- **权限**: 已认证用户
- **查询参数**:
  - `startDate` - 开始日期 (可选)
  - `endDate` - 结束日期 (可选)
  - `limit` - 返回数量限制 (可选)

## 团队功能 API

### 1. 创建团队
- **URL**: `POST /teams`
- **描述**: 创建新的团队
- **权限**: 已认证用户
- **请求体**:
```json
{
    "name": "健康挑战队",
    "description": "一起挑战健康目标"
}
```

### 2. 加入团队
- **URL**: `POST /teams/:teamId/join`
- **描述**: 加入指定团队
- **权限**: 已认证用户
- **参数**: `teamId` - 团队ID

### 3. 获取团队信息
- **URL**: `GET /teams/:teamId`
- **描述**: 获取指定团队的详细信息
- **权限**: 公开
- **参数**: `teamId` - 团队ID

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证或认证失败 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 常见错误响应

### 认证失败
```json
{
    "success": false,
    "error": "认证失败，请重新登录"
}
```

### 权限不足
```json
{
    "success": false,
    "error": "权限不足，无法执行此操作"
}
```

### 参数验证失败
```json
{
    "success": false,
    "error": "参数验证失败: 用户名不能为空"
}
```

### 资源不存在
```json
{
    "success": false,
    "error": "VIP等级不存在"
}
```

## 使用示例

### JavaScript 示例

```javascript
// 获取VIP等级列表
async function getVIPLevels() {
    try {
        const response = await fetch('/api/vip-levels');
        const data = await response.json();
        
        if (data.success) {
            console.log('VIP等级列表:', data.data);
        } else {
            console.error('获取失败:', data.error);
        }
    } catch (error) {
        console.error('请求失败:', error);
    }
}

// 创建VIP挑战
async function createChallenge(userId, vipLevelId) {
    try {
        const response = await fetch(`/api/users/${userId}/challenges`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                vipLevelId: vipLevelId,
                challengeType: 'daily'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('挑战创建成功:', data.data);
        } else {
            console.error('创建失败:', data.error);
        }
    } catch (error) {
        console.error('请求失败:', error);
    }
}
```

### cURL 示例

```bash
# 获取VIP等级列表
curl -X GET "http://localhost:3000/api/vip-levels"

# 创建VIP挑战
curl -X POST "http://localhost:3000/api/users/1/challenges" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"vipLevelId": 2, "challengeType": "daily"}'

# 更新挑战步数
curl -X PUT "http://localhost:3000/api/challenges/1/steps" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"steps": 2500}'
```

## 更新日志

### v1.0.0 (2024-01-15)
- 初始版本发布
- 支持基础的用户认证
- 支持VIP等级挑战系统
- 支持步数记录和统计
- 支持团队功能

## 联系支持

如果您在使用API过程中遇到问题，请联系技术支持：

- 邮箱: support@fitchallenge.com
- 文档: https://docs.fitchallenge.com
- GitHub: https://github.com/fitchallenge/api
