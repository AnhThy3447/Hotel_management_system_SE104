// booking-list.js - Theo DB Schema với View/Edit
// Hiển thị danh sách phiếu thuê từ THUEPHONG, CTTHUEPHONG, KHACHHANG

const API_URL = 'https://hotel-management-system-se104.onrender.com/api';
let bookings = [];

async function initializeData() {
    try {
        const res = await fetch(`${API_URL}/thue-phong`);
        const json = await res.json();
        bookings = json.data || [];
        renderBookings();
        updateTotalCount();
    } catch (err) {
        console.error('Lỗi kết nối backend:', err);
    }
}

function renderBookings(data = bookings) {
    const tbody = document.getElementById('bookings-table');

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Chưa có phiếu thuê phòng nào</td></tr>';
        document.getElementById('showing-count').textContent = '0';
        return;
    }

    tbody.innerHTML = data.map((booking, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><span class="badge badge-room">${booking.sophong || ''}</span></td>
            <td>${new Date(booking.ngaylap).toLocaleDateString('vi-VN')}</td>
            <td>${new Date(booking.ngaylap).toLocaleDateString('vi-VN')}</td>
            <td><span class="badge badge-guests">${booking.guests.length} khách</span></td>
            <td>${booking.guests.map(g => g.name).join(', ')}</td>
            <td>
                <div class="guest-types">
                    ${booking.guests.map(g => `
                        <span class="badge-type ${g.type === 'nội địa' ? 'badge-local' : 'badge-foreign'}">
                            ${g.type}
                        </span>
                    `).join('')}
                </div>
            </td>
            <td>
                <div class="actions">
                    <button class="btn-icon btn-view" onclick="viewBooking(${booking.mathuephong})" title="Xem">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button class="btn-icon btn-edit" onclick="editBooking(${booking.mathuephong})" title="Sửa">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteBooking(${booking.mathuephong})" title="Xóa">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                    <button class="btn-icon" onclick="checkoutBooking(${booking.mathuephong})" title="Trả phòng" style="color: #000000;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    document.getElementById('showing-count').textContent = data.length;
}

function createNewBooking() {
    window.location.href = 'booking-form.html';
}

function viewBooking(id) {
    window.location.href = `booking-form.html?id=${id}&mode=view`;
}

function editBooking(id) {
    window.location.href = `booking-form.html?id=${id}&mode=edit`;
}

async function deleteBooking(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa phiếu thuê này?')) return;
    try {
        await fetch(`${API_URL}/thue-phong/${id}`, { method: 'DELETE' });
        alert('Đã xóa phiếu thuê thành công!');
        initializeData();
    } catch (err) {
        alert('Lỗi: ' + err.message);
    }
}

async function checkoutBooking(id) {
    if (!confirm('Xác nhận trả phòng?')) return;
    try {
        const today = new Date().toISOString().split('T')[0];
        const res = await fetch(`${API_URL}/thue-phong/${id}/tra-phong`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                NgayTraPhong: today,
                SoNgayThue: null,
                ThanhTien: null
            })
        });
        const json = await res.json();
        if (json.success) {
            alert('Trả phòng thành công!');
            initializeData();
        } else {
            alert('Lỗi: ' + json.message);
        }
    } catch (err) {
        alert('Lỗi: ' + err.message);
    }
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = bookings.filter(b =>
            String(b.maphong).toLowerCase().includes(searchTerm) ||
            b.guests.some(g => g.name.toLowerCase().includes(searchTerm))
        );
        renderBookings(filtered);
    });
}

function updateTotalCount() {
    document.getElementById('total-bookings').textContent = bookings.length;
}

document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    setupSearch();
});
