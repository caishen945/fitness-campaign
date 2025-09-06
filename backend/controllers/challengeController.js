const { pool } = require('../config/database');

class ChallengeController {
    // 获取挑战列表
    async getChallenges(req, res) {
        try {
            const connection = await pool.getConnection();
            
            try {
                const [rows] = await connection.execute('SELECT * FROM challenges WHERE is_active = TRUE');
                
                res.json({
                    success: true,
                    data: rows
                });
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('获取挑战列表失败:', error);
            res.status(500).json({ success: false, error: '获取挑战列表失败' });
        }
    }
}

module.exports = ChallengeController;
