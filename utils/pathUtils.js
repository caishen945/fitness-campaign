const path = require('path');
const fs = require('fs');
const { PATHS, resolvePath, joinPaths } = require('../config/paths');

/**
 * 路径工具类
 */
class PathUtils {
    /**
     * 确保目录存在
     */
    static ensureDir(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    /**
     * 获取相对路径
     */
    static getRelativePath(fromPath, toPath) {
        return path.relative(fromPath, toPath);
    }

    /**
     * 获取绝对路径
     */
    static getAbsolutePath(relativePath) {
        return resolvePath(relativePath);
    }

    /**
     * 检查文件是否存在
     */
    static fileExists(filePath) {
        return fs.existsSync(filePath);
    }

    /**
     * 检查目录是否存在
     */
    static dirExists(dirPath) {
        return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
    }

    /**
     * 获取文件扩展名
     */
    static getFileExtension(filePath) {
        return path.extname(filePath);
    }

    /**
     * 获取文件名（不含扩展名）
     */
    static getFileName(filePath) {
        return path.basename(filePath, path.extname(filePath));
    }

    /**
     * 标准化路径
     */
    static normalizePath(filePath) {
        return path.normalize(filePath);
    }

    /**
     * 获取项目中的文件路径
     */
    static getProjectPath(relativePath) {
        return joinPaths(PATHS.ROOT, relativePath);
    }

    /**
     * 获取后端文件路径
     */
    static getBackendPath(relativePath) {
        return joinPaths(PATHS.BACKEND, relativePath);
    }

    /**
     * 获取前端文件路径
     */
    static getFrontendPath(relativePath) {
        return joinPaths(PATHS.FRONTEND, relativePath);
    }

    /**
     * 获取管理后台文件路径
     */
    static getAdminPath(relativePath) {
        return joinPaths(PATHS.ADMIN, relativePath);
    }
}

module.exports = PathUtils;
