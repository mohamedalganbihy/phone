// مصفوفة لتخزين الأجهزة
let devices = JSON.parse(localStorage.getItem('devices')) || [];

// عناصر DOM
const deviceForm = document.getElementById('deviceForm');
const devicesTableBody = document.getElementById('devicesTableBody');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const editModal = document.getElementById('editModal');
const editDeviceForm = document.getElementById('editDeviceForm');
const closeModal = document.querySelector('.close');

// عرض الأجهزة في الجدول
function displayDevices(devicesToDisplay = devices) {
    devicesTableBody.innerHTML = '';
    
    devicesToDisplay.forEach((device, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${device.customerName}</td>
            <td>${device.customerPhone}</td>
            <td>${device.deviceType}</td>
            <td>${device.deviceBrand}</td>
            <td>${device.deviceProblem}</td>
            <td>${device.receiptDate}</td>
            <td>${device.expectedDelivery}</td>
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
    
    // إضافة معالجات الأحداث للأزرار
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteDevice(btn.dataset.id));
    });
    
    document.querySelectorAll('.complete-btn').forEach(btn => {
        btn.addEventListener('click', () => completeDevice(btn.dataset.id));
    });
}

// الحصول على نص الحالة
function getStatusText(status) {
    switch(status) {
        case 'pending': return 'قيد الإصلاح';
        case 'completed': return 'تم الإصلاح';
        case 'delivered': return 'تم التسليم';
        default: return status;
    }
}

// إضافة جهاز جديد
deviceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newDevice = {
        id: Date.now().toString(),
        customerName: document.getElementById('customerName').value,
        customerPhone: document.getElementById('customerPhone').value,
        devicetype: document.getElementById('deviceType').value,
        deviceBrand: document.getElementById('deviceBrand').value,
        deviceProblem: document.getElementById('deviceProblem').value,
        receiptDate: document.getElementById('receiptDate').value,
        expectedDelivery: document.getElementById('expectedDelivery').value,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    devices.push(newDevice);
    saveDevices();
    deviceForm.reset();
    displayDevices();
});

// حفظ الأجهزة في localStorage
function saveDevices() {
    localStorage.setItem('devices', JSON.stringify(devices));
}

// حذف جهاز
function deleteDevice(id) {
    if (confirm('هل أنت متأكد من حذف هذا الجهاز؟')) {
        devices = devices.filter(device => device.id !== id);
        saveDevices();
        displayDevices();
    }
}

// إكمال إصلاح الجهاز
function completeDevice(id) {
    const device = devices.find(device => device.id === id);
    if (device) {
        device.status = device.status === 'pending' ? 'completed' : 'delivered';
        saveDevices();
        displayDevices();
    }
}

// فتح نموذج التعديل
function openEditModal(id) {
    const device = devices.find(device => device.id === id);
    if (device) {
        document.getElementById('editDeviceId').value = device.id;
        document.getElementById('editCustomerName').value = device.customerName;
        document.getElementById('editCustomerPhone').value = device.customerPhone;
        document.getElementById('editDeviceType').value = device.deviceType;
        document.getElementById('editDeviceBrand').value = device.deviceBrand;
        document.getElementById('editDeviceProblem').value = device.deviceProblem;
        document.getElementById('editReceiptDate').value = device.receiptDate;
        document.getElementById('editExpectedDelivery').value = device.expectedDelivery;
        document.getElementById('editStatus').value = device.status;
        
        editModal.style.display = 'block';
    }
}

// تعديل جهاز
editDeviceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = document.getElementById('editDeviceId').value;
    const device = devices.find(device => device.id === id);
    
    if (device) {
        device.customerName = document.getElementById('editCustomerName').value;
        device.customerPhone = document.getElementById('editCustomerPhone').value;
        device.deviceType = document.getElementById('editDeviceType').value;
        device.deviceBrand = document.getElementById('editDeviceBrand').value;
        device.deviceProblem = document.getElementById('editDeviceProblem').value;
        device.receiptDate = document.getElementById('editReceiptDate').value;
        device.expectedDelivery = document.getElementById('editExpectedDelivery').value;
        device.status = document.getElementById('editStatus').value;
        
        saveDevices();
        displayDevices();
        editModal.style.display = 'none';
    }
});

// تصفية البحث
searchInput.addEventListener('input', filterDevices);
statusFilter.addEventListener('change', filterDevices);

function filterDevices() {
    const searchTerm = searchInput.value.toLowerCase();
    const status = statusFilter.value;
    
    let filteredDevices = devices;
    
    if (searchTerm) {
        filteredDevices = filteredDevices.filter(device => 
            device.customerName.toLowerCase().includes(searchTerm) || 
            device.deviceType.toLowerCase().includes(searchTerm)
        );
    }
    
    if (status !== 'all') {
        filteredDevices = filteredDevices.filter(device => device.status === status);
    }
    
    displayDevices(filteredDevices);
}

// إغلاق المودال
closeModal.addEventListener('click', () => {
    editModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === editModal) {
        editModal.style.display = 'none';
    }
});

// تهيئة الصفحة
displayDevices();