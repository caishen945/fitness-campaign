import enUS from './en-US.js';
import zhCN from './zh-CN.js';

// 支持的语言列表
export const SUPPORTED_LANGUAGES = {
  'en-US': {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    locale: enUS
  },
  'zh-CN': {
    name: 'Chinese (Simplified)',
    nativeName: '中文简体',
    flag: '🇨🇳',
    locale: zhCN
  }
};

// 默认语言（英文）
export const DEFAULT_LANGUAGE = 'en-US';

class I18nManager {
  constructor() {
    this.currentLanguage = this.detectLanguage();
    this.translations = SUPPORTED_LANGUAGES[this.currentLanguage].locale;
    this.init();
  }

  // 检测用户语言
  detectLanguage() {
    // 1. 检查本地存储的语言设置
    const savedLanguage = localStorage.getItem('preferred_language');
    if (savedLanguage && SUPPORTED_LANGUAGES[savedLanguage]) {
      return savedLanguage;
    }

    // 2. 检查浏览器语言
    const browserLanguage = navigator.language || navigator.userLanguage;
    if (browserLanguage) {
      // 尝试匹配完整语言代码
      if (SUPPORTED_LANGUAGES[browserLanguage]) {
        return browserLanguage;
      }
      
      // 尝试匹配语言前缀
      const languagePrefix = browserLanguage.split('-')[0];
      for (const [code, lang] of Object.entries(SUPPORTED_LANGUAGES)) {
        if (code.startsWith(languagePrefix)) {
          return code;
        }
      }
    }

    // 3. 返回默认语言
    return DEFAULT_LANGUAGE;
  }

  // 初始化
  init() {
    // 设置HTML lang属性
    document.documentElement.lang = this.currentLanguage;
    
    // 保存语言设置到本地存储
    localStorage.setItem('preferred_language', this.currentLanguage);
    
    // 触发语言变化事件
    this.dispatchLanguageChangeEvent();
  }

  // 切换语言
  setLanguage(languageCode) {
    if (!SUPPORTED_LANGUAGES[languageCode]) {
      console.warn(`Unsupported language: ${languageCode}`);
      return false;
    }

    this.currentLanguage = languageCode;
    this.translations = SUPPORTED_LANGUAGES[languageCode].locale;
    
    // 更新HTML lang属性
    document.documentElement.lang = languageCode;
    
    // 保存到本地存储
    localStorage.setItem('preferred_language', languageCode);
    
    // 触发语言变化事件
    this.dispatchLanguageChangeEvent();
    
    return true;
  }

  // 获取当前语言
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  // 获取支持的语言列表
  getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  }

  // 翻译文本
  t(key, params = {}) {
    const keys = key.split('.');
    let value = this.translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; // 返回键名作为后备
      }
    }
    
    if (typeof value === 'string') {
      // 替换参数
      return value.replace(/\{(\w+)\}/g, (match, paramName) => {
        return params[paramName] !== undefined ? params[paramName] : match;
      });
    }
    
    return value;
  }

  // 获取翻译对象
  getTranslations() {
    return this.translations;
  }

  // 检查是否为移动设备
  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
  }

  // 检查是否为iOS设备
  isIOSDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  // 检查是否为Android设备
  isAndroidDevice() {
    return /Android/.test(navigator.userAgent);
  }

  // 获取设备类型
  getDeviceType() {
    if (this.isMobileDevice()) {
      if (this.isIOSDevice()) return 'ios';
      if (this.isAndroidDevice()) return 'android';
      return 'mobile';
    }
    return 'desktop';
  }

  // 触发语言变化事件
  dispatchLanguageChangeEvent() {
    const event = new CustomEvent('languageChanged', {
      detail: {
        language: this.currentLanguage,
        translations: this.translations
      }
    });
    document.dispatchEvent(event);
  }

  // 监听语言变化
  onLanguageChange(callback) {
    document.addEventListener('languageChanged', callback);
  }

  // 移除语言变化监听
  offLanguageChange(callback) {
    document.removeEventListener('languageChanged', callback);
  }
}

// 创建全局实例
const i18n = new I18nManager();

// 导出实例和类
export default i18n;
export { I18nManager };

// 便捷方法
export const t = (key, params) => i18n.t(key, params);
export const setLanguage = (lang) => i18n.setLanguage(lang);
export const getCurrentLanguage = () => i18n.getCurrentLanguage();
export const isMobileDevice = () => i18n.isMobileDevice();
export const getDeviceType = () => i18n.getDeviceType();
