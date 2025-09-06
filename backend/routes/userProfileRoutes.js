/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 用户ID
 *         first_name:
 *           type: string
 *           description: 名字
 *         last_name:
 *           type: string
 *           description: 姓氏
 *         telegram_id:
 *           type: string
 *           description: Telegram用户ID
 *         email:
 *           type: string
 *           format: email
 *           description: 邮箱地址
 *         avatar:
 *           type: string
 *           description: 头像URL
 *         phone:
 *           type: string
 *           description: 手机号
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           description: 性别
 *         birth_date:
 *           type: string
 *           format: date
 *           description: 出生日期
 *         height:
 *           type: number
 *           description: 身高(cm)
 *         weight:
 *           type: number
 *           description: 体重(kg)
 *         fitness_goal:
 *           type: string
 *           description: 健身目标
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *         balance:
 *           type: number
 *           description: 钱包余额
 *         frozen_balance:
 *           type: number
 *           description: 冻结余额
 *     
 *     UserStatistics:
 *       type: object
 *       properties:
 *         total_challenges:
 *           type: integer
 *           description: 总挑战数
 *         completed_challenges:
 *           type: integer
 *           description: 已完成挑战数
 *         total_checkins:
 *           type: integer
 *           description: 总签到数
 *         total_checkin_rewards:
 *           type: number
 *           description: 总签到奖励
 *     
 *     UserSettings:
 *       type: object
 *       properties:
 *         notification_email:
 *           type: boolean
 *           description: 邮件通知开关
 *         notification_sms:
 *           type: boolean
 *           description: 短信通知开关
 *         notification_push:
 *           type: boolean
 *           description: 推送通知开关
 *         privacy_profile:
 *           type: string
 *           enum: [public, friends, private]
 *           description: 个人资料隐私设置
 *         language:
 *           type: string
 *           enum: [zh-CN, en-US]
 *           description: 语言设置
 *         timezone:
 *           type: string
 *           description: 时区设置
 *     
 *     PasswordChange:
 *       type: object
 *       required:
 *         - current_password
 *         - new_password
 *       properties:
 *         current_password:
 *           type: string
 *           description: 当前密码
 *         new_password:
 *           type: string
 *           description: 新密码
 *         confirm_password:
 *           type: string
 *           description: 确认新密码
 */

const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { pool } = require('../config/database');

const router = express.Router();

// ==========================================
// 用户个人资料API接口
// ==========================================

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: 获取用户个人资料
 *     description: 获取当前登录用户的个人资料和统计信息
 *     tags: [用户个人资料]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile:
 *                       $ref: '#/components/schemas/UserProfile'
 *                     statistics:
 *                       $ref: '#/components/schemas/UserStatistics'
 *                 message:
 *                   type: string
 *                   example: 获取个人资料成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器内部错误
 */
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const [userRows] = await pool.query(`
            SELECT 
                u.id, u.email, u.telegram_id, u.first_name, u.last_name, 
                u.phone, u.avatar, u.trc20_wallet, u.is_active,
                u.created_at, u.updated_at, u.last_login,
                uw.balance, uw.frozen_balance
            FROM users u
            LEFT JOIN user_wallets uw ON u.id = uw.user_id
            WHERE u.id = ?
        `, [userId]);

        if (userRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        const user = userRows[0];

        // 获取用户统计信息
        const [statsRows] = await pool.query(`
            SELECT 
                COUNT(DISTINCT vc.id) as total_challenges,
                COUNT(DISTINCT CASE WHEN vc.status = 'completed' THEN vc.id END) as completed_challenges,
                COUNT(DISTINCT uc.id) as total_checkins,
                SUM(uc.reward_amount) as total_checkin_rewards
            FROM users u
            LEFT JOIN vip_challenges vc ON u.id = vc.user_id
            LEFT JOIN user_checkins uc ON u.id = uc.user_id
            WHERE u.id = ?
        `, [userId]);

        const stats = statsRows[0];

        res.json({
            success: true,
            data: {
                profile: user,
                statistics: stats
            },
            message: '获取个人资料成功'
        });

    } catch (error) {
        console.error('获取个人资料失败:', error);
        res.status(500).json({
            success: false,
            message: '获取个人资料失败',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: 更新用户个人资料
 *     description: 更新当前登录用户的个人资料
 *     tags: [用户个人资料]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 example: "张"
 *               last_name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 example: "三"
 *               telegram_id:
 *                 type: string
 *                 example: "123456789"
 *               phone:
 *                 type: string
 *                 pattern: "^1[3-9]\\d{9}$"
 *                 example: "13800138000"
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: "male"
 *               birth_date:
 *                 type: string
 *                 format: date
 *                 example: "2000-01-01"
 *               height:
 *                 type: number
 *                 minimum: 100
 *                 maximum: 250
 *                 example: 175
 *               weight:
 *                 type: number
 *                 minimum: 30
 *                 maximum: 200
 *                 example: 70
 *               fitness_goal:
 *                 type: string
 *                 example: "Lose weight"
 *               avatar:
 *                 type: string
 *                 example: "https://example.com/avatar.jpg"
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 个人资料更新成功
 *       400:
 *         description: 请求参数无效
 *       401:
 *         description: 未授权
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器内部错误
 */
// 更新用户个人资料
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { 
            first_name, last_name, phone, avatar, telegram_id
        } = req.body;

        // 验证输入
        if (first_name && (first_name.length < 1 || first_name.length > 50)) {
            return res.status(400).json({
                success: false,
                message: '名字长度必须在1-50个字符之间'
            });
        }

        if (last_name && (last_name.length < 1 || last_name.length > 50)) {
            return res.status(400).json({
                success: false,
                message: '姓氏长度必须在1-50个字符之间'
            });
        }

        if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: '手机号格式不正确'
            });
        }

        // 构建更新字段 - 只更新实际存在的字段
        const updateFields = [];
        const updateValues = [];

        if (first_name !== undefined) {
            updateFields.push('first_name = ?');
            updateValues.push(first_name);
        }
        
        if (last_name !== undefined) {
            updateFields.push('last_name = ?');
            updateValues.push(last_name);
        }
        
        if (phone !== undefined) {
            updateFields.push('phone = ?');
            updateValues.push(phone);
        }
        
        if (avatar !== undefined) {
            updateFields.push('avatar = ?');
            updateValues.push(avatar);
        }
        
        if (telegram_id !== undefined) {
            updateFields.push('telegram_id = ?');
            updateValues.push(telegram_id);
        }
        
        // 如果没有提供任何更新字段
        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: '没有提供有效的更新字段。支持更新：first_name, last_name, phone, avatar, telegram_id'
            });
        }

        updateFields.push('updated_at = NOW()');
        updateValues.push(userId);

        const [result] = await pool.query(`
            UPDATE users SET ${updateFields.join(', ')} WHERE id = ?
        `, updateValues);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        res.json({
            success: true,
            message: '个人资料更新成功'
        });

    } catch (error) {
        console.error('更新个人资料失败:', error);
        res.status(500).json({
            success: false,
            message: '更新个人资料失败',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/user/password:
 *   put:
 *     summary: 修改密码
 *     description: 修改当前登录用户的密码
 *     tags: [用户个人资料]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current_password
 *               - new_password
 *             properties:
 *               current_password:
 *                 type: string
 *                 description: 当前密码
 *                 example: "currentPassword123"
 *               new_password:
 *                 type: string
 *                 description: 新密码
 *                 example: "newPassword123"
 *               confirm_password:
 *                 type: string
 *                 description: 确认新密码
 *                 example: "newPassword123"
 *     responses:
 *       200:
 *         description: 密码修改成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 密码修改成功
 *       400:
 *         description: 请求参数无效
 *       401:
 *         description: 未授权
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器内部错误
 */
// 修改密码
router.put('/password', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({
                success: false,
                message: '当前密码和新密码不能为空'
            });
        }

        if (new_password.length < 6) {
            return res.status(400).json({
                success: false,
                message: '新密码长度不能少于6位'
            });
        }

        // 验证当前密码
        const [userRows] = await pool.query(`
            SELECT password_hash FROM users WHERE id = ?
        `, [userId]);

        if (userRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        const bcrypt = require('bcryptjs');
        const isValidPassword = await bcrypt.compare(current_password, userRows[0].password_hash);

        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: '当前密码不正确'
            });
        }

        // 生成新密码哈希
        const newPasswordHash = await bcrypt.hash(new_password, 10);

        // 更新密码
        await pool.query(`
            UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?
        `, [newPasswordHash, userId]);

        res.json({
            success: true,
            message: '密码修改成功'
        });

    } catch (error) {
        console.error('修改密码失败:', error);
        res.status(500).json({
            success: false,
            message: '修改密码失败',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/user/settings:
 *   get:
 *     summary: 获取用户设置
 *     description: 获取当前登录用户的设置
 *     tags: [用户个人资料]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserSettings'
 *                 message:
 *                   type: string
 *                   example: 获取用户设置成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 用户设置不存在
 *       500:
 *         description: 服务器内部错误
 */
// 获取用户设置
router.get('/settings', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const [settingsRows] = await pool.query(`
            SELECT 
                notification_email, notification_sms, notification_push,
                privacy_profile, privacy_stats, privacy_challenges,
                language, timezone, theme
            FROM user_settings WHERE user_id = ?
        `, [userId]);

        let settings = settingsRows[0];
        
        // 如果没有设置记录，创建默认设置
        if (!settings) {
            const defaultSettings = {
                notification_email: true,
                notification_sms: false,
                notification_push: true,
                privacy_profile: 'public',
                privacy_stats: 'friends',
                privacy_challenges: 'public',
                language: 'zh-CN',
                timezone: 'Asia/Shanghai',
                theme: 'light'
            };

            await pool.query(`
                INSERT INTO user_settings (user_id, notification_email, notification_sms, 
                notification_push, privacy_profile, privacy_stats, privacy_challenges, 
                language, timezone, theme) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                userId, defaultSettings.notification_email, defaultSettings.notification_sms,
                defaultSettings.notification_push, defaultSettings.privacy_profile,
                defaultSettings.privacy_stats, defaultSettings.privacy_challenges,
                defaultSettings.language, defaultSettings.timezone, defaultSettings.theme
            ]);

            settings = defaultSettings;
        }

        res.json({
            success: true,
            data: settings,
            message: '获取用户设置成功'
        });

    } catch (error) {
        console.error('获取用户设置失败:', error);
        res.status(500).json({
            success: false,
            message: '获取用户设置失败',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/user/settings:
 *   put:
 *     summary: 更新用户设置
 *     description: 更新当前登录用户的设置
 *     tags: [用户个人资料]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notification_email:
 *                 type: boolean
 *                 description: 邮件通知开关
 *                 example: true
 *               notification_sms:
 *                 type: boolean
 *                 description: 短信通知开关
 *                 example: false
 *               notification_push:
 *                 type: boolean
 *                 description: 推送通知开关
 *                 example: true
 *               privacy_profile:
 *                 type: string
 *                 enum: [public, friends, private]
 *                 description: 个人资料隐私设置
 *                 example: "public"
 *               privacy_stats:
 *                 type: string
 *                 enum: [public, friends, private]
 *                 description: 统计信息隐私设置
 *                 example: "friends"
 *               privacy_challenges:
 *                 type: string
 *                 enum: [public, friends, private]
 *                 description: 挑战隐私设置
 *                 example: "public"
 *               language:
 *                 type: string
 *                 enum: [zh-CN, en-US]
 *                 description: 语言设置
 *                 example: "zh-CN"
 *               timezone:
 *                 type: string
 *                 description: 时区设置
 *                 example: "Asia/Shanghai"
 *               theme:
 *                 type: string
 *                 enum: [light, dark, auto]
 *                 description: 主题设置
 *                 example: "light"
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 用户设置更新成功
 *       400:
 *         description: 请求参数无效
 *       401:
 *         description: 未授权
 *       404:
 *         description: 用户设置不存在
 *       500:
 *         description: 服务器内部错误
 */
// 更新用户设置
router.put('/settings', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;

        // 验证设置值
        const validSettings = {
            notification_email: 'boolean',
            notification_sms: 'boolean',
            notification_push: 'boolean',
            privacy_profile: ['public', 'friends', 'private'],
            privacy_stats: ['public', 'friends', 'private'],
            privacy_challenges: ['public', 'friends', 'private'],
            language: ['zh-CN', 'en-US'],
            timezone: 'string',
            theme: ['light', 'dark', 'auto']
        };

        const updateFields = [];
        const updateValues = [];

        for (const [key, value] of Object.entries(updateData)) {
            if (validSettings[key]) {
                if (Array.isArray(validSettings[key])) {
                    if (validSettings[key].includes(value)) {
                        updateFields.push(`${key} = ?`);
                        updateValues.push(value);
                    }
                } else if (validSettings[key] === 'boolean') {
                    if (typeof value === 'boolean') {
                        updateFields.push(`${key} = ?`);
                        updateValues.push(value);
                    }
                } else if (validSettings[key] === 'string') {
                    updateFields.push(`${key} = ?`);
                    updateValues.push(value);
                }
            }
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: '没有提供有效的设置字段'
            });
        }

        updateValues.push(userId);

        // 检查是否已有设置记录
        const [existingRows] = await pool.query(`
            SELECT id FROM user_settings WHERE user_id = ?
        `, [userId]);

        if (existingRows.length > 0) {
            // 更新现有设置
            await pool.query(`
                UPDATE user_settings SET ${updateFields.join(', ')} WHERE user_id = ?
            `, updateValues);
        } else {
            // 创建新设置记录
            const allFields = Object.keys(validSettings);
            const allValues = allFields.map(field => updateData[field] || getDefaultValue(field));
            allValues.push(userId);

            await pool.query(`
                INSERT INTO user_settings (${allFields.join(', ')}, user_id) VALUES (${allFields.map(() => '?').join(', ')})
            `, allValues);
        }

        res.json({
            success: true,
            message: '用户设置更新成功'
        });

    } catch (error) {
        console.error('更新用户设置失败:', error);
        res.status(500).json({
            success: false,
            message: '更新用户设置失败',
            error: error.message
        });
    }
});

// 获取默认设置值
function getDefaultValue(setting) {
    const defaults = {
        notification_email: true,
        notification_sms: false,
        notification_push: true,
        privacy_profile: 'public',
        privacy_stats: 'friends',
        privacy_challenges: 'public',
        language: 'zh-CN',
        timezone: 'Asia/Shanghai',
        theme: 'light'
    };
    return defaults[setting] || null;
}

module.exports = router;
