import versionUpdater from './utils/versionUpdater.js';
import AdminApp from './App-fixed.js';
import '../config/api-config.js';
import './bootstrap/force-fix-settings.js';
import './bootstrap/emergency-fix-settings.js';

// 显示版本信息
versionUpdater.displayVersionInfo();

const app = new AdminApp();
window.adminApp = app;
app.init();