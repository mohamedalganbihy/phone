// دوال للاتصال بالخادم
async function fetchDevices() {
  try {
    const response = await fetch('/api/devices');
    if (!response.ok) throw new Error('فشل جلب البيانات');
    return await response.json();
  } catch (err) {
    console.error('Error:', err);
    showError(err.message);
    return [];
  }
}

async function addNewDevice(deviceData) {
  try {
    const response = await fetch('/api/devices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deviceData),
    });
    
    if (!response.ok) throw new Error('فشل إضافة الجهاز');
    return await response.json();
  } catch (err) {
    console.error('Error:', err);
    showError(err.message);
    throw err;
  }
}

// استخدم هذه الدوال بدلاً من الاتصال المباشر بقاعدة البيانات
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
  
  try {
    await addNewDevice(newDevice);
    deviceForm.reset();
    await refreshDeviceList();
    showSuccess('تم إضافة الجهاز بنجاح');
  } catch (err) {
    console.error('Error:', err);
  }
});

// دوال مساعدة
function showError(message) {
  alert(`خطأ: ${message}`);
}

function showSuccess(message) {
  alert(`نجاح: ${message}`);
}

async function refreshDeviceList() {
  const devices = await fetchDevices();
  renderDevices(devices);
}

function renderDevices(devices) {
  devicesTableBody.innerHTML = '';
  
  devices.forEach((device, index) => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${device.customer_name}</td>
      <td>${device.customer_phone}</td>
      <td>${device.device_type}</td>
      <td>${device.device_brand}</td>
      <td>${device.device_problem}</td>
      <td>${new Date(device.receipt_date).toLocaleDateString()}</td>
      <td>${new Date(device.expected_delivery).toLocaleDateString()}</td>
      <td><span class="status status-${device.status}">${getStatusText(device.status)}</span></td>
      <td>
        <button class="action-btn edit-btn" data-id="${device.id}"><i class="fas fa-edit"></i></button>
        <button class="action-btn delete-btn" data-id="${device.id}"><i class="fas fa-trash"></i></button>
        ${device.status !== 'completed' && device.status !== 'delivered' ? 
          `<button class="action-btn complete-btn" data-id="${device.id}"><i class="fas fa-check"></i></button>` : ''}
      </td>
    `;
    
    devicesTableBody.appendChild(row);
  });
}

// التهيئة الأولية
document.addEventListener('DOMContentLoaded', async () => {
  await refreshDeviceList();
});