# 🚀 修改影响评估快速指南

> **重要**: 此指南配合完整的 [影响分析框架](.tasks/Impact_Analysis_Framework.md) 使用

## 📋 快速检查清单

### 🔍 开始前 - 5分钟快速评估

**问自己这些问题**:
- [ ] 我要修改什么？(数据库/API/前端/配置)
- [ ] 这个修改会影响哪些用户？
- [ ] 如果出错，影响有多严重？
- [ ] 我有回滚方案吗？

### ⚠️ 高风险操作识别 (立即停止，进入完整评估)

**数据库高风险**:
- ❌ 删除表或字段
- ❌ 修改主键或外键
- ❌ 改变字段类型或长度
- ❌ 添加非空约束到现有字段

**API高风险**:
- ❌ 修改认证相关接口
- ❌ 改变API响应格式
- ❌ 删除或重命名API端点
- ❌ 修改权限验证逻辑

**前端高风险**:
- ❌ 修改路由结构
- ❌ 改变组件接口
- ❌ 修改状态管理逻辑
- ❌ 改变API调用方式

### 🟡 中风险操作 (需要标准评估)

**数据库中风险**:
- 🔶 添加新表
- 🔶 添加可空字段
- 🔶 修改索引

**API中风险**:
- 🔶 添加新API端点
- 🔶 修改现有业务逻辑
- 🔶 优化性能

**前端中风险**:
- 🔶 添加新功能
- 🔶 修改现有组件
- 🔶 样式重构

### 🟢 低风险操作 (简化评估)

- ✅ 修改文案和翻译
- ✅ 代码注释更新
- ✅ 日志优化
- ✅ 单元测试添加

## 🛠️ 根据风险等级选择流程

### 高风险操作 → 完整RIPER-5流程

```
RESEARCH → INNOVATE → PLAN → EXECUTE → REVIEW
(必须完成所有阶段，不能跳过)
```

**必需工具**:
- 完整影响分析框架
- 数据备份
- 详细回滚计划
- 分阶段测试

### 中风险操作 → 简化流程

```
快速分析 → 简单规划 → 执行 → 验证
```

**检查要点**:
- [ ] 列出受影响的组件
- [ ] 制定基本测试计划  
- [ ] 准备回滚方法
- [ ] 执行后验证功能

### 低风险操作 → 最小流程

```
确认影响范围 → 执行 → 快速验证
```

**基本要求**:
- [ ] 确认不影响核心功能
- [ ] 执行后基本测试
- [ ] 记录变更内容

## 📊 系统关键指标监控

### 🚨 立即报警指标
- 数据库连接失败
- API响应时间 > 5秒
- 错误率 > 5%
- 内存使用率 > 90%

### ⚠️ 警告指标  
- API响应时间 > 2秒
- 错误率 > 1%
- 数据库查询时间 > 1秒
- 内存使用率 > 70%

### 📈 监控命令

```bash
# 快速健康检查
curl -f http://localhost:3000/api/health
curl -f http://localhost:8080
curl -f http://localhost:8081

# 数据库连接检查
mysql -u root -p -e "SELECT 1"

# 进程状态检查
ps aux | grep -E "(node|mysql|redis)"
```

## 🆘 应急响应

### P0: 系统完全不可用
1. **立即回滚** (5分钟内)
2. **检查备份状态**
3. **通知团队**
4. **启动应急修复**

### P1: 核心功能受影响
1. **评估回滚需要** (10分钟内)
2. **制定快速修复方案**
3. **实施临时解决方案**

### P2: 非核心功能问题
1. **记录问题详情**
2. **制定正常修复计划**
3. **按标准流程处理**

## 🔧 常用命令速查

### 数据库检查
```sql
-- 检查外键依赖
SELECT CONSTRAINT_NAME, TABLE_NAME, REFERENCED_TABLE_NAME 
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE REFERENCED_TABLE_NAME = 'your_table';

-- 检查索引
SELECT INDEX_NAME, COLUMN_NAME 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_NAME = 'your_table';
```

### API测试
```bash
# 测试用户登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'

# 测试管理员功能
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 前端检查
```bash
# 检查API调用
grep -r "api/" frontend/public/src/
grep -r "fetch\|axios" frontend/public/src/

# 检查路由配置
grep -r "route\|path" frontend/public/src/
```

## 📝 快速记录模板

### 修改记录
```
日期: 2025-01-XX
修改内容: [简述]
影响范围: [数据库/API/前端]
风险等级: [高/中/低]
测试结果: [通过/失败]
回滚状态: [已准备/不需要]
```

### 问题记录
```
发现时间: 
问题描述: 
影响范围: 
紧急程度: P0/P1/P2
处理状态: [修复中/已修复/待处理]
负责人: 
```

## 🎯 最佳实践

### ✅ 推荐做法
- 小步快跑，频繁验证
- 先在测试环境完整测试
- 保持代码和数据的可回滚性
- 及时记录和分享经验

### ❌ 避免做法
- 同时修改多个高风险组件
- 跳过影响评估直接修改
- 在生产环境直接测试
- 修改后不进行验证

---

## 🔗 相关文档

- [完整影响分析框架](.tasks/Impact_Analysis_Framework.md)
- [系统架构文档](README.md)
- [API接口文档](后端API文档链接)
- [数据库设计文档](database/schema.sql)

---

*遇到问题时，优先保证系统稳定，其次才是功能完善。*
