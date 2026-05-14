const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.connect()
  .then(() => console.log('✅ Kết nối Neon database thành công!'))
  .catch(err => console.error('❌ Lỗi kết nối:', err.message));

module.exports = pool;