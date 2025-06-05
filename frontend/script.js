const API_URL = "http://localhost:3000/devices"; // غيّره لو رفعت السيرفر

// DOM elements
const deviceForm = document.getElementById("deviceForm");
const devicesTableBody = document.getElementById("devicesTableBody");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const editModal = document.getElementById("editModal");
const editDeviceForm = document.getElementById("editDeviceForm");
const closeModal = document.querySelector(".close");

let allDevices = [];

async function fetchDevices() {
    const res = await fetch(API_URL);
    allDevices = await res.json();
    displayDevices(allDevices);
}

function displayDevices(devices) {
    devicesTableBody.innerHTML = "";

    devices.forEach((device, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${device.customer_name}</td>
            <td>${device.customer_phone}</td>
            <td>${device.device_type}</td>
            <td>${device.device_brand}</td>
            <td>${device.device_problem}</td>
            <td>${device.receipt_date}</td>
            <td>${device.expected_delivery}</td>
            <td><span class="status status-${device.status}">${getStatusText(device.status)}</span></td>
            <td>
                <button class="action-btn edit-btn" data-id="${device.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" data-id="${device.id}"><i class="fas fa-trash"></i></button>
                ${device.status !== 'completed' && device.status !== 'delivered'
                    ? `<button class="action-btn complete-btn" data-id="${device.id}"><i class="fas fa-check"></i></button>`
                    : ""}
            </td>
        `;
        devicesTableBody.appendChild(row);
    });

    document.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", () => openEditModal(btn.dataset.id));
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", () => deleteDevice(btn.dataset.id));
    });

    document.querySelectorAll(".complete-btn").forEach((btn) => {
        btn.addEventListener("click", () => completeDevice(btn.dataset.id));
    });
}

function getStatusText(status) {
    switch (status) {
        case "pending":
            return "قيد الإصلاح";
        case "completed":
            return "تم الإصلاح";
        case "delivered":
            return "تم التسليم";
        default:
            return status;
    }
}

deviceForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newDevice = {
        id: Date.now().toString(),
        customerName: document.getElementById("customerName").value,
        customerPhone: document.getElementById("customerPhone").value,
        deviceType: document.getElementById("deviceType").value,
        deviceBrand: document.getElementById("deviceBrand").value,
        deviceProblem: document.getElementById("deviceProblem").value,
        receiptDate: document.getElementById("receiptDate").value,
        expectedDelivery: document.getElementById("expectedDelivery").value,
        status: "pending"
    };

    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDevice)
    });

    deviceForm.reset();
    fetchDevices();
});

async function deleteDevice(id) {
    if (confirm("هل أنت متأكد من حذف هذا الجهاز؟")) {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        fetchDevices();
    }
}

async function completeDevice(id) {
    const device = allDevices.find((d) => d.id === id);
    if (device) {
        device.status = device.status === "pending" ? "completed" : "delivered";
        await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(device)
        });
        fetchDevices();
    }
}

function openEditModal(id) {
    const device = allDevices.find((d) => d.id === id);
    if (device) {
        document.getElementById("editDeviceId").value = device.id;
        document.getElementById("editCustomerName").value = device.customer_name;
        document.getElementById("editCustomerPhone").value = device.customer_phone;
        document.getElementById("editDeviceType").value = device.device_type;
        document.getElementById("editDeviceBrand").value = device.device_brand;
        document.getElementById("editDeviceProblem").value = device.device_problem;
        document.getElementById("editReceiptDate").value = device.receipt_date;
        document.getElementById("editExpectedDelivery").value = device.expected_delivery;
        document.getElementById("editStatus").value = device.status;
        editModal.style.display = "block";
    }
}

editDeviceForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("editDeviceId").value;

    const updatedDevice = {
        customerName: document.getElementById("editCustomerName").value,
        customerPhone: document.getElementById("editCustomerPhone").value,
        deviceType: document.getElementById("editDeviceType").value,
        deviceBrand: document.getElementById("editDeviceBrand").value,
        deviceProblem: document.getElementById("editDeviceProblem").value,
        receiptDate: document.getElementById("editReceiptDate").value,
        expectedDelivery: document.getElementById("editExpectedDelivery").value,
        status: document.getElementById("editStatus").value
    };

    await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedDevice)
    });

    editModal.style.display = "none";
    fetchDevices();
});

searchInput.addEventListener("input", filterDevices);
statusFilter.addEventListener("change", filterDevices);

function filterDevices() {
    const searchTerm = searchInput.value.toLowerCase();
    const status = statusFilter.value;
    let filtered = allDevices;

    if (searchTerm) {
        filtered = filtered.filter(
            (d) =>
                d.customer_name.toLowerCase().includes(searchTerm) ||
                d.device_type.toLowerCase().includes(searchTerm)
        );
    }

    if (status !== "all") {
        filtered = filtered.filter((d) => d.status === status);
    }

    displayDevices(filtered);
}

closeModal.addEventListener("click", () => {
    editModal.style.display = "none";
});
window.addEventListener("click", (e) => {
    if (e.target === editModal) {
        editModal.style.display = "none";
    }
});

fetchDevices();
