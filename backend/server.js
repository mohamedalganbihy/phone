const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// الحصول على كل الأجهزة
app.get('/devices', async (req, res) => {
  const result = await pool.query('SELECT * FROM devices ORDER BY created_at DESC');
  res.json(result.rows);
});

// إضافة جهاز جديد
app.post('/devices', async (req, res) => {
  const d = req.body;
  const result = await pool.query(
    'INSERT INTO devices (id, customer_name, customer_phone, device_type, device_brand, device_problem, receipt_date, expected_delivery, status, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
    [d.id, d.customerName, d.customerPhone, d.deviceType, d.deviceBrand, d.deviceProblem, d.receiptDate, d.expectedDelivery, d.status, new Date()]
  );
  res.json(result.rows[0]);
});

// تعديل جهاز
app.put('/devices/:id', async (req, res) => {
  const d = req.body;
  const result = await pool.query(
    'UPDATE devices SET customer_name=$1, customer_phone=$2, device_type=$3, device_brand=$4, device_problem=$5, receipt_date=$6, expected_delivery=$7, status=$8 WHERE id=$9 RETURNING *',
    [d.customerName, d.customerPhone, d.deviceType, d.deviceBrand, d.deviceProblem, d.receiptDate, d.expectedDelivery, d.status, req.params.id]
  );
  res.json(result.rows[0]);
});

// حذف جهاز
app.delete('/devices/:id', async (req, res) => {
  await pool.query('DELETE FROM devices WHERE id=$1', [req.params.id]);
  res.sendStatus(204);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
