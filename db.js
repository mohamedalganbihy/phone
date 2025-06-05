const { Pool } = require('pg');

// تأكد من أن Railway سيوفر لك متغير DATABASE_URL تلقائياً
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// إنشاء الجدول إذا لم يكن موجوداً
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS devices (
        id SERIAL PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        device_type TEXT NOT NULL,
        device_brand TEXT NOT NULL,
        device_problem TEXT NOT NULL,
        receipt_date DATE NOT NULL,
        expected_delivery DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

module.exports = { pool, initDB };