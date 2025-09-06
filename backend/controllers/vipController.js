const { pool } = require('../config/database');

class VIPController {
    // 获取VIP等级列表
    async getVIPLevels(req, res) {
        try {
            const connection = await pool.getConnection();
            
            try {
                const [rows] = await connection.execute('SELECT * FROM vip_levels ORDER BY min_points ASC');
                
                res.json({
                    success: true,
                    data: rows
                });
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('获取VIP等级失败:', error);
            res.status(500).json({ success: false, error: '获取VIP等级失败' });
        }
    }
}

module.exports = VIPController;
