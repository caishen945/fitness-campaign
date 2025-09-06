const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/example:
 *   get:
 *     summary: 获取示例数据
 *     description: 返回示例数据的API端点
 *     tags: [示例]
 *     responses:
 *       200:
 *         description: 成功获取示例数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "这是一个示例API"
 *                     timestamp:
 *                       type: string
 *                       example: "2025-08-25T12:00:00Z"
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      message: '这是一个示例API',
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * @swagger
 * /api/example/{id}:
 *   get:
 *     summary: 获取指定ID的示例数据
 *     description: 根据ID返回特定示例数据的API端点
 *     tags: [示例]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 示例数据ID
 *     responses:
 *       200:
 *         description: 成功获取示例数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     message:
 *                       type: string
 *                       example: "这是ID为1的示例数据"
 *       404:
 *         description: 未找到指定ID的数据
 */
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  res.json({
    success: true,
    data: {
      id,
      message: `这是ID为${id}的示例数据`
    }
  });
});

module.exports = router;
