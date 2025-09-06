// 安全配置文件
export const SecurityConfig = {
    // Token配置
    token: {
        expiresIn: 24 * 60 * 60 * 1000, // 24小时
        algorithm: 'HS256',
        issuer: 'FitChallenge-Admin'
    },

    // 密码策略
    password: {
        minLength: 8,
        maxLength: 100,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
    },

    // 输入验证
    validation: {
        username: {
            minLength: 3,
            maxLength: 50,
            pattern: /^[a-zA-Z0-9_]+$/
        },
        email: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        }
    },

    // XSS防护
    xss: {
        patterns: [
            /<script/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /data:text\/html/i,
            /vbscript:/i,
            /expression\(/i
        ]
    },

    // CSRF防护
    csrf: {
        enabled: true,
        tokenHeader: 'X-CSRF-Token'
    },

    // 速率限制
    rateLimit: {
        enabled: true,
        windowMs: 15 * 60 * 1000, // 15分钟
        maxRequests: 100
    }
};

// 安全工具函数
export class SecurityUtils {
    static validatePassword(password) {
        const config = SecurityConfig.password;
        
        if (password.length < config.minLength || password.length > config.maxLength) {
            return { valid: false, message: `密码长度必须�?{config.minLength}-${config.maxLength}个字符之间` };
        }

        if (config.requireUppercase && !/[A-Z]/.test(password)) {
            return { valid: false, message: '密码必须包含大写字母' };
        }

        if (config.requireLowercase && !/[a-z]/.test(password)) {
            return { valid: false, message: '密码必须包含小写字母' };
        }

        if (config.requireNumbers && !/\d/.test(password)) {
            return { valid: false, message: '密码必须包含数字' };
        }

        if (config.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return { valid: false, message: '密码必须包含特殊字符' };
        }

        return { valid: true };
    }

    static sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        // 移除HTML标签
        let sanitized = input.replace(/<[^>]*>/g, '');
        
        // 移除XSS模式
        SecurityConfig.xss.patterns.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '');
        });
        
        return sanitized.trim();
    }

    static generateSecureToken(payload) {
        const header = {
            alg: SecurityConfig.token.algorithm,
            typ: 'JWT',
            iss: SecurityConfig.token.issuer,
            iat: Date.now()
        };

        const tokenData = {
            ...payload,
            exp: Date.now() + SecurityConfig.token.expiresIn,
            jti: this.generateRandomId()
        };

        // 简单的base64编码（生产环境应使用真正的JWT库）
        const headerB64 = btoa(JSON.stringify(header));
        const payloadB64 = btoa(JSON.stringify(tokenData));
        
        return `${headerB64}.${payloadB64}`;
    }

    static generateRandomId() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
}
