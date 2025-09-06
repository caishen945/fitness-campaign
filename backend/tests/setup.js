/**
 * Jest测试全局设置文件
 */

// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.PORT = '3003'; // 使用不同的端口进行测试
process.env.JWT_SECRET = 'test_secret_key';

// 数据库测试配置
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'fitchallenge123';
process.env.DB_NAME = 'fitchallenge_test';

// 禁用控制台输出（可选，取消注释以禁用）
// console.log = jest.fn();
// console.info = jest.fn();
// console.warn = jest.fn();
// console.error = jest.fn();

// 全局测试超时设置
jest.setTimeout(10000);

// 全局测试钩子
beforeAll(async () => {
    // 在所有测试开始前执行的操作
    console.log('开始测试...');
});

afterAll(async () => {
    // 在所有测试完成后执行的操作
    console.log('测试完成');
});
