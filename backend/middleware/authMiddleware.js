const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
// 使用环境变量中的JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'fitchallenge_secret_key_2025';

// 认证中间件 - 临时禁用验证，仅检查token存在性
const authenticateToken = (req, res, next) => {
    console.log('\n🔍 === authenticateToken 中间件开始 ===');
    console.log('请求URL:', req.url);
    console.log('请求方法:', req.method);
    console.log('请求头:', req.headers);
    
    const authHeader = req.headers['authorization'];
    console.log('Authorization头:', authHeader);
    
    const token = authHeader && authHeader.split(' ')[1];
    console.log('提取的token:', token);
    console.log('Token类型:', typeof token);
    console.log('Token长度:', token ? token.length : 0);
    
    // 详细检查token内容
    if (token) {
        console.log('🔍 Token详细分析:');
        console.log('原始token:', token);
        console.log('Token字符编码:');
        for (let i = 0; i < Math.min(token.length, 20); i++) {
            console.log(`  位置${i}: '${token[i]}' (ASCII: ${token.charCodeAt(i)})`);
        }
        if (token.length > 20) {
            console.log(`  ... 还有${token.length - 20}个字符`);
        }
        console.log('是否包含特殊字符:', /[^\x20-\x7E]/.test(token));
        console.log('是否包含控制字符:', /[\x00-\x1F\x7F]/.test(token));
    }

    if (!token) {
        console.log('❌ 无token，返回401');
        return res.status(401).json({ error: '访问令牌缺失' });
    }

    try {
        let decoded;
        
        // 尝试解析token：可能是JSON字符串或JWT格式
        if (token.includes('.')) {
            console.log('🔍 检测到JWT格式，使用jwt.decode');
            decoded = jwt.decode(token);
            console.log('jwt.decode结果:', decoded);
        } else {
            console.log('🔍 检测到JSON格式，使用JSON.parse');
            try {
                decoded = JSON.parse(token);
                console.log('JSON.parse结果:', decoded);
            } catch (parseError) {
                console.error('❌ JSON解析失败:', parseError.message);
                console.error('❌ 原始token:', token);
                return res.status(403).json({ error: 'token格式无效' });
            }
        }
        
        console.log('🔍 解码后的token:', decoded);
        
        if (!decoded || !decoded.id) {
            console.error('❌ 无法从token中提取用户ID');
            console.error('❌ decoded对象:', decoded);
            return res.status(403).json({ error: 'token格式无效' });
        }
        
        // 检查token是否过期
        if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
            console.error('❌ token已过期');
            console.error('❌ 过期时间戳:', decoded.exp);
            console.error('❌ 当前时间戳:', Math.floor(Date.now() / 1000));
            console.error('❌ 过期时间:', new Date(decoded.exp * 1000));
            console.error('❌ 当前时间:', new Date());
            return res.status(403).json({ error: 'token已过期' });
        }
        
        // 设置用户信息
        req.user = {
            id: decoded.id,
            username: decoded.username || ''
        };
        
        console.log('✅ 用户信息设置成功:', req.user);
        console.log('✅ authenticateToken 中间件通过');
        next();
    } catch (err) {
        console.error('❌ 令牌处理失败:', err.message);
        console.error('❌ 错误堆栈:', err.stack);
        return res.status(403).json({ error: '令牌处理失败' });
    }
};

// 管理员权限中间件
const requireAdmin = async (req, res, next) => {
    console.log('\n🔍 === requireAdmin 中间件开始 ===');
    console.log('当前用户信息:', req.user);
    
    if (!req.user) {
        console.log('❌ 无用户信息，返回401');
        return res.status(401).json({ error: '需要认证' });
    }
    
    // 检查用户是否为管理员
    // 从数据库验证用户角色，而不是硬编码检查
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT role FROM admin_users WHERE id = ? AND is_active = 1',
            [req.user.id]
        );
        connection.release();
        
        if (rows.length > 0 && (rows[0].role === 'admin' || rows[0].role === 'super_admin')) {
            console.log('✅ 管理员权限验证通过');
            next();
        } else {
            console.log('❌ 非管理员用户，拒绝访问');
            return res.status(403).json({ error: '需要管理员权限' });
        }
    } catch (error) {
        console.error('❌ 权限验证失败:', error.message);
        return res.status(500).json({ error: '权限验证失败' });
    }
};

module.exports = {
    authenticateToken,
    requireAdmin
};
