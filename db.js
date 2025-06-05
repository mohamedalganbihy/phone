require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false 
  } : false
});

// دالة للتحقق من الاتصال
async function checkConnection() {
  try {
    await pool.query('SELECT 1');
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
    return true;
  } catch (err) {
    console.error('❌ فشل الاتصال بقاعدة البيانات:', err.message);
    return false;
  }
}

// إنشاء الجدول إذا لم يكن موجوداً
async function initDB() {
  if (!(await checkConnection())) return false;

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
    console.log('✔ تم تهيئة الجدول بنجاح');
    return true;
  } catch (err) {
    console.error('❌ خطأ في تهيئة الجدول:', err.message);
    return false;
  }
}

module.exports = {
  pool,
  initDB,
  checkConnection,
  
  // دوال CRUD
  async addDevice(device) {
    const query = `
      INSERT INTO devices (
        customer_name, customer_phone, device_type, device_brand,
        device_problem, receipt_date, expected_delivery
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      device.customerName,
      device.customerPhone,
      device.deviceType,
      device.deviceBrand,
      device.deviceProblem,
      device.receiptDate,
      device.expectedDelivery
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async getDevices() {
    const result = await pool.query('SELECT * FROM devices ORDER BY created_at DESC');
    return result.rows;
  },

  async updateDevice(id, updates) {
    const { columns, values } = prepareUpdateQuery(updates);
    const query = `
      UPDATE devices 
      SET ${columns} 
      WHERE id = $${values.length + 1}
      RETURNING *
    `;
    const result = await pool.query(query, [...values, id]);
    return result.rows[0];
  },

  async deleteDevice(id) {
    await pool.query('DELETE FROM devices WHERE id = $1', [id]);
    return true;
  }
};

// دالة مساعدة لإعداد استعلام التحديث
function prepareUpdateQuery(updates) {
  const columns = [];
  const values = [];
  let counter = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      columns.push(`${keyToColumn(key)} = $${counter++}`);
      values.push(value);
    }
  }

  return {
    columns: columns.join(', '),
    values
  };
}

function keyToColumn(key) {
  // تحويل camelCase إلى snake_case
  return key.replace(/([A-Z])/g, '_$1').toLowerCase();
}