/**
 * 输入验证工具
 * 提供统一的输入验证和SQL注入防护
 */

const validator = require('validator');

class ValidationUtils {
    
    /**
     * 验证邮箱格式
     * @param {string} email 邮箱地址
     * @returns {boolean} 是否有效
     */
    static isValidEmail(email) {
        if (!email || typeof email !== 'string') return false;
        return validator.isEmail(email) && email.length <= 100;
    }

    /**
     * 验证密码强度
     * @param {string} password 密码
     * @returns {boolean} 是否符合要求
     */
    static isValidPassword(password) {
        if (!password || typeof password !== 'string') return false;
        // 至少8位，包含字母和数字
        return password.length >= 8 && password.length <= 100 &&
               /^(?=.*[A-Za-z])(?=.*\d)/.test(password);
    }

    /**
     * 验证用户名
     * @param {string} username 用户名
     * @returns {boolean} 是否有效
     */
    static isValidUsername(username) {
        if (!username || typeof username !== 'string') return false;
        // 3-50个字符，只允许字母、数字、下划线
        return /^[a-zA-Z0-9_]{3,50}$/.test(username);
    }

    /**
     * 清理SQL注入风险字符
     * @param {string} input 输入字符串
     * @returns {string} 清理后的字符串
     */
    static sanitizeInput(input) {
        if (!input || typeof input !== 'string') return '';
        return input.replace(/['"\\;--]/g, '').trim();
    }

    /**
     * 验证数字范围
     * @param {any} value 数值
     * @param {number} min 最小值
     * @param {number} max 最大值
     * @returns {boolean} 是否在范围内
     */
    static isValidNumber(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
        const num = Number(value);
        return !isNaN(num) && num >= min && num <= max;
    }

    /**
     * 验证ID格式
     * @param {any} id ID值
     * @returns {boolean} 是否有效
     */
    static isValidId(id) {
        return this.isValidNumber(id, 1);
    }

    /**
     * 验证手机号
     * @param {string} phone 手机号
     * @returns {boolean} 是否有效
     */
    static isValidPhone(phone) {
        if (!phone || typeof phone !== 'string') return false;
        return /^1[3-9]\d{9}$/.test(phone);
    }

    /**
     * 验证URL格式
     * @param {string} url URL地址
     * @returns {boolean} 是否有效
     */
    static isValidUrl(url) {
        if (!url || typeof url !== 'string') return false;
        return validator.isURL(url);
    }

    /**
     * 请求体验证中间件
     * @param {object} schema 验证规则
     * @returns {function} Express中间件
     */
    static validateBody(schema) {
        return (req, res, next) => {
            const errors = [];

            for (const [field, rules] of Object.entries(schema)) {
                const value = req.body[field];

                // 检查必填字段
                if (rules.required && (value === undefined || value === null || value === '')) {
                    errors.push(`${field} 是必填字段`);
                    continue;
                }

                // 如果不是必填且为空，跳过验证
                if (!rules.required && (value === undefined || value === null || value === '')) {
                    continue;
                }

                // 类型验证
                if (rules.type && typeof value !== rules.type) {
                    errors.push(`${field} 类型错误，期望 ${rules.type}`);
                    continue;
                }

                // 长度验证
                if (rules.minLength && value.length < rules.minLength) {
                    errors.push(`${field} 长度至少为 ${rules.minLength} 个字符`);
                }
                if (rules.maxLength && value.length > rules.maxLength) {
                    errors.push(`${field} 长度不能超过 ${rules.maxLength} 个字符`);
                }

                // 自定义验证
                if (rules.validator && !rules.validator(value)) {
                    errors.push(`${field} 格式不正确`);
                }
            }

            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: '输入验证失败',
                    errors: errors
                });
            }

            next();
        };
    }

    /**
     * 查询参数验证中间件
     * @param {object} schema 验证规则
     * @returns {function} Express中间件
     */
    static validateQuery(schema) {
        return (req, res, next) => {
            const errors = [];

            for (const [field, rules] of Object.entries(schema)) {
                const value = req.query[field];

                // 检查必填字段
                if (rules.required && !value) {
                    errors.push(`查询参数 ${field} 是必填的`);
                    continue;
                }

                // 如果不是必填且为空，跳过验证
                if (!rules.required && !value) {
                    continue;
                }

                // 数字验证
                if (rules.type === 'number') {
                    if (!this.isValidNumber(value, rules.min, rules.max)) {
                        errors.push(`查询参数 ${field} 必须是有效数字`);
                    }
                }

                // 自定义验证
                if (rules.validator && !rules.validator(value)) {
                    errors.push(`查询参数 ${field} 格式不正确`);
                }
            }

            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: '查询参数验证失败',
                    errors: errors
                });
            }

            next();
        };
    }
}

module.exports = ValidationUtils;