// 前端服务器 - 集成统一版本控制系统
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 导入统一版本控制器
import versionController from '../shared/version-controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 8080;
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME类型映射
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(`📥 前端请求: ${req.url}`);
  console.log(`📋 请求方法: ${req.method}`);
  
  // 处理根路径请求
  let filePath = req.url === '/' 
    ? path.join(PUBLIC_DIR, 'index.html')
    : path.join(PUBLIC_DIR, req.url);
  
  console.log(`🔄 初始文件路径: ${filePath}`);
  
  // 处理查询参数，移除URL中的查询部分
  const urlParts = req.url.split('?');
  if (urlParts.length > 1) {
    filePath = path.join(PUBLIC_DIR, urlParts[0]);
    console.log(`🔧 处理查询参数: ${req.url} -> ${filePath}`);
  }

  // 获取文件扩展名
  const extname = path.extname(filePath);
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // 为JavaScript文件添加正确的MIME类型和CORS头
  if (extname === '.js') {
    contentType = 'text/javascript';
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    console.log(`📄 设置JS文件MIME类型: ${filePath} -> ${contentType}`);
  }
  
  // 读取文件
  console.log(`📂 尝试读取文件: ${filePath}`);
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // 文件不存在
        console.log(`❌ 文件不存在: ${filePath}`);
        
        // 尝试查找不带查询参数的文件
        const cleanFilePath = filePath.split('?')[0];
        console.log(`🔍 尝试查找不带查询参数的文件: ${cleanFilePath}`);
        
        fs.readFile(cleanFilePath, (cleanErr, cleanContent) => {
          if (cleanErr) {
            // 如果还是找不到，返回404
            console.log(`❌ 清理后的文件也不存在: ${cleanFilePath}`);
            fs.readFile(path.join(PUBLIC_DIR, '404.html'), (err, content) => {
              res.writeHead(404, { 'Content-Type': 'text/html' });
              res.end(content || '404 Not Found', 'utf-8');
            });
          } else {
            // 找到了不带查询参数的文件
            console.log(`✅ 找到不带查询参数的文件: ${cleanFilePath}`);
            const cleanExtname = path.extname(cleanFilePath);
            let cleanContentType = MIME_TYPES[cleanExtname] || 'application/octet-stream';
            
            // 设置响应头，包含缓存控制
            const cleanHeaders = { 'Content-Type': cleanContentType };
            
            // 为JS和CSS文件添加版本控制缓存头
            if (cleanExtname === '.js' || cleanExtname === '.css') {
              Object.assign(cleanHeaders, versionController.getCacheHeaders());
              console.log(`🔄 添加版本控制缓存头: ${versionController.getCurrentVersion()}`);
            }
            
            // 为JavaScript文件添加CORS头
            if (cleanExtname === '.js') {
              cleanHeaders['Access-Control-Allow-Origin'] = '*';
              cleanHeaders['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
              cleanHeaders['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
            }
            
            res.writeHead(200, cleanHeaders);
            res.end(cleanContent, 'utf-8');
          }
        });
      } else {
        // 服务器错误
        console.error(`⚠️ 服务器错误: ${err.code}`);
        res.writeHead(500);
        res.end(`服务器错误: ${err.code}`);
      }
    } else {
      // 成功响应
      console.log(`✅ 文件读取成功: ${filePath}`);
      console.log(`📄 内容类型: ${contentType}`);
      console.log(`📦 内容长度: ${content.length} 字节`);
      
      // 设置响应头，包含缓存控制
      const headers = { 'Content-Type': contentType };
      
      // 为JS和CSS文件添加版本控制缓存头
      if (extname === '.js' || extname === '.css') {
        Object.assign(headers, versionController.getCacheHeaders());
        console.log(`🔄 添加版本控制缓存头: ${versionController.getCurrentVersion()}`);
      }
      
      res.writeHead(200, headers);
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 前端服务器运行在 http://localhost:${PORT}`);
  console.log(`📂 提供目录: ${PUBLIC_DIR}`);
  console.log(`🔧 服务器配置:`);
  console.log(`   - MIME类型: ${Object.keys(MIME_TYPES).join(', ')}`);
  console.log(`   - JavaScript MIME类型: ${MIME_TYPES['.js']}`);
  console.log(`   - 支持CORS: 是`);
  console.log(`   - 支持查询参数: 是`);
  console.log(`   - 版本控制: ${versionController.getCurrentVersion()}`);
  console.log(`🌐 测试页面:`);
  console.log(`   - 主页: http://localhost:${PORT}/`);
  console.log(`   - 用户界面: http://localhost:${PORT}/index.html`);
});