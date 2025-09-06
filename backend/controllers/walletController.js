const { pool } = require('../config/database');

class WalletController {
    // 获取用户钱包信息
    async getUserWallet(req, res) {
        try {
            const userId = req.user.id;
            const connection = await pool.getConnection();
            
            try {
                const [rows] = await connection.execute(
                    'SELECT * FROM user_wallets WHERE user_id = ?',
                    [userId]
                );
                
                if (rows.length > 0) {
                    res.json({
                        success: true,
                        data: rows[0]
                    });
                } else {
                    // 创建新钱包
                    await connection.execute(
                        'INSERT INTO user_wallets (user_id, balance, points) VALUES (?, 0.00, 0)',
                        [userId]
                    );
                    
                    res.json({
                        success: true,
                        data: { user_id: userId, balance: 0.00, points: 0 }
                    });
                }
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('获取钱包信息失败:', error);
            res.status(500).json({ success: false, error: '获取钱包信息失败' });
        }
    }
}

module.exports = WalletController;
