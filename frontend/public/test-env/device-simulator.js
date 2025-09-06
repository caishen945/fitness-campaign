/**
 * 设备模拟器
 * 用于模拟不同设备类型、屏幕尺寸和用户代理
 */

class DeviceSimulator {
    constructor() {
        this.currentDevice = 'desktop';
        this.currentOrientation = 'portrait';
        this.customDimensions = null;
        this.devicePresets = this.getDevicePresets();
        
        this.init();
    }
    
    /**
     * 初始化设备模拟器
     */
    init() {
        console.log('📱 初始化设备模拟器...');
        
        // 设置默认设备
        this.switchDevice('desktop');
        
        // 监听方向变化
        this.setupOrientationListener();
        
        console.log('✅ 设备模拟器初始化完成');
    }
    
    /**
     * 获取设备预设
     */
    getDevicePresets() {
        return {
            desktop: {
                name: '桌面端',
                width: 1920,
                height: 1080,
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                platform: 'desktop',
                isMobile: false,
                isIOS: false,
                isAndroid: false,
                isTablet: false
            },
            tablet: {
                name: '平板',
                width: 768,
                height: 1024,
                userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
                platform: 'tablet',
                isMobile: false,
                isIOS: true,
                isAndroid: false,
                isTablet: true
            },
            mobile: {
                name: '手机',
                width: 375,
                height: 667,
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
                platform: 'mobile',
                isMobile: true,
                isIOS: true,
                isAndroid: false,
                isTablet: false
            },
            android: {
                name: '安卓手机',
                width: 360,
                height: 640,
                userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
                platform: 'mobile',
                isMobile: true,
                isIOS: false,
                isAndroid: true,
                isTablet: false
            },
            smallMobile: {
                name: '小屏手机',
                width: 320,
                height: 568,
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
                platform: 'mobile',
                isMobile: true,
                isIOS: true,
                isAndroid: false,
                isTablet: false
            },
            largeMobile: {
                name: '大屏手机',
                width: 414,
                height: 896,
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
                platform: 'mobile',
                isMobile: true,
                isIOS: true,
                isAndroid: false,
                isTablet: false
            }
        };
    }
    
    /**
     * 切换设备类型
     */
    switchDevice(deviceType) {
        if (!this.devicePresets[deviceType]) {
            console.error('❌ 未知的设备类型:', deviceType);
            return;
        }
        
        this.currentDevice = deviceType;
        const preset = this.devicePresets[deviceType];
        
        console.log(`📱 切换到设备: ${preset.name}`);
        
        // 更新视口尺寸
        this.updateViewport(preset.width, preset.height);
        
        // 更新用户代理
        this.updateUserAgent(preset.userAgent);
        
        // 更新Telegram平台信息
        this.updateTelegramPlatform(preset);
        
        // 触发设备变化事件
        this.dispatchDeviceChangeEvent(preset);
        
        console.log('✅ 设备切换完成:', preset);
    }
    
    /**
     * 更新视口尺寸
     */
    updateViewport(width, height) {
        // 设置视口尺寸
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', `width=${width}, height=${height}, initial-scale=1.0, user-scalable=no`);
        }
        
        // 更新CSS变量
        document.documentElement.style.setProperty('--device-width', `${width}px`);
        document.documentElement.style.setProperty('--device-height', `${height}px`);
        
        // 更新Telegram WebApp视口信息
        if (window.telegramMock) {
            window.telegramMock.viewportHeight = height;
            window.telegramMock.viewportStableHeight = height;
            window.telegramMock.createGlobalObject();
        }
        
        console.log(`📐 视口尺寸已更新: ${width}x${height}`);
    }
    
    /**
     * 更新用户代理
     */
    updateUserAgent(userAgent) {
        // 注意：在真实环境中无法直接修改navigator.userAgent
        // 这里我们通过自定义属性来模拟
        Object.defineProperty(navigator, 'userAgent', {
            get: () => userAgent,
            configurable: true
        });
        
        // 更新其他navigator属性
        this.updateNavigatorProperties();
        
        console.log('🔧 用户代理已更新:', userAgent);
    }
    
    /**
     * 更新navigator属性
     */
    updateNavigatorProperties() {
        const preset = this.devicePresets[this.currentDevice];
        
        // 模拟移动设备属性
        if (preset.isMobile) {
            Object.defineProperty(navigator, 'maxTouchPoints', {
                get: () => 5,
                configurable: true
            });
            
            Object.defineProperty(navigator, 'platform', {
                get: () => preset.isIOS ? 'iPhone' : 'Android',
                configurable: true
            });
        } else {
            Object.defineProperty(navigator, 'maxTouchPoints', {
                get: () => 0,
                configurable: true
            });
            
            Object.defineProperty(navigator, 'platform', {
                get: () => 'Win32',
                configurable: true
            });
        }
    }
    
    /**
     * 更新Telegram平台信息
     */
    updateTelegramPlatform(preset) {
        if (window.telegramMock) {
            let platform = 'unknown';
            
            if (preset.isIOS) {
                platform = 'ios';
            } else if (preset.isAndroid) {
                platform = 'android';
            } else if (preset.isTablet) {
                platform = 'tablet';
            } else if (!preset.isMobile) {
                platform = 'desktop';
            }
            
            window.telegramMock.switchPlatform(platform);
        }
    }
    
    /**
     * 设置自定义尺寸
     */
    setCustomDimensions(width, height) {
        this.customDimensions = { width, height };
        this.updateViewport(width, height);
        console.log(`📐 自定义尺寸已设置: ${width}x${height}`);
    }
    
    /**
     * 清除自定义尺寸
     */
    clearCustomDimensions() {
        this.customDimensions = null;
        const preset = this.devicePresets[this.currentDevice];
        this.updateViewport(preset.width, preset.height);
        console.log('📐 自定义尺寸已清除');
    }
    
    /**
     * 切换方向
     */
    switchOrientation(orientation) {
        if (!['portrait', 'landscape'].includes(orientation)) {
            console.error('❌ 无效的方向:', orientation);
            return;
        }
        
        this.currentOrientation = orientation;
        const preset = this.devicePresets[this.currentDevice];
        
        let width, height;
        if (orientation === 'landscape') {
            width = Math.max(preset.width, preset.height);
            height = Math.min(preset.width, preset.height);
        } else {
            width = Math.min(preset.width, preset.height);
            height = Math.max(preset.width, preset.height);
        }
        
        this.updateViewport(width, height);
        
        // 触发方向变化事件
        this.dispatchOrientationChangeEvent(orientation);
        
        console.log(`🔄 方向已切换到: ${orientation}`);
    }
    
    /**
     * 设置方向变化监听器
     */
    setupOrientationListener() {
        // 监听屏幕方向变化
        if (screen.orientation) {
            screen.orientation.addEventListener('change', () => {
                const orientation = screen.orientation.type.includes('landscape') ? 'landscape' : 'portrait';
                this.currentOrientation = orientation;
                console.log('🔄 检测到屏幕方向变化:', orientation);
            });
        }
    }
    
    /**
     * 触发设备变化事件
     */
    dispatchDeviceChangeEvent(deviceInfo) {
        const event = new CustomEvent('device-changed', {
            detail: {
                device: this.currentDevice,
                deviceInfo,
                orientation: this.currentOrientation,
                customDimensions: this.customDimensions
            }
        });
        
        window.dispatchEvent(event);
    }
    
    /**
     * 触发方向变化事件
     */
    dispatchOrientationChangeEvent(orientation) {
        const event = new CustomEvent('orientation-changed', {
            detail: {
                orientation,
                device: this.currentDevice,
                deviceInfo: this.devicePresets[this.currentDevice]
            }
        });
        
        window.dispatchEvent(event);
    }
    
    /**
     * 获取当前设备信息
     */
    getCurrentDeviceInfo() {
        const preset = this.devicePresets[this.currentDevice];
        return {
            ...preset,
            orientation: this.currentOrientation,
            customDimensions: this.customDimensions,
            actualWidth: this.customDimensions ? this.customDimensions.width : preset.width,
            actualHeight: this.customDimensions ? this.customDimensions.height : preset.height
        };
    }
    
    /**
     * 获取所有可用设备
     */
    getAvailableDevices() {
        return Object.keys(this.devicePresets).map(key => ({
            key,
            ...this.devicePresets[key]
        }));
    }
    
    /**
     * 检测当前环境
     */
    detectEnvironment() {
        const userAgent = navigator.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isIOS = /iPad|iPhone|iPod/.test(userAgent);
        const isAndroid = /Android/.test(userAgent);
        const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/.test(userAgent);
        
        return {
            isMobile,
            isIOS,
            isAndroid,
            isTablet,
            userAgent
        };
    }
    
    /**
     * 应用响应式样式
     */
    applyResponsiveStyles() {
        const deviceInfo = this.getCurrentDeviceInfo();
        const style = document.createElement('style');
        
        style.textContent = `
            :root {
                --device-width: ${deviceInfo.actualWidth}px;
                --device-height: ${deviceInfo.actualHeight}px;
                --is-mobile: ${deviceInfo.isMobile ? 1 : 0};
                --is-tablet: ${deviceInfo.isTablet ? 1 : 0};
                --is-desktop: ${!deviceInfo.isMobile && !deviceInfo.isTablet ? 1 : 0};
            }
            
            .device-simulator {
                max-width: var(--device-width);
                max-height: var(--device-height);
                margin: 0 auto;
                border: 2px solid #ddd;
                border-radius: 8px;
                overflow: hidden;
                background: white;
            }
            
            .device-simulator.mobile {
                border-radius: 20px;
            }
            
            .device-simulator.tablet {
                border-radius: 12px;
            }
            
            .device-frame {
                position: relative;
                width: 100%;
                height: 100%;
            }
            
            .device-notch {
                position: absolute;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 60px;
                height: 20px;
                background: #000;
                border-radius: 0 0 10px 10px;
                z-index: 1000;
            }
            
            .device-home-indicator {
                position: absolute;
                bottom: 8px;
                left: 50%;
                transform: translateX(-50%);
                width: 120px;
                height: 4px;
                background: #000;
                border-radius: 2px;
                z-index: 1000;
            }
        `;
        
        document.head.appendChild(style);
        console.log('🎨 响应式样式已应用');
    }
    
    /**
     * 创建设备框架
     */
    createDeviceFrame() {
        const deviceInfo = this.getCurrentDeviceInfo();
        const frame = document.createElement('div');
        
        frame.className = `device-simulator ${deviceInfo.platform}`;
        frame.style.width = `${deviceInfo.actualWidth}px`;
        frame.style.height = `${deviceInfo.actualHeight}px`;
        
        // 添加设备特征
        if (deviceInfo.isMobile || deviceInfo.isTablet) {
            const notch = document.createElement('div');
            notch.className = 'device-notch';
            frame.appendChild(notch);
            
            const homeIndicator = document.createElement('div');
            homeIndicator.className = 'device-home-indicator';
            frame.appendChild(homeIndicator);
        }
        
        return frame;
    }
    
    /**
     * 重置到默认状态
     */
    reset() {
        console.log('🔄 重置设备模拟器...');
        this.currentDevice = 'desktop';
        this.currentOrientation = 'portrait';
        this.customDimensions = null;
        this.switchDevice('desktop');
        console.log('✅ 设备模拟器已重置');
    }
    
    /**
     * 获取状态信息
     */
    getStatus() {
        return {
            currentDevice: this.currentDevice,
            currentOrientation: this.currentOrientation,
            customDimensions: this.customDimensions,
            deviceInfo: this.getCurrentDeviceInfo(),
            availableDevices: this.getAvailableDevices(),
            environment: this.detectEnvironment()
        };
    }
}

// 导出设备模拟器类
window.DeviceSimulator = DeviceSimulator;

// 自动创建默认实例
window.deviceSimulator = new DeviceSimulator();

console.log('📱 设备模拟器已加载，全局对象: window.deviceSimulator');
