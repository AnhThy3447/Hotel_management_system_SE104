// invoice-list.js - Quản lý danh sách hóa đơn
// Sử dụng dữ liệu từ localStorage thông qua data-structure.js

document.addEventListener('DOMContentLoaded', () => {
    initializeDatabase();
    loadInvoices();
    setupSearch();
});

function loadInvoices(filtered = null) {
    const hoaDon = filtered !== null ? filtered : getHoaDon();
    const ctHoaDon = getCTHoaDon();
    const khachHang = getKhachHang();

    const tableBody = document.getElementById('invoice-table-body');
    const totalInvoices = document.getElementById('total-invoices');
    const showingCount = document.getElementById('showing-count');

    if (hoaDon.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    Chưa có hóa đơn nào. Hãy tạo hóa đơn mới!
                </td>
            </tr>
        `;
        totalInvoices.textContent = '0';
        showingCount.textContent = '0';
        return;
    }

    tableBody.innerHTML = hoaDon.map((invoice, index) => {
        const kh = khachHang.find(k => k.MaKhachHang === invoice.MaKhachHangThanhToan);
        const tenKhach = kh ? kh.TenKhachHang : 'N/A';
        const soPhieuThue = ctHoaDon.filter(ct => ct.MaHoaDon === invoice.MaHoaDon).length;
        const maHD = 'HD' + String(invoice.MaHoaDon).padStart(3, '0');

        return `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${maHD}</strong></td>
                <td>${tenKhach}</td>
                <td>${formatDateVN(invoice.NgayThanhToan)}</td>
                <td><span class="badge badge-room">${soPhieuThue}</span></td>
                <td><strong style="color: #4CAF50;">${formatCurrency(invoice.TongTien)} VNĐ</strong></td>
                <td>
                    <div class="actions">
                        <button class="btn-icon btn-view" onclick="viewInvoice(${invoice.MaHoaDon})" title="Xem chi tiết">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                        <button class="btn-icon btn-print" onclick="printInvoiceById(${invoice.MaHoaDon})" title="In hóa đơn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                <rect x="6" y="14" width="12" height="8"></rect>
                            </svg>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteInvoice(${invoice.MaHoaDon})" title="Xóa hóa đơn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    const allHoaDon = getHoaDon();
    totalInvoices.textContent = allHoaDon.length;
    showingCount.textContent = hoaDon.length;
}

// Xem chi tiết hóa đơn
function viewInvoice(maHoaDon) {
    const hoaDon = getHoaDon();
    const ctHoaDon = getCTHoaDon();
    const thuePhong = getThuePhong();
    const khachHang = getKhachHang();
    const phong = getPhong();
    const loaiPhong = getLoaiPhong();
    const coQuan = JSON.parse(localStorage.getItem('COQUAN') || '[]');

    const invoice = hoaDon.find(hd => hd.MaHoaDon === maHoaDon);
    if (!invoice) return;

    const kh = khachHang.find(k => k.MaKhachHang === invoice.MaKhachHangThanhToan);
    const tenKhach = kh ? kh.TenKhachHang : 'N/A';

    const cq = coQuan.find(c => c.MaCoQuan === invoice.MaCoQuan);
    const tenCoQuan = cq ? cq.TenCoQuan : 'Không có';

    const maHD = 'HD' + String(invoice.MaHoaDon).padStart(3, '0');

    document.getElementById('modal-invoice-id').textContent = maHD;
    document.getElementById('modal-customer').textContent = tenKhach;
    document.getElementById('modal-agency').textContent = tenCoQuan;
    document.getElementById('modal-date').textContent = formatDateVN(invoice.NgayThanhToan);
    document.getElementById('modal-total').textContent = formatCurrency(invoice.TongTien) + ' VNĐ';

    const details = ctHoaDon.filter(ct => ct.MaHoaDon === maHoaDon);

    const detailBody = document.getElementById('invoice-detail-body');
    detailBody.innerHTML = details.map((detail, index) => {
        const booking = thuePhong.find(tp => tp.MaThuePhong === detail.MaThuePhong);
        const room = booking ? phong.find(p => p.SoPhong === booking.SoPhong) : null;
        const roomType = room ? loaiPhong.find(lp => lp.MaLoaiPhong === room.MaLoaiPhong) : null;

        const soPhong = booking ? booking.SoPhong : 'N/A';
        const tenLoaiPhong = roomType ? roomType.LoaiPhong : 'N/A';
        const soNgay = booking ? (booking.SoNgayThue || 0) : 0;
        const donGia = roomType ? roomType.DonGia : 0;

        return `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${soPhong}</strong></td>
                <td>${tenLoaiPhong}</td>
                <td>${soNgay}</td>
                <td>${formatCurrency(donGia)} VNĐ</td>
                <td><strong style="color: #4CAF50;">${formatCurrency(detail.TriGia)} VNĐ</strong></td>
            </tr>
        `;
    }).join('');

    document.getElementById('invoice-modal').classList.add('show');
}

// Đóng modal
function closeInvoiceModal() {
    document.getElementById('invoice-modal').classList.remove('show');
}

// Xóa hóa đơn
function deleteInvoice(maHoaDon) {
    if (!confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) return;

    let hoaDon = getHoaDon();
    let ctHoaDon = getCTHoaDon();

    ctHoaDon = ctHoaDon.filter(ct => ct.MaHoaDon !== maHoaDon);
    saveCTHoaDon(ctHoaDon);

    hoaDon = hoaDon.filter(hd => hd.MaHoaDon !== maHoaDon);
    saveHoaDon(hoaDon);

    alert('Đã xóa hóa đơn thành công!');
    loadInvoices();
}

// In hóa đơn (từ modal đang mở)
function printInvoice() {
    window.print();
}

// In hóa đơn theo ID (mở modal rồi in)
function printInvoiceById(maHoaDon) {
    viewInvoice(maHoaDon);
    setTimeout(() => window.print(), 300);
}

// Tìm kiếm hóa đơn
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();

        if (!searchTerm) { loadInvoices(); return; }

        const hoaDon = getHoaDon();
        const khachHang = getKhachHang();
        const ctHoaDon = getCTHoaDon();
        const thuePhong = getThuePhong();

        const filtered = hoaDon.filter(hd => {
            const maHD = 'HD' + String(hd.MaHoaDon).padStart(3, '0');
            if (maHD.toLowerCase().includes(searchTerm)) return true;

            const kh = khachHang.find(k => k.MaKhachHang === hd.MaKhachHangThanhToan);
            if (kh && kh.TenKhachHang.toLowerCase().includes(searchTerm)) return true;

            const details = ctHoaDon.filter(ct => ct.MaHoaDon === hd.MaHoaDon);
            return details.some(ct => {
                const booking = thuePhong.find(tp => tp.MaThuePhong === ct.MaThuePhong);
                return booking && booking.SoPhong.toString().includes(searchTerm);
            });
        });

        loadInvoices(filtered);
    });
}

function goToCreateInvoice() {
    window.location.href = 'create-invoice.html';
}

function formatDateVN(dateString) {
    if (!dateString) return '-';
    const parts = dateString.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateString;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount || 0);
}