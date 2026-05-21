// create-invoice.js - Lập hóa đơn thanh toán
// Sử dụng dữ liệu từ localStorage thông qua data-structure.js

document.addEventListener('DOMContentLoaded', () => {
    initializeDatabase();
    setDefaultDate();
    renderAvailableBookings();
    setupCheckboxEvents();
    initCustomerDropdown();
    initAgencyDropdown();
});

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('payment-date').value = today;
}

// ─── Lấy phiếu thuê đã trả phòng, chưa có hóa đơn ───────────────────────────

function getAvailableBookings() {
    const thuePhong = getThuePhong();
    const ctHoaDon = getCTHoaDon();
    return thuePhong.filter(tp => {
        if (!tp.NgayTraPhong) return false;
        return !ctHoaDon.some(ct => ct.MaThuePhong === tp.MaThuePhong);
    });
}

// ─── Lấy khách hàng chỉ thuộc các phiếu thuê chưa thanh toán ────────────────

function getCustomersForAvailableBookings() {
    const availableBookings = getAvailableBookings();
    const availableMaThuePhong = new Set(availableBookings.map(tp => tp.MaThuePhong));
    const ctThuePhong = JSON.parse(localStorage.getItem('CTTHUEPHONG') || '[]');
    const customerIds = new Set(
        ctThuePhong
            .filter(ct => availableMaThuePhong.has(ct.MaThuePhong))
            .map(ct => ct.MaKhachHang)
    );
    return getKhachHang().filter(kh => customerIds.has(kh.MaKhachHang));
}

// ─── Tính giá một khách (giữ nguyên logic từ booking-list cũ) ────────────────

function calculateGuestPrice(thuTuKhach, maLoaiKhach, donGiaPhong) {
    const tiLePhuThu = getTiLePhuThu();
    const loaiKhach = getLoaiKhach();

    const phuThu = tiLePhuThu.find(pt => pt.ThuTuKhach === thuTuKhach);
    const heSoThuTu = phuThu ? phuThu.HeSoPhuThu : 1.0;

    const loai = loaiKhach.find(lk => lk.MaLoaiKhach === maLoaiKhach);
    const heSoLoai = loai ? loai.HeSoPhuThu : 1.0;

    return donGiaPhong * heSoThuTu * heSoLoai;
}

// ─── Danh sách phiếu thuê ─────────────────────────────────────────────────────

function renderAvailableBookings() {
    const availableBookings = getAvailableBookings();
    const phong = getPhong();
    const loaiPhong = getLoaiPhong();
    const tbody = document.getElementById('booking-list-body');

    if (availableBookings.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">Không có phiếu thuê chờ thanh toán</td>
            </tr>`;
        return;
    }

    tbody.innerHTML = availableBookings.map(booking => {
        const room = phong.find(p => p.SoPhong === booking.SoPhong);
        const roomType = room ? loaiPhong.find(lp => lp.MaLoaiPhong === room.MaLoaiPhong) : null;
        const donGia = roomType ? roomType.DonGia : 0;
        const tenLoaiPhong = roomType ? roomType.LoaiPhong : 'N/A';

        return `
            <tr>
                <td>
                    <input type="checkbox" class="booking-checkbox"
                        data-ma-thue-phong="${booking.MaThuePhong}"
                        data-thanh-tien="${booking.ThanhTien || 0}">
                </td>
                <td>${booking.MaThuePhong}</td>
                <td>${booking.SoPhong}</td>
                <td>${tenLoaiPhong}</td>
                <td>${formatDateVN(booking.NgayBatDauThue)}</td>
                <td>${booking.SoNgayThue || 0}</td>
                <td>${formatCurrency(donGia)} VNĐ</td>
                <td><strong>${formatCurrency(booking.ThanhTien || 0)} VNĐ</strong></td>
            </tr>`;
    }).join('');
}

// ─── Checkbox & tổng tiền ─────────────────────────────────────────────────────

function setupCheckboxEvents() {
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('booking-checkbox')) {
            calculateTotal();
        }
    });
}

function calculateTotal() {
    const checkboxes = document.querySelectorAll('.booking-checkbox:checked');
    let total = 0;
    checkboxes.forEach(cb => { total += parseInt(cb.dataset.thanhTien) || 0; });
    document.getElementById('invoice-total').textContent = formatCurrency(total) + ' VNĐ';
}

// ─── Tạo hóa đơn ──────────────────────────────────────────────────────────────

function createInvoice() {
    const selected = document.querySelectorAll('.booking-checkbox:checked');
    if (selected.length === 0) { alert('Vui lòng chọn ít nhất một phiếu thuê!'); return; }

    const maKhachHang = document.getElementById('customer-select').value;
    if (!maKhachHang) { alert('Vui lòng chọn khách hàng thanh toán!'); return; }

    const paymentDate = document.getElementById('payment-date').value;
    if (!paymentDate) { alert('Vui lòng chọn ngày thanh toán!'); return; }

    const maCoQuan = document.getElementById('agency-select').value || null;

    const hoaDon = getHoaDon();
    const ctHoaDon = getCTHoaDon();
    const thuePhong = getThuePhong();
    const maHoaDon = getNextId('HOADON');

    let tongTien = 0;
    const selectedBookings = [];

    selected.forEach(cb => {
        const maThuePhong = parseInt(cb.dataset.maThuePhong);
        const booking = thuePhong.find(tp => tp.MaThuePhong === maThuePhong);
        if (booking) {
            tongTien += booking.ThanhTien || 0;
            selectedBookings.push(booking);
        }
    });

    hoaDon.push({
        MaHoaDon: maHoaDon,
        MaKhachHangThanhToan: parseInt(maKhachHang),
        MaCoQuan: maCoQuan ? parseInt(maCoQuan) : null,
        NgayThanhToan: paymentDate,
        TongTien: tongTien
    });

    selectedBookings.forEach((booking, index) => {
        const maCTHoaDon = getNextId('CTHOADON') + index;
        ctHoaDon.push({
            MaCTHoaDon: maCTHoaDon,
            MaHoaDon: maHoaDon,
            MaThuePhong: booking.MaThuePhong,
            TriGia: booking.ThanhTien || 0
        });
    });

    saveHoaDon(hoaDon);
    saveCTHoaDon(ctHoaDon);

    // Hiển thị modal chi tiết hóa đơn thay vì alert
    showInvoiceResult(maHoaDon, parseInt(maKhachHang), maCoQuan, paymentDate, tongTien, selectedBookings);
}

// ─── Modal hiển thị chi tiết hóa đơn sau khi tạo ─────────────────────────────

function showInvoiceResult(maHoaDon, maKhachHang, maCoQuan, ngayThanhToan, tongTien, bookings) {
    const allCustomers = getKhachHang();
    const coQuan = JSON.parse(localStorage.getItem('COQUAN') || '[]');
    const phong = getPhong();
    const loaiPhong = getLoaiPhong();
    const ctThuePhong = getCTThuePhong();
    const khachHang = getKhachHang();
    const loaiKhach = getLoaiKhach();

    const customer = allCustomers.find(k => k.MaKhachHang === maKhachHang);
    const agency = maCoQuan ? coQuan.find(cq => cq.MaCoQuan === parseInt(maCoQuan)) : null;

    // Header
    document.getElementById('result-invoice-id').textContent =
        `Mã hóa đơn: HD${String(maHoaDon).padStart(3, '0')}`;

    // Thông tin chung
    let html = `
        <div class="inv-info-grid">
            <div class="inv-info-row">
                <span class="lbl">Khách hàng thanh toán</span>
                <span class="val">${customer ? customer.TenKhachHang : 'N/A'}</span>
            </div>
            <div class="inv-info-row">
                <span class="lbl">Ngày thanh toán</span>
                <span class="val">${formatDateVN(ngayThanhToan)}</span>
            </div>
            <div class="inv-info-row">
                <span class="lbl">Địa chỉ</span>
                <span class="val">${customer ? (customer.DiaChi || '—') : '—'}</span>
            </div>
            <div class="inv-info-row">
                <span class="lbl">Cơ quan</span>
                <span class="val">${agency ? agency.TenCoQuan : '—'}</span>
            </div>
        </div>
    `;

    // Chi tiết từng phiếu thuê
    bookings.forEach(booking => {
        const room = phong.find(p => p.SoPhong === booking.SoPhong);
        const roomType = room ? loaiPhong.find(lp => lp.MaLoaiPhong === room.MaLoaiPhong) : null;
        const donGia = roomType ? roomType.DonGia : 0;
        const tenLoaiPhong = roomType ? roomType.LoaiPhong : 'N/A';
        const soNgay = booking.SoNgayThue || 0;

        // Danh sách khách trong phiếu
        const chiTiet = ctThuePhong.filter(ct => ct.MaThuePhong === booking.MaThuePhong);
        let totalPerDay = 0;

        const guestRows = chiTiet.map(ct => {
            const khach = khachHang.find(kh => kh.MaKhachHang === ct.MaKhachHang);
            const loai = loaiKhach.find(lk => lk.MaLoaiKhach === (khach ? khach.MaLoaiKhach : -1));
            const tenKhach = khach ? khach.TenKhachHang : '(N/A)';
            const tenLoai = loai ? loai.LoaiKhach : 'N/A';
            const isNuocNgoai = tenLoai !== 'Nội địa';
            const giaKhach = khach ? calculateGuestPrice(ct.ThuTuKhach, khach.MaLoaiKhach, donGia) : 0;
            totalPerDay += giaKhach;

            return `
                <tr>
                    <td>${ct.ThuTuKhach}</td>
                    <td>${tenKhach}</td>
                    <td><span class="${isNuocNgoai ? 'badge-foreign' : 'badge-local'}">${tenLoai}</span></td>
                    <td style="text-align:right;font-weight:600">${formatCurrency(giaKhach)} VNĐ</td>
                </tr>`;
        }).join('');

        html += `
            <div class="booking-section">
                <div class="booking-section-title">
                    <span class="room-badge">Phòng ${booking.SoPhong}</span>
                    ${tenLoaiPhong} — ${formatDateVN(booking.NgayBatDauThue)} → ${formatDateVN(booking.NgayTraPhong)}
                </div>
                <table class="detail-guest-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên khách</th>
                            <th>Loại khách</th>
                            <th style="text-align:right">Giá / ngày</th>
                        </tr>
                    </thead>
                    <tbody>${guestRows}</tbody>
                </table>
                <div class="booking-summary">
                    <span>Tổng tiền 1 ngày: <strong>${formatCurrency(totalPerDay)} VNĐ</strong></span>
                    <span>Số ngày thuê: <strong>${soNgay}</strong></span>
                    <span>Thành tiền: <strong>${formatCurrency(booking.ThanhTien || 0)} VNĐ</strong></span>
                </div>
            </div>`;
    });

    // Tổng cộng
    html += `
        <div class="inv-total-row">
            <span class="label">Tổng tiền thanh toán</span>
            <span class="amount">${formatCurrency(tongTien)} VNĐ</span>
        </div>
        <p class="payment-note">* Giá đã bao gồm phụ thu theo thứ tự khách và loại khách</p>
    `;

    document.getElementById('invoice-result-body').innerHTML = html;
    document.getElementById('invoice-result-modal').classList.add('open');
}

function closeInvoiceResult() {
    document.getElementById('invoice-result-modal').classList.remove('open');
    window.location.href = 'invoice-list.html';
}

// ─── Searchable dropdown helper ───────────────────────────────────────────────

function createSearchableDropdown({ searchInputId, hiddenInputId, listId, items, placeholder, onSelect }) {
    const searchInput = document.getElementById(searchInputId);
    const hiddenInput = document.getElementById(hiddenInputId);
    const listEl = document.getElementById(listId);

    let allItems = items;
    let selectedValue = '';

    function renderList(query) {
        const q = (query || '').toLowerCase().trim();
        const filtered = q
            ? allItems.filter(item =>
                item.label.toLowerCase().includes(q) ||
                (item.subLabel && item.subLabel.toLowerCase().includes(q)))
            : allItems;

        if (filtered.length === 0) {
            listEl.innerHTML = '<div class="dropdown-empty">Không tìm thấy kết quả</div>';
        } else {
            listEl.innerHTML = filtered.map(item => `
                <div class="dropdown-item${String(item.value) === String(selectedValue) ? ' selected' : ''}"
                    data-value="${item.value}">
                    <div>${item.label}</div>
                    ${item.subLabel ? `<div class="item-sub">${item.subLabel}</div>` : ''}
                </div>`).join('');
        }

        const clearItem = document.createElement('div');
        clearItem.className = 'dropdown-item' + (selectedValue === '' ? ' selected' : '');
        clearItem.dataset.value = '';
        clearItem.textContent = placeholder;
        listEl.insertBefore(clearItem, listEl.firstChild);

        listEl.querySelectorAll('.dropdown-item').forEach(el => {
            el.addEventListener('mousedown', (e) => {
                e.preventDefault();
                selectItem(el.dataset.value);
            });
        });
    }

    function selectItem(value) {
        selectedValue = value;
        hiddenInput.value = value;
        if (value === '') {
            searchInput.value = '';
        } else {
            const found = allItems.find(i => String(i.value) === String(value));
            searchInput.value = found ? found.label : '';
        }
        closeDropdown();
        if (onSelect) {
            const found = allItems.find(i => String(i.value) === String(value));
            onSelect(value, found || null);
        }
    }

    function openDropdown() { renderList(searchInput.value); listEl.classList.add('open'); }
    function closeDropdown() { listEl.classList.remove('open'); }

    searchInput.addEventListener('focus', () => { searchInput.select(); openDropdown(); });
    searchInput.addEventListener('input', () => {
        selectedValue = '';
        hiddenInput.value = '';
        renderList(searchInput.value);
        if (!listEl.classList.contains('open')) listEl.classList.add('open');
    });
    searchInput.addEventListener('blur', () => { setTimeout(closeDropdown, 150); });

    return {
        setItems(newItems) { allItems = newItems; selectedValue = ''; hiddenInput.value = ''; searchInput.value = ''; },
        getValue() { return hiddenInput.value; }
    };
}

// ─── Dropdown khách hàng ──────────────────────────────────────────────────────

function initCustomerDropdown() {
    const customers = getCustomersForAvailableBookings();
    const items = customers.map(kh => ({
        value: String(kh.MaKhachHang),
        label: kh.TenKhachHang || '(Không có tên)',
        subLabel: `CMND: ${kh.CMND || 'N/A'} • ${kh.DiaChi || ''}`
    }));

    createSearchableDropdown({
        searchInputId: 'customer-search',
        hiddenInputId: 'customer-select',
        listId: 'customer-list',
        items,
        placeholder: '-- Chọn khách hàng --',
        onSelect(value) {
            const addressInput = document.getElementById('customer-address');
            if (!value) { addressInput.value = ''; return; }
            const kh = getKhachHang().find(k => String(k.MaKhachHang) === String(value));
            addressInput.value = kh ? (kh.DiaChi || '') : '';
        }
    });

    if (items.length === 0) {
        document.getElementById('customer-search').placeholder =
            'Không có khách hàng nào trong phiếu thuê chưa thanh toán';
    }
}

// ─── Dropdown cơ quan ─────────────────────────────────────────────────────────

function initAgencyDropdown() {
    const coQuan = JSON.parse(localStorage.getItem('COQUAN') || '[]');
    const items = coQuan.map(cq => ({
        value: String(cq.MaCoQuan),
        label: cq.TenCoQuan || '(Không có tên)',
        subLabel: cq.DiaChi || ''
    }));

    createSearchableDropdown({
        searchInputId: 'agency-search',
        hiddenInputId: 'agency-select',
        listId: 'agency-list',
        items,
        placeholder: '-- Không có cơ quan --',
        onSelect() {}
    });
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatDateVN(dateString) {
    if (!dateString) return '-';
    const parts = dateString.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateString;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount);
}