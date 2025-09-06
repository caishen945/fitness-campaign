/**
 * 管理员权限中间件
 * 验证用户是否具有管理员权限
 */

const requireAdmin = (req, res, next) => {
    try {
        // 检查用户是否存在
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: '未授权访问'
            });
        }

        // 检查用户是否是管理员
        // 这里可以根据实际需求修改管理员判断逻辑
        // 例如：检查用户角色、权限等
        
        // 临时使用硬编码的管理员邮箱列表
        const adminEmails = [
            'admin@fitchallenge.com',
            'admin@example.com'
        ];

        if (adminEmails.includes(req.user.email)) {
            next();
        } else {
            return res.status(403).json({
                success: false,
                error: '需要管理员权限'
            });
        }
    } catch (error) {
        console.error('管理员权限验证失败:', error);
        return res.status(500).json({
            success: false,
            error: '权限验证失败'
        });
    }
};

module.exports = {
    requireAdmin
};
