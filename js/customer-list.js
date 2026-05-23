// customer-list.js - Tra cứu khách hàng và cơ quan

const API_URL = 'https://hotel-management-system-se104.onrender.com/api';

let allCustomers = [];
let allAgencies = [];

document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
    setupCustomerSearch();
    setupAgencySearch();
    setupHistorySearch();
});

async function loadAllData() {
    await renderCustomers();
    await renderAgencies();
    await renderHistory();
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function switchTab(tab) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('panel-' + tab).classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
}

// ─── Khách hàng ───────────────────────────────────────────────────────────────

async function renderCustomers(list = null) {
    try {
        if (!list) {
            const res = await fetch(`${API_URL}/khach-hang`);
            const json = await res.json();
            allCustomers = json.data || [];
        }

        const customers = list || allCustomers;
        const tbody = document.getElementById('customer-table-body');

        document.getElementById('customer-count-badge').textContent = allCustomers.length;
        document.getElementById('customer-showing').textContent = customers.length;

        if (customers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="empty-state">Không có khách hàng nào</td></tr>`;
            return;
        }

        tbody.innerHTML = customers.map((kh, index) => {
            const tenLoai = kh.loaikhach || 'N/A';
            const isNuocNgoai = tenLoai !== 'Nội địa';
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${kh.cmnd || '—'}</td>
                    <td><strong>${kh.tenkhachhang || '—'}</strong></td>
                    <td>
                        <span class="${isNuocNgoai ? 'badge-foreign' : 'badge-local'}">
                            ${tenLoai}
                        </span>
                    </td>
                    <td>${kh.diachi || '—'}</td>
                    <td><span class="badge badge-guests">—</span></td>
                    <td>
                        <div class="actions">
                            <button class="btn-icon btn-view" onclick="viewCustomer(${kh.makhachhang})" title="Xem chi tiết">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>`;
        }).join('');
    } catch (err) {
        console.error('Lỗi tải khách hàng:', err);
    }
}

async function viewCustomer(maKhachHang) {
    try {
        const res = await fetch(`${API_URL}/khach-hang/${maKhachHang}`);
        const json = await res.json();
        const kh = json.data;
        if (!kh) return;

        document.getElementById('modal-customer-name').value = kh.tenkhachhang || '';
        document.getElementById('modal-customer-cmnd').value = kh.cmnd || '';
        document.getElementById('modal-customer-type').value = kh.loaikhach || 'N/A';
        document.getElementById('modal-customer-address').value = kh.diachi || '';
        document.getElementById('modal-customer-history').innerHTML =
            '<span style="color:#94a3b8">Chưa có lịch sử thuê phòng</span>';

        document.getElementById('customer-modal').classList.add('open');
    } catch (err) {
        alert('Lỗi: ' + err.message);
    }
}

function closeCustomerModal() {
    document.getElementById('customer-modal').classList.remove('open');
}

function setupCustomerSearch() {
    document.getElementById('customer-search').addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        if (!q) { renderCustomers(allCustomers); return; }
        const filtered = allCustomers.filter(kh =>
            (kh.tenkhachhang || '').toLowerCase().includes(q) ||
            (kh.cmnd || '').toString().includes(q) ||
            (kh.diachi || '').toLowerCase().includes(q) ||
            (kh.loaikhach || '').toLowerCase().includes(q)
        );
        renderCustomers(filtered);
    });
}

// ─── Cơ quan ──────────────────────────────────────────────────────────────────

async function renderAgencies(list = null) {
    try {
        if (!list) {
            const res = await fetch(`${API_URL}/co-quan`);
            const json = await res.json();
            allAgencies = json.data || [];
        }

        const agencies = list || allAgencies;
        const tbody = document.getElementById('agency-table-body');

        document.getElementById('agency-count-badge').textContent = allAgencies.length;
        document.getElementById('agency-showing').textContent = agencies.length;

        if (agencies.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="empty-state">Chưa có cơ quan nào</td></tr>`;
            return;
        }

        tbody.innerHTML = agencies.map((cq, index) => `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${cq.tencoquan || '—'}</strong></td>
                <td>${cq.diachi || '—'}</td>
                <td>
                    <div class="actions">
                        <button class="btn-icon btn-edit" onclick="editAgency(${cq.macoquan})" title="Sửa">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteAgency(${cq.macoquan})" title="Xóa">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>`).join('');
    } catch (err) {
        console.error('Lỗi tải cơ quan:', err);
    }
}

async function addAgency() {
    const tenInput = document.getElementById('new-agency-name');
    const diaChiInput = document.getElementById('new-agency-address');
    const ten = tenInput.value.trim();
    if (!ten) { alert('Vui lòng nhập tên cơ quan!'); tenInput.focus(); return; }

    try {
        const res = await fetch(`${API_URL}/co-quan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ TenCoQuan: ten, DiaChi: diaChiInput.value.trim() })
        });
        const json = await res.json();
        if (json.success) {
            tenInput.value = '';
            diaChiInput.value = '';
            await renderAgencies();
        } else {
            alert('Lỗi: ' + json.message);
        }
    } catch (err) {
        alert('Lỗi kết nối: ' + err.message);
    }
}

async function editAgency(maCoQuan) {
    const cq = allAgencies.find(c => c.macoquan === maCoQuan);
    if (!cq) return;
    document.getElementById('edit-agency-id').value = maCoQuan;
    document.getElementById('edit-agency-name').value = cq.tencoquan || '';
    document.getElementById('edit-agency-address').value = cq.diachi || '';
    document.getElementById('agency-modal').classList.add('open');
}

async function saveAgency() {
    const maCoQuan = document.getElementById('edit-agency-id').value;
    const ten = document.getElementById('edit-agency-name').value.trim();
    const diaChi = document.getElementById('edit-agency-address').value.trim();
    if (!ten) { alert('Vui lòng nhập tên cơ quan!'); return; }

    try {
        const res = await fetch(`${API_URL}/co-quan/${maCoQuan}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ TenCoQuan: ten, DiaChi: diaChi })
        });
        const json = await res.json();
        if (json.success) {
            closeAgencyModal();
            await renderAgencies();
        } else {
            alert('Lỗi: ' + json.message);
        }
    } catch (err) {
        alert('Lỗi kết nối: ' + err.message);
    }
}

async function deleteAgency(maCoQuan) {
    if (!confirm('Bạn có chắc chắn muốn xóa cơ quan này?')) return;
    try {
        await fetch(`${API_URL}/co-quan/${maCoQuan}`, { method: 'DELETE' });
        await renderAgencies();
    } catch (err) {
        alert('Lỗi: ' + err.message);
    }
}

function closeAgencyModal() {
    document.getElementById('agency-modal').classList.remove('open');
}

function setupAgencySearch() {
    document.getElementById('agency-search').addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        if (!q) { renderAgencies(allAgencies); return; }
        const filtered = allAgencies.filter(cq =>
            (cq.tencoquan || '').toLowerCase().includes(q) ||
            (cq.diachi || '').toLowerCase().includes(q)
        );
        renderAgencies(filtered);
    });
}

// ─── Lịch sử thuê phòng ───────────────────────────────────────────────────────

let allHistory = [];

async function renderHistory(list = null) {
    try {
        if (!list) {
            const res = await fetch(`${API_URL}/thue-phong`);
            const json = await res.json();
            allHistory = json.data || [];
        }

        const rows = list || allHistory;
        const tbody = document.getElementById('history-table-body');

        document.getElementById('history-count-badge').textContent = allHistory.length;
        document.getElementById('history-showing').textContent = rows.length;

        if (rows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="empty-state">Không có kết quả tra cứu</td></tr>`;
            return;
        }

        tbody.innerHTML = rows.map((row, index) => {
            const dangThue = !row.ngaytrphong;
            const ngayTraText = dangThue
                ? `<span style="color:#f59e0b;font-style:italic">Đang thuê</span>`
                : formatDateVN(row.ngaytrphong?.split('T')[0]);
            const thanhTienText = dangThue
                ? `<span style="color:#94a3b8">—</span>`
                : `<strong style="color:#16a34a">${formatCurrency(row.thanhtien)} VNĐ</strong>`;

            return `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${row.guests?.map(g => g.name).join(', ') || '—'}</strong></td>
                    <td>${row.guests?.map(g => `<span class="${g.type === 'Nội địa' ? 'badge-local' : 'badge-foreign'}">${g.type}</span>`).join(' ') || '—'}</td>
                    <td><span class="badge badge-room">${row.sophong || '—'}</span></td>
                    <td>${formatDateVN(row.ngaybatdauthue?.split('T')[0])}</td>
                    <td>${ngayTraText}</td>
                    <td>${dangThue ? '—' : (row.songaythue || 0)}</td>
                    <td>${thanhTienText}</td>
                </tr>`;
        }).join('');
    } catch (err) {
        console.error('Lỗi tải lịch sử:', err);
    }
}

function setupHistorySearch() {
    const applyFilter = () => {
        const name = document.getElementById('history-filter-name').value.toLowerCase().trim();
        const room = document.getElementById('history-filter-room').value.trim();
        const status = document.getElementById('history-filter-status').value;

        let rows = allHistory;
        if (name) rows = rows.filter(r => r.guests?.some(g => g.name.toLowerCase().includes(name)));
        if (room) rows = rows.filter(r => String(r.sophong).includes(room));
        if (status === 'done') rows = rows.filter(r => r.ngaytrphong);
        if (status === 'active') rows = rows.filter(r => !r.ngaytrphong);

        renderHistory(rows);
    };

    ['history-filter-name', 'history-filter-room', 'history-filter-status']
        .forEach(id => document.getElementById(id).addEventListener('input', applyFilter));
}

function clearHistoryFilter() {
    document.getElementById('history-filter-name').value = '';
    document.getElementById('history-filter-room').value = '';
    document.getElementById('history-filter-status').value = '';
    renderHistory(allHistory);
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatDateVN(dateString) {
    if (!dateString) return '-';
    const parts = dateString.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateString;
}

function formatCurrency(amount) {
    if (!amount && amount !== 0) return '0';
    return Number(amount).toLocaleString('vi-VN');
}
