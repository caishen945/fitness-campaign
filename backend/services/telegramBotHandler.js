const axios = require('axios');
const TelegramService = require('./telegramService');

class TelegramBotHandler {
    constructor() {
        this.botToken = '8208922479:AAH-W6WnIijh3FLl1_ngYc0korHoBZx4hws';
        this.apiBaseUrl = `https://api.telegram.org/bot${this.botToken}`;
        this.telegramService = TelegramService;
    }

    // 处理接收到的消息
    async handleMessage(update) {
        try {
            if (update.message) {
                return await this.processMessage(update.message);
            } else if (update.callback_query) {
                return await this.processCallbackQuery(update.callback_query);
            }
        } catch (error) {
            console.error('处理Telegram消息失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 处理文本消息
    async processMessage(message) {
        console.log('🔍 收到消息:', JSON.stringify(message, null, 2));
        
        // 检查消息结构
        if (!message || typeof message !== 'object') {
            console.error('❌ 无效的消息格式');
            return { success: false, error: '无效的消息格式' };
        }
        
        // 尝试不同的字段名
        const chat_id = message.chat_id || message.chat?.id || message.chat_id;
        const text = message.text || message.message?.text;
        const from = message.from || message.message?.from;
        
        console.log('🔍 解析的消息数据:', { 
            chat_id, 
            text: text?.substring(0, 50), 
            from,
            messageKeys: Object.keys(message)
        });
        
        if (!text) return { success: false, error: '无效消息' };
        if (!chat_id) {
            console.error('❌ chat_id缺失，消息结构:', message);
            return { success: false, error: 'chat_id缺失' };
        }

        const command = text.toLowerCase().trim();

        try {
            switch (command) {
                case '/start':
                    return await this.handleStartCommand(chat_id, from);
                case '/help':
                    return await this.handleHelpCommand(chat_id);
                case '/login':
                    return await this.handleLoginCommand(chat_id);
                case '/register':
                    return await this.handleRegisterCommand(chat_id);
                case '/profile':
                    return await this.handleProfileCommand(chat_id, from);
                default:
                    return await this.handleUnknownCommand(chat_id, text);
            }
        } catch (error) {
            console.error('处理命令失败:', error);
            return await this.sendMessage(chat_id, '❌ 处理命令时发生错误，请稍后重试。');
        }
    }

    // 处理 /start 命令
    async handleStartCommand(chatId, user) {
        const welcomeMessage = `
🎉 欢迎使用 FitChallenge！

👋 您好，${user.first_name || '用户'}！

🏃‍♂️ FitChallenge 是一个健康挑战平台，帮助您：
• 设定健身目标
• 追踪运动进度
• 获得成就奖励
• 与朋友竞争

📱 使用以下命令开始您的健康之旅：

/start - 显示此欢迎信息
/login - 快捷登录到平台
/register - 注册新账户
/profile - 查看个人资料
/help - 获取帮助信息

🔗 点击下方按钮快速访问平台：
        `;

        const keyboard = {
            inline_keyboard: [
                [
                    { text: '🚀 开始挑战', callback_data: 'start_challenge' },
                    { text: '📱 快捷登录', callback_data: 'quick_login' }
                ],
                [
                    { text: '📝 注册账户', callback_data: 'register' },
                    { text: '❓ 帮助中心', callback_data: 'help' }
                ]
            ]
        };

        return await this.sendMessage(chatId, welcomeMessage, keyboard);
    }

    // 处理 /help 命令
    async handleHelpCommand(chatId) {
        const helpMessage = `
❓ FitChallenge 帮助中心

📋 可用命令：
/start - 显示欢迎信息
/login - 快捷登录到平台
/register - 注册新账户
/profile - 查看个人资料
/help - 显示此帮助信息

🔗 平台功能：
• 用户注册和登录
• 个人资料管理
• 健身挑战设置
• 进度追踪
• 成就系统
• 排行榜

🌐 访问平台：
http://localhost:8000

📞 技术支持：
如有问题，请联系管理员
        `;

        return await this.sendMessage(chatId, helpMessage);
    }

    // 处理 /login 命令
    async handleLoginCommand(chatId) {
        const loginMessage = `
🔐 快捷登录

点击下方按钮直接登录到 FitChallenge 平台：

• 支持 Telegram 快捷登录
• 无需输入密码
• 安全可靠
        `;

        const keyboard = {
            inline_keyboard: [
                [
                    { text: '🔑 立即登录', callback_data: 'login' }
                ],
                [
                    { text: '📱 测试页面', callback_data: 'test_page' }
                ]
            ]
        };

        return await this.sendMessage(chatId, loginMessage, keyboard);
    }

    // 处理 /register 命令
    async handleRegisterCommand(chatId) {
        const registerMessage = `
📝 用户注册

欢迎加入 FitChallenge 社区！

点击下方按钮开始注册：

• 快速注册流程
• 支持 Telegram 快捷注册
• 自动创建用户资料
        `;

        const keyboard = {
            inline_keyboard: [
                [
                    { text: '📝 立即注册', callback_data: 'register' }
                ],
                [
                    { text: '🔍 了解更多', callback_data: 'about' }
                ]
            ]
        };

        return await this.sendMessage(chatId, registerMessage, keyboard);
    }

    // 处理 /profile 命令
    async handleProfileCommand(chatId, user) {
        try {
            // 尝试查找用户资料
            const userProfile = await this.telegramService.findOrCreateUserByTelegram({
                telegramId: user.id,
                firstName: user.first_name,
                lastName: user.last_name || '',
                username: user.username || '',
                auth_date: Math.floor(Date.now() / 1000),
                hash: 'profile_check'
            });

            if (userProfile.success) {
                const profileMessage = `
👤 个人资料

📱 Telegram 信息：
• ID: ${user.id}
• 姓名: ${user.first_name} ${user.last_name || ''}
• 用户名: @${user.username || '未设置'}

🏃‍♂️ FitChallenge 信息：
• 用户ID: ${userProfile.user.id}
• 用户名: ${userProfile.user.username}
• 邮箱: ${userProfile.user.email}
• 注册状态: ${userProfile.isNewUser ? '新用户' : '已注册'}

🔗 管理您的资料：
                `;

                const keyboard = {
                    inline_keyboard: [
                        [
                            { text: '✏️ 编辑资料', web_app: { url: 'http://localhost:8000/#profile' } }
                        ],
                        [
                            { text: '🔄 刷新信息', callback_data: 'refresh_profile' }
                        ]
                    ]
                };

                return await this.sendMessage(chatId, profileMessage, keyboard);
            } else {
                return await this.sendMessage(chatId, '❌ 无法获取用户资料，请先注册账户。');
            }
        } catch (error) {
            console.error('获取用户资料失败:', error);
            return await this.sendMessage(chatId, '❌ 获取用户资料失败，请稍后重试。');
        }
    }

    // 处理未知命令
    async handleUnknownCommand(chatId, text) {
        const unknownMessage = `
❓ 未知命令

您输入了: "${text}"

📋 可用的命令：
/start - 显示欢迎信息
/login - 快捷登录
/register - 注册账户
/profile - 查看资料
/help - 获取帮助

💡 提示：使用 /help 查看所有可用命令
        `;

        return await this.sendMessage(chatId, unknownMessage);
    }

    // 处理回调查询（按钮点击）
    async processCallbackQuery(callbackQuery) {
        const { id, data, message } = callbackQuery;
        const chatId = message.chat.id;

        try {
            switch (data) {
                case 'help':
                    await this.answerCallbackQuery(id, '显示帮助信息');
                    return await this.handleHelpCommand(chatId);
                case 'start_challenge':
                    await this.answerCallbackQuery(id, '开始挑战');
                    return await this.sendMessage(chatId, `
🚀 开始挑战

欢迎来到 FitChallenge！

📋 当前可用的挑战：
• 🏃‍♂️ 每日步数挑战
• 💪 力量训练挑战
• 🧘‍♀️ 瑜伽冥想挑战
• 🏊‍♂️ 游泳挑战

💡 提示：访问 http://localhost:8000 开始您的第一个挑战！
                    `);
                case 'quick_login':
                    await this.answerCallbackQuery(id, '快捷登录');
                    return await this.sendMessage(chatId, `
🔑 快捷登录

要使用快捷登录功能，请：

1. 访问 http://localhost:8000/#login
2. 点击 "Telegram 快捷登录" 按钮
3. 授权登录

💡 提示：确保您已在该页面中打开
                    `);
                case 'register':
                    await this.answerCallbackQuery(id, '用户注册');
                    return await this.sendMessage(chatId, `
📝 用户注册

要注册新账户，请：

1. 访问 http://localhost:8000/#register
2. 点击 "Telegram 快捷注册" 按钮
3. 完成注册流程

💡 提示：确保您已在该页面中打开
                    `);
                case 'login':
                    await this.answerCallbackQuery(id, '立即登录');
                    return await this.sendMessage(chatId, `
🔑 立即登录

要使用快捷登录功能，请：

1. 访问 http://localhost:8000/#login
2. 点击 "Telegram 快捷登录" 按钮
3. 授权登录

💡 提示：确保您已在该页面中打开
                    `);
                case 'test_page':
                    await this.answerCallbackQuery(id, '测试页面');
                    return await this.sendMessage(chatId, `
📱 测试页面

要测试 Telegram 环境，请访问：

http://localhost:8000/telegram-debug.html

这个页面可以帮助您诊断 Telegram Web App 环境问题。
                    `);
                case 'about':
                    await this.answerCallbackQuery(id, '关于 FitChallenge');
                    return await this.sendMessage(chatId, `
🏃‍♂️ 关于 FitChallenge

FitChallenge 是一个创新的健康挑战平台，致力于帮助用户：

🎯 目标设定
• 个性化健身目标
• 科学的目标分解
• 进度追踪和调整

🏆 挑战系统
• 每日/每周挑战
• 成就解锁
• 排行榜竞争

📊 数据分析
• 运动数据统计
• 趋势分析
• 个性化建议

🤝 社交功能
• 好友挑战
• 团队合作
• 社区分享

💪 开始您的健康之旅吧！
                    `);
                case 'refresh_profile':
                    await this.answerCallbackQuery(id, '刷新个人资料');
                    // 重新获取用户信息
                    const user = callbackQuery.from;
                    return await this.handleProfileCommand(chatId, user);
                default:
                    await this.answerCallbackQuery(id, '未知操作');
                    return await this.sendMessage(chatId, '❌ 未知的操作，请使用菜单中的按钮。');
            }
        } catch (error) {
            console.error('处理回调查询失败:', error);
            await this.answerCallbackQuery(id, '操作失败');
            return await this.sendMessage(chatId, '❌ 操作失败，请稍后重试。');
        }
    }

    // 发送消息
    async sendMessage(chatId, text, replyMarkup = null) {
        try {
            console.log('🔍 准备发送消息:', { chatId, textLength: text?.length, replyMarkup });
            
            if (!chatId) {
                console.error('❌ chatId为空，无法发送消息');
                return { success: false, error: 'chatId为空' };
            }
            
            const payload = {
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML'
            };

            if (replyMarkup) {
                payload.reply_markup = JSON.stringify(replyMarkup);
            }

            const response = await axios.post(`${this.apiBaseUrl}/sendMessage`, payload);
            
            if (response.data.ok) {
                return { success: true, message_id: response.data.result.message_id };
            } else {
                throw new Error(response.data.description || '发送消息失败');
            }
        } catch (error) {
            console.error('发送Telegram消息失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 回答回调查询
    async answerCallbackQuery(callbackQueryId, text = '') {
        try {
            await axios.post(`${this.apiBaseUrl}/answerCallbackQuery`, {
                callback_query_id: callbackQueryId,
                text: text
            });
        } catch (error) {
            console.error('回答回调查询失败:', error);
        }
    }

    // 设置Webhook（可选，用于生产环境）
    async setWebhook(url) {
        try {
            const response = await axios.post(`${this.apiBaseUrl}/setWebhook`, {
                url: url
            });
            return response.data;
        } catch (error) {
            console.error('设置Webhook失败:', error);
            throw error;
        }
    }

    // 删除Webhook
    async deleteWebhook() {
        try {
            const response = await axios.post(`${this.apiBaseUrl}/deleteWebhook`);
            return response.data;
        } catch (error) {
            console.error('删除Webhook失败:', error);
            throw error;
        }
    }

    // 获取Webhook信息
    async getWebhookInfo() {
        try {
            const response = await axios.get(`${this.apiBaseUrl}/getWebhookInfo`);
            return response.data;
        } catch (error) {
            console.error('获取Webhook信息失败:', error);
            throw error;
        }
    }

    // 获取Bot信息
    async getBotInfo() {
        try {
            const response = await axios.get(`${this.apiBaseUrl}/getMe`);
            return response.data;
        } catch (error) {
            console.error('获取Bot信息失败:', error);
            throw error;
        }
    }

    // 获取更新（用于轮询）
    async getUpdates(offset = 0, limit = 100, timeout = 0) {
        try {
            const params = {
                offset: offset,
                limit: limit
            };

            if (timeout > 0) {
                params.timeout = timeout;
            }

            const response = await axios.get(`${this.apiBaseUrl}/getUpdates`, { params });
            return response.data;
        } catch (error) {
            console.error('获取Telegram更新失败:', error);
            throw error;
        }
    }
}

module.exports = new TelegramBotHandler();
