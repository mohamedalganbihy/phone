// استبدال هذا الجزء في script.js
const { pool, initDB } = require('./db');

// تهيئة قاعدة البيانات
initDB();

// دالة للحصول على جميع الأجهزة
async function getDevices() {
  const res = await pool.query('SELECT * FROM devices ORDER BY created_at DESC');
  return res.rows;
}

// دالة لإضافة جهاز جديد
async function addDevice(device) {
  const query = `
    INSERT INTO devices (
      customer_name, customer_phone, device_type, device_brand,
      device_problem, receipt_date, expected_delivery, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  const values = [
    device.customerName,
    device.customerPhone,
    device.deviceType,
    device.deviceBrand,
    device.deviceProblem,
    device.receiptDate,
    device.expectedDelivery,
    device.status || 'pending'
  ];
  const res = await pool.query(query, values);
  return res.rows[0];
}

// تعديل دالة displayDevices لتصبح async
async function displayDevices() {
  const devices = await getDevices();
  devicesTableBody.innerHTML = '';
  
  devices.forEach((device, index) => {
    // ... بقية الكود كما هو
  });
}

// تعديل event listener لإضافة جهاز
deviceForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const newDevice = {
    customerName: document.getElementById('customerName').value,
    customerPhone: document.getElementById('customerPhone').value,
    deviceType: document.getElementById('deviceType').value,
    deviceBrand: document.getElementById('deviceBrand').value,
    deviceProblem: document.getElementById('deviceProblem').value,
    receiptDate: document.getElementById('receiptDate').value,
    expectedDelivery: document.getElementById('expectedDelivery').value
  };
  
  await addDevice(newDevice);
  deviceForm.reset();
  await displayDevices();
});

// ... تعديل باقي الدوال بنفس الطريقة