const express = require('express');
const router = express.Router();

// 管理员日志记录端点
router.post('/admin', async (req, res) => {
    try {
        const { level, message, data, sessionId, userAgent, url } = req.body;
        
        // 这里可以将日志保存到数据库或文件
        console.log('[管理员前端日志]', {
            level: level || 'info',
            message: message || '',
            data: data || {},
            sessionId: sessionId || '',
            userAgent: userAgent || '',
            url: url || '',
            timestamp: new Date().toISOString(),
            ip: req.ip || req.connection.remoteAddress
        });
        
        res.json({
            success: true,
            message: '日志记录成功'
        });
        
    } catch (error) {
        console.error('日志记录失败:', error);
        res.status(500).json({
            success: false,
            message: '日志记录失败',
            error: error.message
        });
    }
});

// 获取日志列表
router.get('/admin', async (req, res) => {
    try {
        const { page = 1, limit = 50, level, startDate, endDate } = req.query;
        
        // 模拟日志数据，实际应该从数据库获取
        const logs = [
            {
                id: 1,
                level: 'info',
                message: '管理员登录',
                timestamp: new Date().toISOString(),
                ip: '127.0.0.1',
                userAgent: 'Mozilla/5.0...'
            }
        ];
        
        res.json({
            success: true,
            data: logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: logs.length,
                totalPages: Math.ceil(logs.length / limit)
            }
        });
        
    } catch (error) {
        console.error('获取日志失败:', error);
        res.status(500).json({
            success: false,
            message: '获取日志失败',
            error: error.message
        });
    }
});

module.exports = router;