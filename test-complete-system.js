#!/usr/bin/env node
// 过渡入口：调用新的 complete-system-test.js，并输出迁移提示
import { runSystemTest } from './complete-system-test.js';

const strict = process.argv.includes('--strict') || String(process.env.TEST_STRICT_REDIS || '').toLowerCase() === 'true';

console.log('ℹ️  提示: 本入口将被废弃，请改用 `node ./complete-system-test.js`');
// eslint-disable-next-line no-void
void runSystemTest({ strictRedisCheck: strict });


