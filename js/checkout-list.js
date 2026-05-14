// checkout-list-v3.js - Trả phòng theo DB Schema
// Tính tiền đầy đủ theo LOAIPHONG, TILEPHUTHU, LOAIKHACH
// Sử dụng date input dd/mm/yyyy

let currentCheckoutBooking = null;

document.addEventListener('DOMContentLoaded', () => {
    renderActiveBookings();
    setupSearch();
    updateTotalCount();
});

function renderActiveBookings(filtered = null) {
    const thuePhong = getThuePhong();
    const ctThuePhong = getCTThuePhong();
    const khachHang = getKhachHang();
    const loaiKhach = getLoaiKhach();
    const phong = getPhong();
    const loaiPhong = getLoaiPhong();
    const tbody = document.getElementById('active-bookings-table');

    const activeBookings = thuePhong.filter(tp => tp.NgayTraPhong === null);
    let displayBookings = filtered !== null ? filtered : activeBookings;

    if (displayBookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="empty-state">Không có phòng đang thuê</td></tr>';
        document.getElementById('showing-count').textContent = '0';
        return;
    }

    tbody.innerHTML = displayBookings.map((booking, index) => {
        const room = phong.find(p => p.SoPhong === booking.SoPhong);
        const roomType = loaiPhong.find(lp => lp.MaLoaiPhong === room.MaLoaiPhong);

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
                <td>${roomType.LoaiPhong}</td>
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
                    <button class="btn-icon btn-edit" onclick="openCheckoutModal(${booking.MaThuePhong})" title="Trả phòng">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 11l3 3L22 4"></path>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    document.getElementById('showing-count').textContent = displayBookings.length;
}

function openCheckoutModal(maThuePhong) {
    const thuePhong = getThuePhong();
    const ctThuePhong = getCTThuePhong();
    const khachHang = getKhachHang();
    const loaiKhach = getLoaiKhach();
    const phong = getPhong();
    const loaiPhong = getLoaiPhong();

    currentCheckoutBooking = thuePhong.find(tp => tp.MaThuePhong === maThuePhong);
    if (!currentCheckoutBooking) return;

    const room = phong.find(p => p.SoPhong === currentCheckoutBooking.SoPhong);
    const roomType = loaiPhong.find(lp => lp.MaLoaiPhong === room.MaLoaiPhong);

    const chiTiet = ctThuePhong.filter(ct => ct.MaThuePhong === maThuePhong);
    const guests = chiTiet.map(ct => {
        const khach = khachHang.find(kh => kh.MaKhachHang === ct.MaKhachHang);
        const loai = loaiKhach.find(lk => lk.MaLoaiKhach === khach.MaLoaiKhach);
        return {
            order: ct.ThuTuKhach,
            name: khach.TenKhachHang,
            type: loai.LoaiKhach,
            maLoaiKhach: khach.MaLoaiKhach,
            maKhachHang: khach.MaKhachHang
        };
    });

    document.getElementById('modal-room').textContent = currentCheckoutBooking.SoPhong;
    document.getElementById('modal-room-type').textContent = roomType.LoaiPhong;
    document.getElementById('modal-form-date').textContent = formatDateVN(currentCheckoutBooking.NgayLap);
    document.getElementById('modal-start-date').textContent = formatDateVN(currentCheckoutBooking.NgayBatDauThue);

    // Set ngày trả = hôm nay (format dd/mm/yyyy)
    const checkoutInput = document.getElementById('checkout-date');
    checkoutInput.value = getTodayFormatted();
    checkoutInput.setAttribute('data-iso-date', getTodayISO());

    renderGuestDetails(guests, roomType.DonGia);
    calculateTotal();

    // Trigger date input initialization
    initDateInputs();

    document.getElementById('checkout-modal').style.display = 'flex';
}

function renderGuestDetails(guests, donGiaPhong) {
    const tbody = document.getElementById('guest-detail-body');

    tbody.innerHTML = guests.map(guest => {
        const price = calculateGuestPrice(guest.order, guest.maLoaiKhach, donGiaPhong);

        return `
            <tr>
                <td>${guest.order}</td>
                <td>${guest.name}</td>
                <td><span class="badge-type ${guest.type === 'Nội địa' ? 'badge-local' : 'badge-foreign'}">
                    ${guest.type}
                </span></td>
                <td style="text-align: right; font-weight: 600;">${formatCurrency(price)} VNĐ</td>
            </tr>
        `;
    }).join('');
}

function calculateGuestPrice(thuTuKhach, maLoaiKhach, donGiaPhong) {
    const tiLePhuThu = getTiLePhuThu();
    const loaiKhach = getLoaiKhach();

    const phuThu = tiLePhuThu.find(pt => pt.ThuTuKhach === thuTuKhach);
    const heSoKhach = phuThu ? phuThu.HeSoPhuThu : 1.0;

    const loai = loaiKhach.find(lk => lk.MaLoaiKhach === maLoaiKhach);
    const heSoLoaiKhach = loai ? loai.HeSoPhuThu : 1.0;

    return donGiaPhong * heSoKhach * heSoLoaiKhach;
}

function calculateTotal() {
    if (!currentCheckoutBooking) return;

    const checkoutInput = document.getElementById('checkout-date');
    const checkoutDate = getISODate(checkoutInput);

    if (!checkoutDate) {
        document.getElementById('modal-days').textContent = '0';
        document.getElementById('modal-price-per-day').textContent = '0 VNĐ';
        document.getElementById('modal-total').textContent = '0 VNĐ';
        return;
    }

    const startDate = new Date(currentCheckoutBooking.NgayBatDauThue);
    const endDate = new Date(checkoutDate);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    if (days < 1) {
        alert('Ngày trả phải sau ngày bắt đầu thuê!');
        return;
    }

    const phong = getPhong();
    const loaiPhong = getLoaiPhong();
    const room = phong.find(p => p.SoPhong === currentCheckoutBooking.SoPhong);
    const roomType = loaiPhong.find(lp => lp.MaLoaiPhong === room.MaLoaiPhong);

    const ctThuePhong = getCTThuePhong();
    const khachHang = getKhachHang();
    const chiTiet = ctThuePhong.filter(ct => ct.MaThuePhong === currentCheckoutBooking.MaThuePhong);

    let totalPerDay = 0;
    chiTiet.forEach(ct => {
        const khach = khachHang.find(kh => kh.MaKhachHang === ct.MaKhachHang);
        const guestPrice = calculateGuestPrice(ct.ThuTuKhach, khach.MaLoaiKhach, roomType.DonGia);
        totalPerDay += guestPrice;
    });

    const totalAmount = totalPerDay * days;

    document.getElementById('modal-days').textContent = days;
    document.getElementById('modal-price-per-day').textContent = formatCurrency(totalPerDay) + ' VNĐ';
    document.getElementById('modal-total').textContent = formatCurrency(totalAmount) + ' VNĐ';
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

    const totalText = document.getElementById('modal-total').textContent;
    const totalAmount = parseInt(totalText.replace(/[^\d]/g, ''));

    const thuePhong = getThuePhong();
    const bookingIndex = thuePhong.findIndex(tp => tp.MaThuePhong === currentCheckoutBooking.MaThuePhong);
    if (bookingIndex !== -1) {
        thuePhong[bookingIndex].NgayTraPhong = checkoutDate;
        thuePhong[bookingIndex].SoNgayThue = days;
        thuePhong[bookingIndex].ThanhTien = totalAmount;
        saveThuePhong(thuePhong);
    }

    const hoaDon = getHoaDon();
    const ctHoaDon = getCTHoaDon();
    const maHoaDon = getNextId('HOADON');

    const ctThuePhong = getCTThuePhong();
    const firstGuest = ctThuePhong.find(ct => ct.MaThuePhong === currentCheckoutBooking.MaThuePhong && ct.ThuTuKhach === 1);

    hoaDon.push({
        MaHoaDon: maHoaDon,
        MaKhachHangThanhToan: firstGuest ? firstGuest.MaKhachHang : null,
        MaCoQuan: null,
        NgayThanhToan: checkoutDate,
        TongTien: totalAmount
    });

    const maCTHoaDon = getNextId('CTHOADON');
    ctHoaDon.push({
        MaCTHoaDon: maCTHoaDon,
        MaHoaDon: maHoaDon,
        MaThuePhong: currentCheckoutBooking.MaThuePhong,
        TriGia: totalAmount
    });

    saveHoaDon(hoaDon);
    saveCTHoaDon(ctHoaDon);

    updateTinhTrangPhong(currentCheckoutBooking.SoPhong, 'Trống');

    alert(`Trả phòng thành công!\nTổng tiền: ${formatCurrency(totalAmount)} VNĐ\nHóa đơn số: ${maHoaDon}`);

    closeCheckoutModal();
    renderActiveBookings();
    updateTotalCount();
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();

        if (!searchTerm) {
            renderActiveBookings();
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

        renderActiveBookings(filtered);
    });
}

function updateTotalCount() {
    const thuePhong = getThuePhong();
    const activeCount = thuePhong.filter(tp => tp.NgayTraPhong === null).length;
    document.getElementById('total-active').textContent = activeCount;
}

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
