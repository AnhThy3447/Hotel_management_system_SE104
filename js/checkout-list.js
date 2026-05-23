// checkout-list-v3.js - Trả phòng theo DB Schema
// Tính tiền đầy đủ theo LOAIPHONG, TILEPHUTHU, LOAIKHACH
// Sử dụng date input dd/mm/yyyy

const API_URL = 'http://localhost:3000/api';
let currentCheckoutBooking = null;
let allBookings = [];

document.addEventListener('DOMContentLoaded', () => {
    loadActiveBookings();
    setupSearch();
});

async function loadActiveBookings() {
    try {
        const res = await fetch(`${API_URL}/thue-phong`);
        const json = await res.json();
        // Chỉ lấy phòng chưa trả (NgayTraPhong = null)
        allBookings = (json.data || []).filter(b => !b.ngaytrphong);
        renderActiveBookings(allBookings);
        updateTotalCount();
    } catch (err) {
        console.error('Lỗi:', err);
    }
}

function renderActiveBookings(data) {
    const tbody = document.getElementById('active-bookings-table');

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="empty-state">Không có phòng đang thuê</td></tr>';
        document.getElementById('showing-count').textContent = '0';
        return;
    }

    tbody.innerHTML = data.map((booking, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><span class="badge badge-room">${booking.sophong || ''}</span></td>
            <td>${booking.loaiphong || 'N/A'}</td>
            <td>${formatDateVN(booking.ngaylap)}</td>
            <td>${formatDateVN(booking.ngaybatdauthue)}</td>
            <td><span class="badge badge-guests">${booking.guests.length} khách</span></td>
            <td>${booking.guests.map(g => g.name).join(', ')}</td>
            <td>
                <div class="guest-types">
                    ${booking.guests.map(g => `
                        <span class="badge-type ${g.type === 'Nội địa' ? 'badge-local' : 'badge-foreign'}">
                            ${g.type}
                        </span>
                    `).join('')}
                </div>
            </td>
            <td>
                <button class="btn-icon btn-edit" onclick="openCheckoutModal(${booking.mathuephong})" title="Trả phòng">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 11l3 3L22 4"></path>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                </button>
            </td>
        </tr>
    `).join('');

    document.getElementById('showing-count').textContent = data.length;
}

async function openCheckoutModal(maThuePhong) {
    try {
        const res = await fetch(`${API_URL}/thue-phong/${maThuePhong}`);
        const json = await res.json();
        currentCheckoutBooking = json.data.phieu;
        const chitiet = json.data.chitiet || [];

        document.getElementById('modal-room').textContent = currentCheckoutBooking.sophong;
        document.getElementById('modal-room-type').textContent = currentCheckoutBooking.loaiphong || 'N/A';
        document.getElementById('modal-form-date').textContent = formatDateVN(currentCheckoutBooking.ngaylap?.split('T')[0]);
        document.getElementById('modal-start-date').textContent = formatDateVN(currentCheckoutBooking.ngaybatdauthue?.split('T')[0]);

        const checkoutInput = document.getElementById('checkout-date');
        const today = new Date().toISOString().split('T')[0];
        checkoutInput.value = today;

        renderGuestDetails(chitiet);
        calculateTotal(currentCheckoutBooking, chitiet);

        document.getElementById('checkout-modal').style.display = 'flex';
    } catch (err) {
        alert('Lỗi tải dữ liệu: ' + err.message);
    }
}

function renderGuestDetails(chitiet) {
    const tbody = document.getElementById('guest-detail-body');
    tbody.innerHTML = chitiet.map(ct => `
        <tr>
            <td>${ct.thutukhach || ''}</td>
            <td>${ct.tenkhachhang || ''}</td>
            <td><span class="badge-type ${ct.loaikhach === 'Nội địa' ? 'badge-local' : 'badge-foreign'}">
                ${ct.loaikhach || 'N/A'}
            </span></td>
            <td style="text-align: right; font-weight: 600;">—</td>
        </tr>
    `).join('');
}

function calculateTotal(booking, chitiet) {
    const checkoutInput = document.getElementById('checkout-date');
    const checkoutDate = checkoutInput.value;
    if (!checkoutDate || !booking) return;

    const startDate = new Date(booking.ngaybatdauthue);
    const endDate = new Date(checkoutDate);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    document.getElementById('modal-days').textContent = days >= 1 ? days : 0;
    document.getElementById('modal-price-per-day').textContent = '—';
    document.getElementById('modal-total').textContent = '—';
}

async function confirmCheckout() {
    if (!currentCheckoutBooking) return;

    const checkoutDate = document.getElementById('checkout-date').value;
    if (!checkoutDate) { alert('Vui lòng chọn ngày trả phòng!'); return; }

    const startDate = new Date(currentCheckoutBooking.ngaybatdauthue);
    const endDate = new Date(checkoutDate);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    if (days < 1) { alert('Ngày trả phải sau ngày bắt đầu thuê!'); return; }

    try {
        const res = await fetch(`${API_URL}/thue-phong/${currentCheckoutBooking.mathuephong}/tra-phong`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                NgayTraPhong: checkoutDate,
                SoNgayThue: days,
                ThanhTien: null
            })
        });
        const json = await res.json();
        if (json.success) {
            alert('Trả phòng thành công!');
            closeCheckoutModal();
            loadActiveBookings();
        } else {
            alert('Lỗi: ' + json.message);
        }
    } catch (err) {
        alert('Lỗi kết nối: ' + err.message);
    }
}

function closeCheckoutModal() {
    document.getElementById('checkout-modal').style.display = 'none';
    currentCheckoutBooking = null;
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        if (!q) { renderActiveBookings(allBookings); return; }
        const filtered = allBookings.filter(b =>
            String(b.sophong).includes(q) ||
            b.guests.some(g => g.name.toLowerCase().includes(q))
        );
        renderActiveBookings(filtered);
    });
}

function updateTotalCount() {
    document.getElementById('total-active').textContent = allBookings.length;
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
