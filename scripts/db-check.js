const mysql = require('mysql2/promise');

async function main() {
  const config = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'fitchallenge123',
    database: 'fitchallenge',
  };
  try {
    const connection = await mysql.createConnection(config);
    const [rows] = await connection.execute("SHOW TABLES LIKE 'notification_templates'");
    if (rows.length > 0) {
      console.log('EXISTS');
    } else {
      console.log('MISSING');
    }
    await connection.end();
  } catch (error) {
    console.error('ERROR', error.code || '', error.message);
    process.exitCode = 1;
  }
}

main();


