(async () => {
  const db = require('./db');
  try {
    const [rows] = await db.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'produtos'", [process.env.DB_NAME]);
    console.log('Columns in produtos:');
    rows.forEach(r => console.log('-', r.COLUMN_NAME));
  } catch (err) {
    console.error('Erro ao checar colunas:', err.message || err);
  } finally {
    process.exit(0);
  }
})();
