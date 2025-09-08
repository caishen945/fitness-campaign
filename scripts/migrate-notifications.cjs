const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

function readSqlFile(relativePath) {
  const fullPath = path.join(process.cwd(), relativePath);
  return fs.readFileSync(fullPath, 'utf8');
}

function isIgnorableError(err) {
  // Common idempotent errors: duplicate key/field/index/table exists
  const ignorableCodes = new Set([
    'ER_DUP_KEYNAME', // 1061: Duplicate key name
    'ER_DUP_FIELDNAME', // 1060: Duplicate column
    'ER_TABLE_EXISTS_ERROR', // 1050: Table exists
    'ER_CANT_CREATE_TABLE', // 1005: Often due to exists with IF NOT EXISTS; ignore if message indicates exists
    'ER_DUP_ENTRY', // 1062: Duplicate entry (unique/PK insertion)
  ]);
  if (ignorableCodes.has(err.code)) return true;
  // Fallback: if message clearly indicates already exists
  const msg = (err.message || '').toLowerCase();
  if (msg.includes('already exists') || msg.includes('duplicate')) return true;
  return false;
}

async function run() {
  const config = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'fitchallenge123',
    database: 'fitchallenge',
    multipleStatements: true,
  };

  const scripts = [
    'backend/database/migrations/20250907_add_notifications_domain.sql',
    'database/migrations/2025_09_07_add_template_indexes.sql',
  ];

  const connection = await mysql.createConnection(config);
  try {
    for (const scriptPath of scripts) {
      const sql = readSqlFile(scriptPath);
      try {
        await connection.query(sql);
        console.log(`[OK] Executed: ${scriptPath}`);
      } catch (err) {
        if (isIgnorableError(err)) {
          console.log(`[SKIP] Ignored error for ${scriptPath}: ${err.code} ${err.message}`);
        } else {
          console.error(`[FAIL] ${scriptPath}: ${err.code} ${err.message}`);
          throw err;
        }
      }
    }
    console.log('MIGRATION_DONE');
  } finally {
    await connection.end();
  }
}

run().catch((e) => {
  process.exitCode = 1;
});


