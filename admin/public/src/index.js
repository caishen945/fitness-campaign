import versionUpdater from './utils/versionUpdater.js';
import AdminApp from './App-fixed.js';

// 显示版本信息
versionUpdater.displayVersionInfo();

const app = new AdminApp();
window.adminApp = app;
app.init();