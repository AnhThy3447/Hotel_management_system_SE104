// booking-list.js - Theo DB Schema với View/Edit
// Hiển thị danh sách phiếu thuê từ THUEPHONG, CTTHUEPHONG, KHACHHANG

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

    // Tìm phiếu thuê
    const booking = thuePhong.find(tp => tp.MaThuePhong === maThuePhong);
    if (!booking) return;

    // Xóa chi tiết thuê phòng
    const updatedCTThuePhong = ctThuePhong.filter(ct => ct.MaThuePhong !== maThuePhong);
    saveCTThuePhong(updatedCTThuePhong);

    // Xóa phiếu thuê
    const updatedThuePhong = thuePhong.filter(tp => tp.MaThuePhong !== maThuePhong);
    saveThuePhong(updatedThuePhong);

    // Cập nhật tình trạng phòng về "Trống"
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

            // Tìm theo số phòng
            if (tp.SoPhong.toString().includes(searchTerm)) return true;

            // Tìm theo tên khách
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
    document.getElementById('total-bookings').textContent = activeCount;
}

function formatDateVN(dateString) {
    if (!dateString) return '-';
    const parts = dateString.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
}
