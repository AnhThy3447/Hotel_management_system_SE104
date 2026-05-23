// booking-list.js - Theo DB Schema với View/Edit
// Hiển thị danh sách phiếu thuê từ THUEPHONG, CTTHUEPHONG, KHACHHANG

const API_URL = 'http://localhost:3000/api';
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
