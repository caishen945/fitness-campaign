# VIP等级管理和挑战记录查询API文档

## 概述
本文档描述了VIP等级管理和挑战记录查询的后端API接口，用于管理员对VIP等级进行增删改查操作，以及查询挑战订单记录。

## 基础信息
- 基础URL: `http://localhost:3000/api`
- 认证方式: Bearer Token (JWT)
- 权限要求: 管理员权限

## VIP等级管理API

### 1. 获取所有VIP等级
**GET** `/admin/vip-levels`

获取系统中所有VIP等级的列表。

**请求参数:**
- 无

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "青铜挑战",
      "description": "适合初学者的基础挑战",
      "depositAmount": 500.00,
      "stepTarget": 1000,
      "rewardAmount": 0.50,
      "maxChallenges": -1,
      "duration": 1,
      "icon": "🥉",
      "color": "#CD7F32",
      "cancelDeductRatio": 0.05,
      "cancelRewardRatio": 0.02,
      "isActive": true,
      "dailyReward": 0.50,
      "challengeValue": 0.50,
      "roi": "-99.90%",
      "cancelDeductAmount": 25.00,
      "cancelRewardAmount": 10.00,
      "cancelRefundAmount": 485.00
    }
  ],
  "message": "获取VIP等级列表成功"
}
```

### 2. 获取活跃的VIP等级
**GET** `/admin/vip-levels/active`

获取所有激活状态的VIP等级。

**请求参数:**
- 无

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "青铜挑战",
      "isActive": true,
      // ... 其他字段
    }
  ],
  "message": "获取活跃VIP等级列表成功"
}
```

### 3. 获取单个VIP等级
**GET** `/admin/vip-levels/:id`

根据ID获取特定VIP等级的详细信息。

**路径参数:**
- `id`: VIP等级ID

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "青铜挑战",
    // ... 完整等级信息
  },
  "message": "获取VIP等级成功"
}
```

### 4. 创建VIP等级
**POST** `/admin/vip-levels`

创建新的VIP等级。

**请求体:**
```json
{
  "name": "钻石挑战",
  "description": "最高级别的精英挑战",
  "depositAmount": 5000.00,
  "stepTarget": 10000,
  "rewardAmount": 10.00,
  "maxChallenges": -1,
  "duration": 1,
  "icon": "💎",
  "color": "#B9F2FF",
  "cancelDeductRatio": 0.05,
  "cancelRewardRatio": 0.02,
  "isActive": true
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "name": "钻石挑战",
    // ... 完整等级信息
  },
  "message": "创建VIP等级成功"
}
```

### 5. 更新VIP等级
**PUT** `/admin/vip-levels/:id`

更新指定VIP等级的信息。

**路径参数:**
- `id`: VIP等级ID

**请求体:**
```json
{
  "depositAmount": 6000.00,
  "stepTarget": 12000,
  "rewardAmount": 12.00
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "depositAmount": 6000.00,
    // ... 更新后的信息
  },
  "message": "更新VIP等级成功"
}
```

### 6. 删除VIP等级
**DELETE** `/admin/vip-levels/:id`

删除指定的VIP等级（软删除，设置isActive为false）。

**路径参数:**
- `id`: VIP等级ID

**响应示例:**
```json
{
  "success": true,
  "message": "删除VIP等级成功"
}
```

### 7. 批量更新VIP等级状态
**PATCH** `/admin/vip-levels/batch-status`

批量启用或禁用VIP等级。

**请求体:**
```json
{
  "levelIds": [1, 2, 3],
  "isActive": false
}
```

**响应示例:**
```json
{
  "success": true,
  "message": "批量禁用VIP等级成功"
}
```

## 挑战记录查询API

### 1. 获取所有挑战记录
**GET** `/admin/vip-challenges`

获取所有挑战记录，支持分页和筛选。

**查询参数:**
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 20)
- `status`: 挑战状态筛选 (active/completed/failed/cancelled)
- `vipLevelId`: VIP等级ID筛选
- `userId`: 用户ID筛选
- `startDate`: 开始日期筛选 (YYYY-MM-DD)
- `endDate`: 结束日期筛选 (YYYY-MM-DD)
- `sortBy`: 排序字段 (默认: created_at)
- `sortOrder`: 排序方向 (ASC/DESC, 默认: DESC)

**响应示例:**
```json
{
  "success": true,
  "data": {
    "challenges": [
      {
        "id": 1,
        "userId": 33,
        "vipLevelId": 1,
        "challengeType": "daily",
        "stepTarget": 1000,
        "currentSteps": 850,
        "progress": 85.0,
        "remainingSteps": 150,
        "remainingDays": 0,
        "status": "active",
        "depositAmount": 500.00,
        "rewardAmount": 0.50,
        "startDate": "2025-01-13T10:00:00.000Z",
        "endDate": "2025-01-14T10:00:00.000Z",
        "potentialProfit": -499.50,
        "roi": "-99.90%",
        "user": {
          "id": 33,
          "username": "161616",
          "email": "161616@qq.com"
        },
        "vipLevel": {
          "id": 1,
          "name": "青铜挑战",
          "icon": "🥉",
          "color": "#CD7F32"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  },
  "message": "获取挑战记录成功"
}
```

### 2. 获取挑战统计信息
**GET** `/admin/vip-challenges/stats`

获取挑战相关的统计信息。

**查询参数:**
- `startDate`: 开始日期 (YYYY-MM-DD)
- `endDate`: 结束日期 (YYYY-MM-DD)

**响应示例:**
```json
{
  "success": true,
  "data": {
    "total": {
      "total_challenges": 150,
      "active_challenges": 45,
      "completed_challenges": 85,
      "failed_challenges": 15,
      "cancelled_challenges": 5,
      "total_deposits": 75000.00,
      "total_rewards": 75.00,
      "completed_rewards": 42.50
    },
    "byLevel": [
      {
        "level_name": "青铜挑战",
        "level_icon": "🥉",
        "level_color": "#CD7F32",
        "challenge_count": 80,
        "completed_count": 45,
        "total_deposits": 40000.00,
        "total_rewards": 40.00
      }
    ],
    "byStatus": [
      {
        "status": "active",
        "count": 45,
        "total_deposits": 22500.00,
        "total_rewards": 22.50
      }
    ],
    "daily": [
      {
        "date": "2025-01-13",
        "challenge_count": 15,
        "completed_count": 8,
        "total_deposits": 7500.00,
        "total_rewards": 7.50
      }
    ]
  },
  "message": "获取挑战统计信息成功"
}
```

### 3. 获取单个挑战记录详情
**GET** `/admin/vip-challenges/:id`

获取指定挑战记录的详细信息。

**路径参数:**
- `id`: 挑战记录ID

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 33,
    "vipLevelId": 1,
    "challengeType": "daily",
    "stepTarget": 1000,
    "currentSteps": 850,
    "progress": 85.0,
    "remainingSteps": 150,
    "remainingDays": 0,
    "status": "active",
    "depositAmount": 500.00,
    "rewardAmount": 0.50,
    "startDate": "2025-01-13T10:00:00.000Z",
    "endDate": "2025-01-14T10:00:00.000Z",
    "completedAt": null,
    "potentialProfit": -499.50,
    "roi": "-99.90%",
    "stats": {
      "progress": 85.0,
      "remainingSteps": 150,
      "remainingDays": 0,
      "isActive": true,
      "isCompleted": false,
      "isFailed": false,
      "isCancelled": false,
      "duration": 1
    },
    "user": {
      "id": 33,
      "username": "161616",
      "email": "161616@qq.com",
      "createdAt": "2025-01-13T03:05:54.000Z"
    },
    "vipLevel": {
      "id": 1,
      "name": "青铜挑战",
      "description": "适合初学者的基础挑战",
      "icon": "🥉",
      "color": "#CD7F32",
      "cancelDeductRatio": 0.05,
      "cancelRewardRatio": 0.02
    }
  },
  "message": "获取挑战记录详情成功"
}
```

### 4. 获取用户挑战记录
**GET** `/admin/vip-challenges/user/:userId`

获取指定用户的所有挑战记录。

**路径参数:**
- `userId`: 用户ID

**查询参数:**
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 20)
- `status`: 挑战状态筛选

**响应示例:**
```json
{
  "success": true,
  "data": {
    "challenges": [
      {
        "id": 1,
        "userId": 33,
        "vipLevelId": 1,
        "challengeType": "daily",
        "stepTarget": 1000,
        "currentSteps": 850,
        "progress": 85.0,
        "remainingSteps": 150,
        "remainingDays": 0,
        "status": "active",
        "depositAmount": 500.00,
        "rewardAmount": 0.50,
        "startDate": "2025-01-13T10:00:00.000Z",
        "endDate": "2025-01-14T10:00:00.000Z",
        "potentialProfit": -499.50,
        "roi": "-99.90%",
        "vipLevel": {
          "id": 1,
          "name": "青铜挑战",
          "icon": "🥉",
          "color": "#CD7F32"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "totalPages": 2
    }
  },
  "message": "获取用户挑战记录成功"
}
```

### 5. 管理员手动完成挑战
**PATCH** `/admin/vip-challenges/:id/complete`

管理员手动将挑战标记为完成。

**路径参数:**
- `id`: 挑战记录ID

**请求体:**
```json
{
  "adminNote": "管理员手动完成"
}
```

**响应示例:**
```json
{
  "success": true,
  "message": "挑战已完成"
}
```

### 6. 管理员手动取消挑战
**PATCH** `/admin/vip-challenges/:id/cancel`

管理员手动取消挑战。

**路径参数:**
- `id`: 挑战记录ID

**请求体:**
```json
{
  "adminNote": "管理员手动取消"
}
```

**响应示例:**
```json
{
  "success": true,
  "message": "挑战已取消"
}
```

## 错误响应格式

所有API在发生错误时都会返回以下格式：

```json
{
  "success": false,
  "message": "错误描述",
  "error": "详细错误信息"
}
```

## 常见HTTP状态码

- `200`: 请求成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未授权
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

## 数据库表结构

### vip_levels 表
- `id`: 主键
- `name`: 等级名称（唯一）
- `description`: 等级描述
- `deposit_amount`: 押金金额
- `step_target`: 步数目标
- `reward_amount`: 奖励金额
- `max_challenges`: 每日挑战次数限制
- `duration`: 挑战持续时间
- `icon`: 等级图标
- `color`: 等级颜色
- `cancel_deduct_ratio`: 取消扣除比例
- `cancel_reward_ratio`: 取消奖励比例
- `is_active`: 是否激活
- `created_at`: 创建时间
- `updated_at`: 更新时间

### vip_challenges 表
- `id`: 主键
- `user_id`: 用户ID（外键）
- `vip_level_id`: VIP等级ID（外键）
- `challenge_type`: 挑战类型
- `step_target`: 步数目标
- `current_steps`: 当前步数
- `start_date`: 开始时间
- `end_date`: 结束时间
- `status`: 挑战状态
- `deposit_amount`: 押金金额
- `reward_amount`: 奖励金额
- `completed_at`: 完成时间
- `created_at`: 创建时间
- `updated_at`: 更新时间

## 使用示例

### 创建VIP等级
```bash
curl -X POST http://localhost:3000/api/admin/vip-levels \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "钻石挑战",
    "description": "最高级别的精英挑战",
    "depositAmount": 5000.00,
    "stepTarget": 10000,
    "rewardAmount": 10.00,
    "icon": "💎",
    "color": "#B9F2FF"
  }'
```

### 查询挑战记录
```bash
curl -X GET "http://localhost:3000/api/admin/vip-challenges?page=1&limit=10&status=active" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 获取统计信息
```bash
curl -X GET "http://localhost:3000/api/admin/vip-challenges/stats?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
