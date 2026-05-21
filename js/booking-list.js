// booking-list.js - Theo DB Schema với View/Edit
// Hiển thị danh sách phiếu thuê từ THUEPHONG, CTTHUEPHONG, KHACHHANG

let currentCheckoutBooking = null;

document.addEventListener('DOMContentLoaded', () => {
    renderBookings();
    setupSearch();
    updateTotalCount();
});

function renderBookings(filtered = null) {
    const thuePhong = getThuePhong();
    const ctThuePhong = getCTThuePhong();
    const khachHang = getKhachHang();
    const loaiKhach = getLoaiKhach();
    const tbody = document.getElementById('bookings-table');

    // Lọc chỉ phòng chưa trả (NgayTraPhong = null)
    const activeBookings = thuePhong.filter(tp => tp.NgayTraPhong === null);

    let displayBookings = filtered !== null ? filtered : activeBookings;

    if (displayBookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Chưa có phiếu thuê phòng nào</td></tr>';
        document.getElementById('showing-count').textContent = '0';
        return;
    }

    tbody.innerHTML = displayBookings.map((booking, index) => {
        // Lấy danh sách khách cho phiếu thuê này
        const chiTiet = ctThuePhong.filter(ct => ct.MaThuePhong === booking.MaThuePhong);
        const guests = chiTiet.map(ct => {
            const khach = khachHang.find(kh => kh.MaKhachHang === ct.MaKhachHang);
            const loai = loaiKhach.find(lk => lk.MaLoaiKhach === khach.MaLoaiKhach);
            return {
                name: khach.TenKhachHang,
                type: loai.LoaiKhach
            };
        });

        return `
            <tr>
                <td>${index + 1}</td>
                <td><span class="badge badge-room">${booking.SoPhong}</span></td>
                <td>${formatDateVN(booking.NgayLap)}</td>
                <td>${formatDateVN(booking.NgayBatDauThue)}</td>
                <td><span class="badge badge-guests">${guests.length} khách</span></td>
                <td>${guests.map(g => g.name).join(', ')}</td>
                <td>
                    <div class="guest-types">
                        ${guests.map(g => `
                            <span class="badge-type ${g.type === 'Nội địa' ? 'badge-local' : 'badge-foreign'}">
                                ${g.type}
                            </span>
                        `).join('')}
                    </div>
                </td>
                <td>
                    <div class="actions">
                        <button class="btn-icon btn-view" onclick="viewBooking(${booking.MaThuePhong})" title="Xem chi tiết">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                        <button class="btn-icon btn-edit" onclick="editBooking(${booking.MaThuePhong})" title="Chỉnh sửa">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteBooking(${booking.MaThuePhong})" title="Xóa">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                        <button class="btn-icon btn-confirm" onclick="openCheckoutModal(${booking.MaThuePhong})" title="Trả phòng">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    document.getElementById('showing-count').textContent = displayBookings.length;
}

function createNewBooking() {
    window.location.href = 'booking-form.html';
}

function viewBooking(maThuePhong) {
    window.location.href = `booking-form.html?id=${maThuePhong}&mode=view`;
}

function editBooking(maThuePhong) {
    window.location.href = `booking-form.html?id=${maThuePhong}`;
}

function deleteBooking(maThuePhong) {
    if (!confirm('Bạn có chắc chắn muốn xóa phiếu thuê phòng này?')) {
        return;
    }

    const thuePhong = getThuePhong();
    const ctThuePhong = getCTThuePhong();

    const booking = thuePhong.find(tp => tp.MaThuePhong === maThuePhong);
    if (!booking) return;

    const updatedCTThuePhong = ctThuePhong.filter(ct => ct.MaThuePhong !== maThuePhong);
    saveCTThuePhong(updatedCTThuePhong);

    const updatedThuePhong = thuePhong.filter(tp => tp.MaThuePhong !== maThuePhong);
    saveThuePhong(updatedThuePhong);

    updateTinhTrangPhong(booking.SoPhong, 'Trống');

    alert('Đã xóa phiếu thuê!');
    renderBookings();
    updateTotalCount();
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();

        if (!searchTerm) {
            renderBookings();
            return;
        }

        const thuePhong = getThuePhong();
        const ctThuePhong = getCTThuePhong();
        const khachHang = getKhachHang();

        const filtered = thuePhong.filter(tp => {
            if (tp.NgayTraPhong !== null) return false;

            if (tp.SoPhong.toString().includes(searchTerm)) return true;

            const chiTiet = ctThuePhong.filter(ct => ct.MaThuePhong === tp.MaThuePhong);
            return chiTiet.some(ct => {
                const khach = khachHang.find(kh => kh.MaKhachHang === ct.MaKhachHang);
                return khach && khach.TenKhachHang.toLowerCase().includes(searchTerm);
            });
        });

        renderBookings(filtered);
    });
}

function updateTotalCount() {
    const thuePhong = getThuePhong();
    const activeCount = thuePhong.filter(tp => tp.NgayTraPhong === null).length;

    const totalElement = document.getElementById('total-bookings');
    if (totalElement) {
        totalElement.textContent = activeCount;
    }
}

// ─── Modal xác nhận trả phòng ─────────────────────────────────────────────────

function openCheckoutModal(maThuePhong) {
    const thuePhong = getThuePhong();
    const phong = getPhong();
    const loaiPhong = getLoaiPhong();

    currentCheckoutBooking = thuePhong.find(tp => tp.MaThuePhong === maThuePhong);
    if (!currentCheckoutBooking) return;

    const room = phong.find(p => p.SoPhong === currentCheckoutBooking.SoPhong);
    const roomType = loaiPhong.find(lp => lp.MaLoaiPhong === room.MaLoaiPhong);

    document.getElementById('modal-room').textContent = currentCheckoutBooking.SoPhong;
    document.getElementById('modal-room-type').textContent = roomType ? roomType.LoaiPhong : 'N/A';
    document.getElementById('modal-start-date').textContent = formatDateVN(currentCheckoutBooking.NgayBatDauThue);
    document.getElementById('modal-days').textContent = '0';

    // Đặt ngày trả = hôm nay
    const checkoutInput = document.getElementById('checkout-date');
    checkoutInput.value = getTodayFormatted();
    checkoutInput.setAttribute('data-iso-date', getTodayISO());

    // Kích hoạt date input và tính số ngày ban đầu
    initDateInputs();
    updateDayCount();

    document.getElementById('checkout-modal').style.display = 'flex';
}

// Cập nhật số ngày hiển thị khi đổi ngày trả
function updateDayCount() {
    if (!currentCheckoutBooking) return;

    const checkoutInput = document.getElementById('checkout-date');
    const checkoutDate = getISODate(checkoutInput);

    if (!checkoutDate) {
        document.getElementById('modal-days').textContent = '0';
        return;
    }

    const startDate = new Date(currentCheckoutBooking.NgayBatDauThue);
    const endDate = new Date(checkoutDate);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    document.getElementById('modal-days').textContent = days >= 1 ? days : '0';
}

function closeCheckoutModal() {
    document.getElementById('checkout-modal').style.display = 'none';
    currentCheckoutBooking = null;
}

function confirmCheckout() {
    if (!currentCheckoutBooking) return;

    const checkoutInput = document.getElementById('checkout-date');
    const checkoutDate = getISODate(checkoutInput);

    if (!checkoutDate) {
        alert('Vui lòng chọn ngày trả phòng!');
        return;
    }

    const startDate = new Date(currentCheckoutBooking.NgayBatDauThue);
    const endDate = new Date(checkoutDate);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    if (days < 1) {
        alert('Ngày trả phải sau ngày bắt đầu thuê!');
        return;
    }

    // Tính ThanhTien để lưu vào THUEPHONG (dùng khi lập hóa đơn sau)
    const totalAmount = computeThanhTien(currentCheckoutBooking.MaThuePhong, days);

    // Lưu ngày trả phòng, số ngày, thành tiền vào THUEPHONG
    const thuePhong = getThuePhong();
    const bookingIndex = thuePhong.findIndex(tp => tp.MaThuePhong === currentCheckoutBooking.MaThuePhong);
    if (bookingIndex !== -1) {
        thuePhong[bookingIndex].NgayTraPhong = checkoutDate;
        thuePhong[bookingIndex].SoNgayThue = days;
        thuePhong[bookingIndex].ThanhTien = totalAmount;
        saveThuePhong(thuePhong);
    }

    // Cập nhật tình trạng phòng về "Trống"
    updateTinhTrangPhong(currentCheckoutBooking.SoPhong, 'Trống');

    alert('Trả phòng thành công!\nVào mục "Hóa đơn" → "Tạo hóa đơn" để lập hóa đơn thanh toán.');

    closeCheckoutModal();
    renderBookings();
    updateTotalCount();
}

// Tính tổng ThanhTien theo logic phụ thu (lưu ngầm, không hiển thị)
function computeThanhTien(maThuePhong, soNgay) {
    const ctThuePhong = getCTThuePhong();
    const khachHang = getKhachHang();
    const phong = getPhong();
    const loaiPhong = getLoaiPhong();
    const tiLePhuThu = getTiLePhuThu();
    const loaiKhach = getLoaiKhach();

    const booking = getThuePhong().find(tp => tp.MaThuePhong === maThuePhong);
    if (!booking) return 0;

    const room = phong.find(p => p.SoPhong === booking.SoPhong);
    const roomType = loaiPhong.find(lp => lp.MaLoaiPhong === room.MaLoaiPhong);
    const donGia = roomType ? roomType.DonGia : 0;

    const chiTiet = ctThuePhong.filter(ct => ct.MaThuePhong === maThuePhong);

    let totalPerDay = 0;
    chiTiet.forEach(ct => {
        const khach = khachHang.find(kh => kh.MaKhachHang === ct.MaKhachHang);
        if (!khach) return;

        const phuThu = tiLePhuThu.find(pt => pt.ThuTuKhach === ct.ThuTuKhach);
        const heSoThuTu = phuThu ? phuThu.HeSoPhuThu : 1.0;

        const loai = loaiKhach.find(lk => lk.MaLoaiKhach === khach.MaLoaiKhach);
        const heSoLoai = loai ? loai.HeSoPhuThu : 1.0;

        totalPerDay += donGia * heSoThuTu * heSoLoai;
    });

    return totalPerDay * soNgay;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatDateVN(dateString) {
    if (!dateString) return '-';
    const parts = dateString.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount);
}