import i18n, { t, getDeviceType } from '../locales/index.js';

class TelegramAuthModal {
  constructor(app) {
    this.app = app;
    this.isVisible = false;
    this.authStatus = 'waiting'; // waiting, authorized, failed, expired
    this.checkInterval = null;
    this.modalElement = null;
    this.init();
  }

  init() {
    this.createModal();
    this.bindEvents();
  }

  createModal() {
    const modalHTML = `
      <div id="telegramAuthModal" class="telegram-auth-modal" style="display: none;">
        <div class="modal-overlay"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">${t('telegramAuth.title')}</h3>
            <button class="modal-close" aria-label="${t('common.close')}">×</button>
          </div>
          
          <div class="modal-body">
            <div class="auth-subtitle">${t('telegramAuth.subtitle')}</div>
            
            <!-- Bot信息 -->
            <div class="bot-info-section">
              <h4>${t('telegramAuth.botInfo.title')}</h4>
              <div class="bot-info">
                <div class="bot-avatar">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.48.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.178.164.172.213.421.227.59-.001.187-.033.321-.1.425z"/>
                  </svg>
                </div>
                <div class="bot-details">
                  <div class="bot-name">@Fit_FitChallengeBOT</div>
                  <div class="bot-description">${t('telegramAuth.botInfo.description')}</div>
                </div>
              </div>
            </div>
            
            <!-- 设备优化提示 -->
            <div class="device-optimization">
              <div class="device-info">
                <span class="device-icon">📱</span>
                <span class="device-text">${this.getDeviceOptimizationText()}</span>
              </div>
            </div>
            
            <!-- 操作指引 -->
            <div class="instructions-section">
              <h4>${t('telegramAuth.instructions.title')}</h4>
              <div class="instructions-list">
                <div class="instruction-step">${t('telegramAuth.instructions.step1')}</div>
                <div class="instruction-step">${t('telegramAuth.instructions.step2')}</div>
                <div class="instruction-step">${t('telegramAuth.instructions.step3')}</div>
                <div class="instruction-step">${t('telegramAuth.instructions.step4')}</div>
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="actions-section">
              <button class="btn btn-primary btn-telegram" id="openTelegramBtn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.48.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.178.164.172.213.421.227.59-.001.187-.033.321-.1.425z"/>
                </svg>
                ${t('telegramAuth.actions.openTelegram')}
              </button>
              
              <button class="btn btn-secondary" id="refreshStatusBtn">
                ${t('telegramAuth.actions.refreshStatus')}
              </button>
              
              <button class="btn btn-outline" id="alternativeRegistrationBtn">
                ${t('telegramAuth.actions.alternativeRegistration')}
              </button>
            </div>
            
            <!-- 状态显示 -->
            <div class="status-section" id="statusSection" style="display: none;">
              <div class="status-indicator">
                <div class="status-icon" id="statusIcon">⏳</div>
                <div class="status-text" id="statusText">${t('telegramAuth.status.waiting')}</div>
              </div>
            </div>
            
            <!-- 错误显示 -->
            <div class="error-section" id="errorSection" style="display: none;">
              <div class="error-message" id="errorMessage"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    // 添加到页面
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modalElement = document.getElementById('telegramAuthModal');
  }

  bindEvents() {
    // 关闭弹窗
    const closeBtn = this.modalElement.querySelector('.modal-close');
    const overlay = this.modalElement.querySelector('.modal-overlay');
    
    closeBtn.addEventListener('click', () => this.hide());
    overlay.addEventListener('click', () => this.hide());
    
    // 打开Telegram按钮
    const openTelegramBtn = this.modalElement.querySelector('#openTelegramBtn');
    openTelegramBtn.addEventListener('click', () => this.openTelegram());
    
    // 刷新状态按钮
    const refreshStatusBtn = this.modalElement.querySelector('#refreshStatusBtn');
    refreshStatusBtn.addEventListener('click', () => this.refreshStatus());
    
    // 备选注册按钮
    const alternativeBtn = this.modalElement.querySelector('#alternativeRegistrationBtn');
    alternativeBtn.addEventListener('click', () => this.showAlternativeRegistration());
    
    // 键盘事件
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  // 获取设备优化文本
  getDeviceOptimizationText() {
    const deviceType = getDeviceType();
    const translations = i18n.getTranslations();
    
    switch (deviceType) {
      case 'ios':
      case 'android':
      case 'mobile':
        return translations.telegramAuth.deviceOptimization.mobile + ': ' + 
               translations.telegramAuth.deviceOptimization.mobileHint;
      case 'desktop':
        return translations.telegramAuth.deviceOptimization.desktop + ': ' + 
               translations.telegramAuth.deviceOptimization.desktopHint;
      default:
        return translations.telegramAuth.deviceOptimization.desktop + ': ' + 
               translations.telegramAuth.deviceOptimization.desktopHint;
    }
  }

  // 显示弹窗
  show() {
    this.isVisible = true;
    this.modalElement.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // 开始检查授权状态
    this.startStatusCheck();
    
    // 更新UI
    this.updateUI();
  }

  // 隐藏弹窗
  hide() {
    this.isVisible = false;
    this.modalElement.style.display = 'none';
    document.body.style.overflow = '';
    
    // 停止状态检查
    this.stopStatusCheck();
    
    // 重置状态
    this.resetStatus();
  }

  // 打开Telegram
  openTelegram() {
    const deviceType = getDeviceType();
    
    try {
      if (deviceType === 'mobile') {
        // 移动设备：尝试打开Telegram应用
        this.openTelegramApp();
      } else {
        // 桌面设备：显示二维码或提供链接
        this.showQRCodeOrLink();
      }
    } catch (error) {
      console.error('Failed to open Telegram:', error);
      this.showError(t('telegramAuth.errors.botNotFound'));
    }
  }

  // 在移动设备上打开Telegram应用
  openTelegramApp() {
    const telegramUrl = 'tg://resolve?domain=Fit_FitChallengeBOT';
    const webUrl = 'https://t.me/Fit_FitChallengeBOT';
    
    // 尝试使用tg://协议打开应用
    window.location.href = telegramUrl;
    
    // 如果tg://协议失败，延迟后跳转到web版本
    setTimeout(() => {
      window.open(webUrl, '_blank');
    }, 1000);
  }

  // 显示二维码或链接
  showQRCodeOrLink() {
    const webUrl = 'https://t.me/Fit_FitChallengeBOT';
    
    // 创建二维码弹窗
    const qrModal = document.createElement('div');
    qrModal.className = 'qr-modal';
    qrModal.innerHTML = `
      <div class="qr-content">
        <h4>${t('telegramAuth.deviceOptimization.qrCode')}</h4>
        <p>${t('telegramAuth.deviceOptimization.qrCodeHint')}</p>
        <div class="qr-link">
          <a href="${webUrl}" target="_blank" class="btn btn-primary">
            ${t('telegramAuth.actions.openTelegram')}
          </a>
        </div>
        <button class="btn btn-secondary qr-close">${t('common.close')}</button>
      </div>
    `;
    
    document.body.appendChild(qrModal);
    
    // 绑定关闭事件
    const closeBtn = qrModal.querySelector('.qr-close');
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(qrModal);
    });
  }

  // 刷新状态
  refreshStatus() {
    this.checkAuthStatus();
  }

  // 显示备选注册
  showAlternativeRegistration() {
    this.hide();
    // 触发事件，让父组件知道用户选择了备选注册
    this.app.emit('telegramAuthAlternative');
  }

  // 开始状态检查
  startStatusCheck() {
    this.checkInterval = setInterval(() => {
      this.checkAuthStatus();
    }, 3000); // 每3秒检查一次
  }

  // 停止状态检查
  stopStatusCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // 检查授权状态
  async checkAuthStatus() {
    try {
      // 检查Telegram Web App状态
      if (window.Telegram && window.Telegram.WebApp) {
        const webApp = window.Telegram.WebApp;
        
        if (webApp.initDataUnsafe && webApp.initDataUnsafe.user) {
          // 用户已授权
          this.setAuthStatus('authorized');
          this.completeRegistration(webApp.initDataUnsafe.user);
          return;
        }
      }
      
      // 检查本地存储中是否有授权信息
      const authData = localStorage.getItem('telegram_auth_data');
      if (authData) {
        try {
          const userData = JSON.parse(authData);
          this.setAuthStatus('authorized');
          this.completeRegistration(userData);
          return;
        } catch (error) {
          localStorage.removeItem('telegram_auth_data');
        }
      }
      
      // 仍然等待授权
      this.setAuthStatus('waiting');
      
    } catch (error) {
      console.error('Auth status check failed:', error);
      this.setAuthStatus('failed');
    }
  }

  // 设置授权状态
  setAuthStatus(status) {
    this.authStatus = status;
    this.updateStatusUI();
  }

  // 更新状态UI
  updateStatusUI() {
    const statusSection = this.modalElement.querySelector('#statusSection');
    const statusIcon = this.modalElement.querySelector('#statusIcon');
    const statusText = this.modalElement.querySelector('#statusText');
    const errorSection = this.modalElement.querySelector('#errorSection');
    
    const translations = i18n.getTranslations();
    
    switch (this.authStatus) {
      case 'waiting':
        statusSection.style.display = 'block';
        errorSection.style.display = 'none';
        statusIcon.textContent = '⏳';
        statusIcon.className = 'status-icon waiting';
        statusText.textContent = translations.telegramAuth.status.waiting;
        break;
        
      case 'authorized':
        statusSection.style.display = 'block';
        errorSection.style.display = 'none';
        statusIcon.textContent = '✅';
        statusIcon.className = 'status-icon success';
        statusText.textContent = translations.telegramAuth.status.authorized;
        break;
        
      case 'failed':
        statusSection.style.display = 'block';
        errorSection.style.display = 'none';
        statusIcon.textContent = '❌';
        statusIcon.className = 'status-icon error';
        statusText.textContent = translations.telegramAuth.status.failed;
        break;
        
      case 'expired':
        statusSection.style.display = 'block';
        errorSection.style.display = 'none';
        statusIcon.textContent = '⏰';
        statusIcon.className = 'status-icon expired';
        statusText.textContent = translations.telegramAuth.status.expired;
        break;
    }
  }

  // 显示错误
  showError(message) {
    const errorSection = this.modalElement.querySelector('#errorSection');
    const errorMessage = this.modalElement.querySelector('#errorMessage');
    
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
    
    // 3秒后自动隐藏错误
    setTimeout(() => {
      errorSection.style.display = 'none';
    }, 3000);
  }

  // 完成注册
  async completeRegistration(telegramUser) {
    try {
      this.app.showLoading(t('common.loading'));
      
      // 调用API完成注册
      const result = await this.app.api.telegramLogin(telegramUser);
      
      if (result.success && result.token && result.user) {
        // 保存用户信息
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // 更新应用状态
        this.app.setToken(result.token);
        this.app.setUser(result.user);
        
        // 显示成功消息
        this.app.showToast(t('success.telegramAuthSuccess'), 'success');
        
        // 延迟跳转
        setTimeout(() => {
          this.hide();
          this.app.navigate('home');
        }, 1500);
        
      } else {
        throw new Error(result.error || 'Registration failed');
      }
      
    } catch (error) {
      console.error('Registration failed:', error);
      this.showError(error.message || t('errors.telegramAuthError'));
      this.setAuthStatus('failed');
    } finally {
      this.app.hideLoading();
    }
  }

  // 重置状态
  resetStatus() {
    this.authStatus = 'waiting';
    this.updateStatusUI();
  }

  // 更新UI
  updateUI() {
    // 根据当前语言更新文本
    this.updateTexts();
    
    // 根据设备类型优化显示
    this.optimizeForDevice();
  }

  // 更新文本
  updateTexts() {
    // 这里可以添加动态文本更新逻辑
    // 由于我们使用了t()函数，大部分文本会自动更新
  }

  // 根据设备类型优化显示
  optimizeForDevice() {
    const deviceType = getDeviceType();
    const modalContent = this.modalElement.querySelector('.modal-content');
    
    if (deviceType === 'mobile') {
      modalContent.classList.add('mobile-optimized');
    } else {
      modalContent.classList.remove('mobile-optimized');
    }
  }

  // 销毁组件
  destroy() {
    this.stopStatusCheck();
    if (this.modalElement && this.modalElement.parentNode) {
      this.modalElement.parentNode.removeChild(this.modalElement);
    }
  }
}

export default TelegramAuthModal;
