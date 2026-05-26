const API_URL = 'https://hotel-management-system-se104.onrender.com/api/bao-cao';

document.addEventListener('DOMContentLoaded', () => {
    // Tự động tải báo cáo doanh thu lần đầu khi vào trang
    applyFilter();
});

function changeReportType() {
    const reportType = document.getElementById('reportType').value;
    
    if (reportType === 'revenue') {
        document.getElementById('revenue-report').style.display = 'block';
        document.getElementById('customer-report').style.display = 'none';
    } else {
        document.getElementById('revenue-report').style.display = 'none';
        document.getElementById('customer-report').style.display = 'block';
    }
}

function changeFilterType() {
    const filterType = document.getElementById('filterType').value;
    const monthBox = document.getElementById('monthBox');
    const yearBox = document.getElementById('yearBox');

    if (filterType === 'month') {
        monthBox.style.display = 'block';
        yearBox.style.display = 'none';
    } else {
        monthBox.style.display = 'none';
        yearBox.style.display = 'block';
    }
}

// Hàm xử lý khi bấm nút "Xem" (onclick="applyFilter()")
function applyFilter() {
    const reportType = document.getElementById('reportType').value;
    updateDisplayTimeText();

    if (reportType === 'revenue') {
        loadRevenueReport();
    } else {
        loadGuestReport();
    }
}

function updateDisplayTimeText() {
    const filterType = document.getElementById('filterType').value;
    let timeText = '';

    if (filterType === 'month') {
        const monthVal = document.getElementById('reportMonth').value; // Định dạng từ ô input: YYYY-MM
        if (monthVal) {
            const [year, month] = monthVal.split('-');
            timeText = `Tháng ${parseInt(month)}/${year}`;
        } else {
            timeText = "Chưa chọn tháng";
        }
    } else {
        const yearVal = document.getElementById('reportYear').value;
        timeText = `Năm ${yearVal}`;
    }

    const displayMonth1 = document.getElementById('displayMonth');
    const displayMonth2 = document.getElementById('displayMonth2');
    
    if (displayMonth1) displayMonth1.textContent = timeText;
    if (displayMonth2) displayMonth2.textContent = timeText;
}

function getFilterData() {
    const filterType = document.getElementById('filterType').value;
    let value = '';

    if (filterType === 'month') {
        value = document.getElementById('reportMonth').value;
    } else {
        value = document.getElementById('reportYear').value;
    }

    return { filterType, value };
}

// ======================================================
// LOAD BÁO CÁO DOANH THU
// ======================================================
async function loadRevenueReport() {
    const tbody = document.getElementById('revenueBody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: #666;">Đang tải dữ liệu...</td></tr>`;

    try {
        const filter = getFilterData();
        if (!filter.value) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: red;">Vui lòng chọn thời gian hợp lệ</td></tr>`;
            return;
        }

        const res = await fetch(`${API_URL}/doanh-thu?filterType=${filter.filterType}&value=${filter.value}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        // ĐÃ SỬA: Đọc JSON trực tiếp, loại bỏ hoàn toàn câu lệnh lỗi logic cũ
        const json = await res.json();
        const data = json.data || [];

        const elTotalRevenue = document.getElementById('totalRevenue');
        const elTotalCount = document.getElementById('totalCount');

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: #ff9800;">Không có dữ liệu doanh thu</td></tr>`;
            if (elTotalRevenue) elTotalRevenue.textContent = '0 VNĐ';
            if (elTotalCount) elTotalCount.textContent = '0';
            return;
        }

        if (elTotalRevenue) elTotalRevenue.textContent = formatCurrency(json.totalRevenue) + ' VNĐ';
        if (elTotalCount) elTotalCount.textContent = json.totalCount;

        // Render dữ liệu, map đúng item.type từ API trả về ('A', 'B', 'C')
        tbody.innerHTML = data.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>Loại ${item.type}</td>
                <td>${formatCurrency(item.revenue)} VNĐ</td>
                <td>${item.percent}%</td>
                <td>${item.count}</td>
                <td>${item.rentPercent}%</td>
                <td><span style="color: ${item.count > 0 ? 'green' : '#999'}">${item.count > 0 ? 'Có lượt thuê' : 'Không có'}</span></td>
            </tr>
        `).join('');

    } catch (err) {
        console.error("Lỗi Client Doanh Thu:", err);
        tbody.innerHTML = `<tr><td colspan="7" style="color:red; text-align:center; font-weight:bold;">Lỗi hệ thống: ${err.message}</td></tr>`;
    }
}

// ======================================================
// LOAD BÁO CÁO KHÁCH
// ======================================================
async function loadGuestReport() {
    const tbody = document.getElementById('customerBody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: #666;">Đang tải dữ liệu...</td></tr>`;

    try {
        const filter = getFilterData();
        if (!filter.value) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: red;">Vui lòng chọn thời gian hợp lệ</td></tr>`;
            return;
        }

        const res = await fetch(`${API_URL}/khach?filterType=${filter.filterType}&value=${filter.value}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const data = json.data || [];

        const elTotalCustomer = document.getElementById('totalCustomer');

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: #ff9800;">Không có dữ liệu khách</td></tr>`;
            if (elTotalCustomer) elTotalCustomer.textContent = '0';
            return;
        }

        if (elTotalCustomer) elTotalCustomer.textContent = json.total || 0;

        tbody.innerHTML = data.map(item => `
            <tr>
                <td>${item.month}</td>
                <td><strong>${item.type}</strong></td>
                <td>${item.count}</td>
                <td>${item.percent}%</td>
            </tr>
        `).join('');

    } catch (err) {
        console.error("Lỗi Client Khách:", err);
        tbody.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center; font-weight:bold;">Lỗi hệ thống: ${err.message}</td></tr>`;
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount || 0);
}

// Đưa các hàm ra phạm vi global để thẻ HTML gọi trực tiếp được qua onclick/onchange
window.changeReportType = changeReportType;
window.changeFilterType = changeFilterType;
window.applyFilter = applyFilter;