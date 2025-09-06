# 📋 FitChallenge 版本号输入指南

## 🎯 版本号格式

FitChallenge 使用**语义化版本 (SemVer)** 格式：`MAJOR.MINOR.PATCH`

### 版本号组成部分

- **MAJOR** (主版本号): 不兼容的API修改
- **MINOR** (次版本号): 向下兼容的功能性新增  
- **PATCH** (修订版本号): 向下兼容的问题修正

## 📝 输入格式说明

### 当前版本
```
2.0.0
```

### 输入示例

| 要更新的版本 | 输入内容 | 结果版本 | 说明 |
|-------------|----------|----------|------|
| 主版本号 | `3` | `3.0.0` | 重大更新，不兼容旧版本 |
| 次版本号 | `1` | `2.1.0` | 新功能，兼容旧版本 |
| 修订版本号 | `1` | `2.0.1` | Bug修复，兼容旧版本 |
| 保持不变 | `Enter` | `2.0.0` | 不修改当前版本 |

## 🚀 使用步骤

### 1. 启动版本管理工具
```bash
# 方法1: 直接运行Node.js脚本
node update-version.cjs

# 方法2: 使用批处理脚本
.\update-version-simple.bat
```

### 2. 选择操作
```
1. Update build timestamp (Recommended)  # 推荐：更新构建时间戳
2. Update version number                 # 更新版本号
3. Show version information              # 显示版本信息
4. Exit                                  # 退出
```

### 3. 输入版本号
如果选择选项2，会看到详细的输入指南：

```
📋 Version Number Input Guide:
   - Enter a number (e.g., 1, 2, 3) to update that version component
   - Press Enter to keep the current version unchanged
   - Format: MAJOR.MINOR.PATCH (e.g., 2.1.0)
   - Examples:
     * Major update: 3 (becomes 3.0.0)
     * Minor update: 1 (becomes 2.1.0)
     * Patch update: 1 (becomes 2.0.1)
```

## 📊 版本更新场景

### 场景1: 重大架构变更
- **输入**: MAJOR = `3`, MINOR = `Enter`, PATCH = `Enter`
- **结果**: `3.0.0`
- **说明**: 不兼容的API修改

### 场景2: 添加新功能
- **输入**: MAJOR = `Enter`, MINOR = `1`, PATCH = `Enter`
- **结果**: `2.1.0`
- **说明**: 向下兼容的新功能

### 场景3: Bug修复
- **输入**: MAJOR = `Enter`, MINOR = `Enter`, PATCH = `1`
- **结果**: `2.0.1`
- **说明**: 问题修复，完全兼容

### 场景4: 完整版本更新
- **输入**: MAJOR = `3`, MINOR = `2`, PATCH = `1`
- **结果**: `3.2.1`
- **说明**: 同时更新所有版本号

## ⚠️ 注意事项

1. **输入格式**: 只输入数字，不要输入小数点或其他字符
2. **保持当前版本**: 直接按 `Enter` 键
3. **版本号范围**: 建议使用正整数 (0, 1, 2, 3...)
4. **更新后操作**: 更新版本后需要清除浏览器缓存

## 🔄 更新后操作

版本更新完成后，系统会提示：

```
========================================
Version update completed!
========================================

Tips:
1. Clear browser cache after updating version
2. Press Ctrl+Shift+R to force refresh page
3. Or clear browser cache and visit again
========================================
```

## 📚 相关文档

- [语义化版本规范](https://semver.org/)
- [VERSION_MANAGEMENT.md](./VERSION_MANAGEMENT.md) - 完整版本管理系统文档

---

**提示**: 如果不确定应该更新哪个版本号，建议先使用选项1更新构建时间戳，这样可以强制浏览器重新加载文件。
