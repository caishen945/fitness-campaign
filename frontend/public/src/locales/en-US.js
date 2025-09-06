export default {
  // 通用文本
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    retry: 'Retry'
  },

  // 注册页面
  register: {
    title: 'User Registration',
    emailLabel: 'Email Address',
    emailPlaceholder: 'Please enter your email address',
    emailHint: 'We will use email as your login account',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Please enter your password',
    passwordHint: 'Password must be at least 6 characters',
    confirmPasswordLabel: 'Confirm Password',
    confirmPasswordPlaceholder: 'Please enter password again',
    registerButton: 'Register',
    orDivider: 'or',
    telegramRegisterButton: 'Telegram Quick Registration',
    loginLink: 'Already have an account? Login now',
    telegramTitle: 'Register with Telegram',
    telegramDescription: 'Quick and secure registration using your Telegram account'
  },

  // Telegram授权弹窗
  telegramAuth: {
    title: 'Telegram Authorization',
    subtitle: 'Complete registration with Telegram',
    botInfo: {
      title: 'Bot Information',
      name: 'Bot Name',
      username: 'Username',
      description: 'Official FitChallenge Bot for secure authentication'
    },
    instructions: {
      title: 'How to authorize',
      step1: '1. Open Telegram app on your device',
      step2: '2. Search for @Fit_FitChallengeBOT',
      step3: '3. Click "Start" button',
      step4: '4. Return to this page to complete registration'
    },
    deviceOptimization: {
      mobile: 'Mobile Device Detected',
      mobileHint: 'You can open Telegram app directly from here',
      desktop: 'Desktop Device Detected',
      desktopHint: 'Please use Telegram app on your phone or scan QR code',
      qrCode: 'QR Code',
      qrCodeHint: 'Scan with Telegram app to open bot'
    },
    actions: {
      openTelegram: 'Open Telegram',
      scanQRCode: 'Scan QR Code',
      refreshStatus: 'Refresh Status',
      completeRegistration: 'Complete Registration',
      alternativeRegistration: 'Use Email Registration Instead'
    },
    status: {
      waiting: 'Waiting for authorization...',
      authorized: 'Authorization successful!',
      failed: 'Authorization failed',
      expired: 'Authorization expired, please try again'
    },
    errors: {
      botNotFound: 'Bot not found, please check the username',
      authorizationFailed: 'Authorization failed, please try again',
      networkError: 'Network error, please check your connection',
      timeout: 'Authorization timeout, please try again'
    }
  },

  // 错误信息
  errors: {
    networkError: 'Network connection error, please check your connection',
    serverError: 'Server error, please try again later',
    validationError: 'Please check your input and try again',
    telegramAuthError: 'Telegram authorization failed',
    userExists: 'User already exists',
    invalidData: 'Invalid data provided'
  },

  // 成功信息
  success: {
    registrationComplete: 'Registration completed successfully!',
    telegramAuthSuccess: 'Telegram authorization successful!',
    redirecting: 'Redirecting to homepage...'
  }
};
