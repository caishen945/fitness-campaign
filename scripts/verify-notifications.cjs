const mysql = require('mysql2/promise');

async function main() {
  const config = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'fitchallenge123',
    database: 'fitchallenge',
  };
  const connection = await mysql.createConnection(config);
  try {
    const checks = {};
    // 1) Table exists
    const [t1] = await connection.execute("SHOW TABLES LIKE 'notification_templates'");
    checks.table_notification_templates = t1.length > 0;

    // 2) Key/indices existence
    const [idx] = await connection.execute("SHOW INDEX FROM notification_templates");
    const indexNames = new Set(idx.map(r => r.Key_name));
    checks.idx_uk_template_version = indexNames.has('uk_template_version') || indexNames.has('uq_tpl_key_locale_channel_version');
    checks.idx_tpl_active = indexNames.has('idx_tpl_active');
    checks.idx_tpl_lookup = indexNames.has('idx_tpl_lookup');

    console.log(JSON.stringify(checks, null, 2));
  } finally {
    await connection.end();
  }
}

main().catch((e)=>{
  console.error('ERROR', e.code || '', e.message);
  process.exitCode = 1;
});


