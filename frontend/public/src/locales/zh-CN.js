export default {
  // 通用文本
  common: {
    loading: '加载中...',
    error: '错误',
    success: '成功',
    cancel: '取消',
    confirm: '确认',
    close: '关闭',
    back: '返回',
    next: '下一步',
    retry: '重试'
  },

  // 注册页面
  register: {
    title: '用户注册',
    emailLabel: '邮箱地址',
    emailPlaceholder: '请输入邮箱地址',
    emailHint: '我们将使用邮箱作为您的登录账号',
    passwordLabel: '密码',
    passwordPlaceholder: '请输入密码',
    passwordHint: '密码至少6位字符',
    confirmPasswordLabel: '确认密码',
    confirmPasswordPlaceholder: '请再次输入密码',
    registerButton: '注册',
    orDivider: '或',
    telegramRegisterButton: 'Telegram 快捷注册',
    loginLink: '已有账号？立即登录',
    telegramTitle: '使用Telegram注册',
    telegramDescription: '使用您的Telegram账户快速安全注册'
  },

  // Telegram授权弹窗
  telegramAuth: {
    title: 'Telegram授权',
    subtitle: '完成Telegram注册',
    botInfo: {
      title: '机器人信息',
      name: '机器人名称',
      username: '用户名',
      description: '官方FitChallenge机器人，用于安全认证'
    },
    instructions: {
      title: '如何授权',
      step1: '1. 在您的设备上打开Telegram应用',
      step2: '2. 搜索 @Fit_FitChallengeBOT',
      step3: '3. 点击"开始"按钮',
      step4: '4. 返回此页面完成注册'
    },
    deviceOptimization: {
      mobile: '检测到移动设备',
      mobileHint: '您可以直接从这里打开Telegram应用',
      desktop: '检测到桌面设备',
      desktopHint: '请在手机上使用Telegram应用或扫描二维码',
      qrCode: '二维码',
      qrCodeHint: '使用Telegram应用扫描打开机器人'
    },
    actions: {
      openTelegram: '打开Telegram',
      scanQRCode: '扫描二维码',
      refreshStatus: '刷新状态',
      completeRegistration: '完成注册',
      alternativeRegistration: '使用邮箱注册'
    },
    status: {
      waiting: '等待授权中...',
      authorized: '授权成功！',
      failed: '授权失败',
      expired: '授权已过期，请重试'
    },
    errors: {
      botNotFound: '未找到机器人，请检查用户名',
      authorizationFailed: '授权失败，请重试',
      networkError: '网络错误，请检查连接',
      timeout: '授权超时，请重试'
    }
  },

  // 错误信息
  errors: {
    networkError: '网络连接错误，请检查您的网络连接',
    serverError: '服务器错误，请稍后重试',
    validationError: '请检查您的输入并重试',
    telegramAuthError: 'Telegram授权失败',
    userExists: '用户已存在',
    invalidData: '提供的数据无效'
  },

  // 成功信息
  success: {
    registrationComplete: '注册成功完成！',
    telegramAuthSuccess: 'Telegram授权成功！',
    redirecting: '正在跳转到主页...'
  }
};
