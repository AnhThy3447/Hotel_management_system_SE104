// booking-list.js - Logic cho trang danh sách thuê phòng

let bookings = [
    {
        id: 1,
        formDate: '2026-05-08',
        roomNumber: '101',
        startDate: '2026-05-10',
        guests: [
            { name: 'Nguyễn Văn A', type: 'nội địa', idNumber: '001234567890', address: 'Hà Nội' },
            { name: 'Trần Thị B', type: 'nội địa', idNumber: '001234567891', address: 'Hà Nội' }
        ]
    },
    {
        id: 2,
        formDate: '2026-05-09',
        roomNumber: '205',
        startDate: '2026-05-11',
        guests: [
            { name: 'John Smith', type: 'nước ngoài', idNumber: 'US12345678', address: 'USA' }
        ]
    },
    {
        id: 3,
        formDate: '2026-05-09',
        roomNumber: '312',
        startDate: '2026-05-12',
        guests: [
            { name: 'Lê Văn C', type: 'nội địa', idNumber: '001234567892', address: 'TP.HCM' },
            { name: 'Phạm Thị D', type: 'nội địa', idNumber: '001234567893', address: 'TP.HCM' },
            { name: 'Hoàng Văn E', type: 'nội địa', idNumber: '001234567894', address: 'Đà Nẵng' }
        ]
    }
];

function initializeData() {
    const stored = localStorage.getItem('hotelBookings');
    if (!stored) {
        localStorage.setItem('hotelBookings', JSON.stringify(bookings));
    } else {
        bookings = JSON.parse(stored);
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
            <td><span class="badge badge-room">${booking.roomNumber}</span></td>
            <td>${formatDate(booking.formDate)}</td>
            <td>${formatDate(booking.startDate)}</td>
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
                    <button class="btn-icon btn-view" onclick="viewBooking(${booking.id})" title="Xem chi tiết">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button class="btn-icon btn-edit" onclick="editBooking(${booking.id})" title="Chỉnh sửa">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteBooking(${booking.id})" title="Xóa">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
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
    window.location.href = `booking-form.html?id=${id}`;
}

function deleteBooking(id) {
    if (confirm('Bạn có chắc chắn muốn xóa phiếu thuê phòng này?')) {
        bookings = bookings.filter(b => b.id !== id);
        localStorage.setItem('hotelBookings', JSON.stringify(bookings));
        renderBookings();
        updateTotalCount();
    }
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = bookings.filter(booking =>
            booking.roomNumber.toLowerCase().includes(searchTerm) ||
            booking.guests.some(g => g.name.toLowerCase().includes(searchTerm))
        );
        renderBookings(filtered);
    });
}

function updateTotalCount() {
    document.getElementById('total-bookings').textContent = bookings.length;
}

document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    renderBookings();
    setupSearch();
    updateTotalCount();
});
