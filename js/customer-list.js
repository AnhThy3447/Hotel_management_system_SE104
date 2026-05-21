// customer-list.js - Tra cứu khách hàng và cơ quan

document.addEventListener('DOMContentLoaded', () => {
    initializeDatabase();
    renderCustomers();
    renderAgencies();
    setupCustomerSearch();
    setupAgencySearch();
});

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function switchTab(tab) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('panel-' + tab).classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
}

// ─── Khách hàng ───────────────────────────────────────────────────────────────

// Chỉ lấy khách hàng đã từng thuê phòng (có trong CTTHUEPHONG)
function getCustomersWhoStayed() {
    const ctThuePhong = getCTThuePhong();
    const allCustomers = getKhachHang();
    const stayedIds = new Set(ctThuePhong.map(ct => ct.MaKhachHang));
    return allCustomers.filter(kh => stayedIds.has(kh.MaKhachHang));
}

function renderCustomers(list = null) {
    const customers = list !== null ? list : getCustomersWhoStayed();
    const loaiKhach = getLoaiKhach();
    const ctThuePhong = getCTThuePhong();
    const tbody = document.getElementById('customer-table-body');

    document.getElementById('customer-count-badge').textContent = getCustomersWhoStayed().length;
    document.getElementById('customer-showing').textContent = customers.length;

    if (customers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-state">Không có khách hàng nào</td></tr>`;
        return;
    }

    tbody.innerHTML = customers.map((kh, index) => {
        const loai = loaiKhach.find(lk => lk.MaLoaiKhach === kh.MaLoaiKhach);
        const tenLoai = loai ? loai.LoaiKhach : 'N/A';
        const isNuocNgoai = tenLoai !== 'Nội địa';
        const soLanThue = ctThuePhong.filter(ct => ct.MaKhachHang === kh.MaKhachHang).length;

        return `
            <tr>
                <td>${index + 1}</td>
                <td>${kh.CMND || '—'}</td>
                <td><strong>${kh.TenKhachHang || '—'}</strong></td>
                <td>
                    <span class="${isNuocNgoai ? 'badge-foreign' : 'badge-local'}">
                        ${tenLoai}
                    </span>
                </td>
                <td>${kh.DiaChi || '—'}</td>
                <td><span class="badge badge-guests">${soLanThue} lần</span></td>
                <td>
                    <div class="actions">
                        <button class="btn-icon btn-view" onclick="viewCustomer(${kh.MaKhachHang})" title="Xem chi tiết">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>`;
    }).join('');
}

function viewCustomer(maKhachHang) {
    const allCustomers = getKhachHang();
    const loaiKhach = getLoaiKhach();
    const ctThuePhong = getCTThuePhong();
    const thuePhong = getThuePhong();

    const kh = allCustomers.find(k => k.MaKhachHang === maKhachHang);
    if (!kh) return;

    const loai = loaiKhach.find(lk => lk.MaLoaiKhach === kh.MaLoaiKhach);

    document.getElementById('modal-customer-name').value = kh.TenKhachHang || '';
    document.getElementById('modal-customer-cmnd').value = kh.CMND || '';
    document.getElementById('modal-customer-type').value = loai ? loai.LoaiKhach : 'N/A';
    document.getElementById('modal-customer-address').value = kh.DiaChi || '';

    // Lịch sử các phiếu thuê
    const chiTiet = ctThuePhong.filter(ct => ct.MaKhachHang === maKhachHang);
    const maThuePhongList = [...new Set(chiTiet.map(ct => ct.MaThuePhong))];
    const historyEl = document.getElementById('modal-customer-history');

    if (maThuePhongList.length === 0) {
        historyEl.innerHTML = '<span style="color:#94a3b8">Chưa có lịch sử thuê phòng</span>';
    } else {
        historyEl.innerHTML = maThuePhongList.map(maTP => {
            const tp = thuePhong.find(t => t.MaThuePhong === maTP);
            if (!tp) return '';
            const ngayBD = formatDateVN(tp.NgayBatDauThue);
            const ngayTra = tp.NgayTraPhong ? formatDateVN(tp.NgayTraPhong) : '<em>Đang thuê</em>';
            return `<div>• Phòng <strong>${tp.SoPhong}</strong> — ${ngayBD} → ${ngayTra} (${tp.SoNgayThue || '?'} ngày)</div>`;
        }).join('');
    }

    document.getElementById('customer-modal').classList.add('open');
}

function closeCustomerModal() {
    document.getElementById('customer-modal').classList.remove('open');
}

function setupCustomerSearch() {
    document.getElementById('customer-search').addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        if (!q) { renderCustomers(); return; }

        const loaiKhach = getLoaiKhach();
        const filtered = getCustomersWhoStayed().filter(kh => {
            if ((kh.TenKhachHang || '').toLowerCase().includes(q)) return true;
            if ((kh.CMND || '').toString().includes(q)) return true;
            if ((kh.DiaChi || '').toLowerCase().includes(q)) return true;
            const loai = loaiKhach.find(lk => lk.MaLoaiKhach === kh.MaLoaiKhach);
            if (loai && loai.LoaiKhach.toLowerCase().includes(q)) return true;
            return false;
        });
        renderCustomers(filtered);
    });
}

// ─── Cơ quan ──────────────────────────────────────────────────────────────────

function getCoQuan() {
    return JSON.parse(localStorage.getItem('COQUAN') || '[]');
}

function saveCoQuan(data) {
    localStorage.setItem('COQUAN', JSON.stringify(data));
}

function getNextCoQuanId() {
    const list = getCoQuan();
    return list.length > 0 ? Math.max(...list.map(cq => cq.MaCoQuan)) + 1 : 1;
}

function renderAgencies(list = null) {
    const agencies = list !== null ? list : getCoQuan();
    const tbody = document.getElementById('agency-table-body');

    document.getElementById('agency-count-badge').textContent = getCoQuan().length;
    document.getElementById('agency-showing').textContent = agencies.length;

    if (agencies.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty-state">Chưa có cơ quan nào</td></tr>`;
        return;
    }

    tbody.innerHTML = agencies.map((cq, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${cq.TenCoQuan || '—'}</strong></td>
            <td>${cq.DiaChi || '—'}</td>
            <td>
                <div class="actions">
                    <button class="btn-icon btn-edit" onclick="editAgency(${cq.MaCoQuan})" title="Sửa">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteAgency(${cq.MaCoQuan})" title="Xóa">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>`).join('');
}

function addAgency() {
    const tenInput = document.getElementById('new-agency-name');
    const diaChiInput = document.getElementById('new-agency-address');

    const ten = tenInput.value.trim();
    if (!ten) { alert('Vui lòng nhập tên cơ quan!'); tenInput.focus(); return; }

    const list = getCoQuan();
    list.push({
        MaCoQuan: getNextCoQuanId(),
        TenCoQuan: ten,
        DiaChi: diaChiInput.value.trim()
    });
    saveCoQuan(list);

    tenInput.value = '';
    diaChiInput.value = '';
    renderAgencies();
}

function editAgency(maCoQuan) {
    const cq = getCoQuan().find(c => c.MaCoQuan === maCoQuan);
    if (!cq) return;

    document.getElementById('edit-agency-id').value = maCoQuan;
    document.getElementById('edit-agency-name').value = cq.TenCoQuan || '';
    document.getElementById('edit-agency-address').value = cq.DiaChi || '';
    document.getElementById('agency-modal').classList.add('open');
}

function saveAgency() {
    const maCoQuan = parseInt(document.getElementById('edit-agency-id').value);
    const ten = document.getElementById('edit-agency-name').value.trim();
    const diaChi = document.getElementById('edit-agency-address').value.trim();

    if (!ten) { alert('Vui lòng nhập tên cơ quan!'); return; }

    const list = getCoQuan();
    const idx = list.findIndex(c => c.MaCoQuan === maCoQuan);
    if (idx !== -1) {
        list[idx].TenCoQuan = ten;
        list[idx].DiaChi = diaChi;
        saveCoQuan(list);
    }

    closeAgencyModal();
    renderAgencies();
}

function deleteAgency(maCoQuan) {
    if (!confirm('Bạn có chắc chắn muốn xóa cơ quan này?')) return;
    const list = getCoQuan().filter(c => c.MaCoQuan !== maCoQuan);
    saveCoQuan(list);
    renderAgencies();
}

function closeAgencyModal() {
    document.getElementById('agency-modal').classList.remove('open');
}

function setupAgencySearch() {
    document.getElementById('agency-search').addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        if (!q) { renderAgencies(); return; }
        const filtered = getCoQuan().filter(cq =>
            (cq.TenCoQuan || '').toLowerCase().includes(q) ||
            (cq.DiaChi || '').toLowerCase().includes(q)
        );
        renderAgencies(filtered);
    });
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatDateVN(dateString) {
    if (!dateString) return '-';
    const parts = dateString.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateString;
}