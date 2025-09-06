const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'FitChallenge API',
      version: '1.0.0',
      description: 'FitChallenge 健身挑战平台 API 文档',
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: '开发服务器',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;

// 添加专门的JSON路由
const swaggerJsonRoute = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(specs);
};

module.exports = { specs, swaggerJsonRoute };
