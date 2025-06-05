const express = require('express');
const path = require('path');
const { initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware لتحليل JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// خدمة الملفات الثابتة
app.use(express.static(path.join(__dirname, 'public')));

// تهيئة قاعدة البيانات
initDB();

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// يمكنك إضافة المزيد من API routes هنا

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});