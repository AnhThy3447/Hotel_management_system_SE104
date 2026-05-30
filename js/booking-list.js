// booking-list.js - Theo DB Schema với View/Edit
// Hiển thị danh sách phiếu thuê từ THUEPHONG, CTTHUEPHONG, KHACHHANG

const API_URL = 'https://hotel-management-system-se104.onrender.com/api';
let bookings = [];
let currentCheckoutBooking = null;
let currentChiTiet = [];
let checkoutTiLePhuThu = [];
let checkoutPricingOptions = { khachIncluded: 2, foreignExtraRate: 0.5 };

async function loadCheckoutPricingRules() {
    try {
        const resTS = await fetch(`${API_URL}/quy-dinh/thamso`);
        const jsonTS = await resTS.json();
        const data = jsonTS.data || [];
        const soKhachMienPhi = data.find(t =>
            t.tenthamso === 'SoKhachKhongTinhPhi' || t.tenthamso === 'Số khách không tính phí phụ thu'
        );
        if (soKhachMienPhi) {
            checkoutPricingOptions.khachIncluded = parseInt(soKhachMienPhi.giatri) || 2;
        }

        const resPT = await fetch(`${API_URL}/quy-dinh/phu-thu`);
        const jsonPT = await resPT.json();
        checkoutTiLePhuThu = normalizePhuThu(jsonPT.data || []);

        const resLK = await fetch(`${API_URL}/quy-dinh/loai-khach`);
        const jsonLK = await resLK.json();
        const nn = (jsonLK.data || []).find(l =>
            (l.name || l.LoaiKhach || '').toLowerCase().includes('nước ngoài')
        );
        if (nn) {
            const heSo = parseFloat(nn.surcharge ?? nn.HeSoPhuThu) || 1.5;
            checkoutPricingOptions.foreignExtraRate = Math.max(0, heSo - 1);
        }
    } catch (err) {
        console.error('Lỗi load quy định tính tiền:', err);
    }
}

async function initializeData() {
    try {
        await loadCheckoutPricingRules();
        const res = await fetch(`${API_URL}/thue-phong`);
        const json = await res.json();
        bookings = (json.data || []).filter(b => !b.ngaytrphong);
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
            <td>${new Date(booking.ngaybatdauthue).toLocaleDateString('vi-VN')}</td>
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

// ─── Trả phòng ───────────────────────────────────────────────────────────────
 
async function checkoutBooking(maThuePhong) {
    try {
        const res = await fetch(`${API_URL}/thue-phong/${maThuePhong}`);
        const json = await res.json();
        currentCheckoutBooking = json.data.phieu;
        currentChiTiet = json.data.chitiet || [];
 
        document.getElementById('modal-room').textContent = currentCheckoutBooking.sophong;
        document.getElementById('modal-room-type').textContent = currentCheckoutBooking.loaiphong || 'N/A';
        document.getElementById('modal-start-date').textContent =
            new Date(currentCheckoutBooking.ngaybatdauthue).toLocaleDateString('vi-VN');
 
        // Set ngày trả mặc định = hôm nay
        const checkoutInput = document.getElementById('checkout-date');
        const startISO = currentCheckoutBooking.ngaybatdauthue?.split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        const defaultDate = startISO > today ? startISO : today;
        setDateValue(checkoutInput, defaultDate);

        checkoutInput.addEventListener('input', () => {
            const isoDate = convertToISO(checkoutInput.value);
            checkoutInput.setAttribute('data-iso-date', isoDate);
            updateDayCount();
        });
 
        updateDayCount();
 
        document.getElementById('checkout-modal').style.display = 'flex';
    } catch (err) {
        alert('Lỗi tải dữ liệu: ' + err.message);
    }
}
 
function updateDayCount() {
    if (!currentCheckoutBooking) return;
    const checkoutInput = document.getElementById('checkout-date');
    const checkoutDate = getISODate(checkoutInput) || convertToISO(checkoutInput.value);
    if (!checkoutDate) return;
 
    const startDate = new Date(currentCheckoutBooking.ngaybatdauthue.split('T')[0] + 'T00:00:00');
    const endDate = new Date(checkoutDate + 'T00:00:00');
    const days = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
    document.getElementById('modal-days').textContent = days >= 1 ? days : 0;
}
 
async function confirmCheckout() {
    if (!currentCheckoutBooking) return;
 
    const checkoutDateRaw = document.getElementById('checkout-date').value;
    const checkoutDate = getISODate(document.getElementById('checkout-date')) || convertToISO(checkoutDateRaw);
    if (!checkoutDate) { alert('Vui lòng chọn ngày trả phòng!'); return; }
 
    const startDate = new Date(currentCheckoutBooking.ngaybatdauthue.split('T')[0] + 'T00:00:00');
    const endDate = new Date(checkoutDate + 'T00:00:00');
    const days = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
 
    if (days < 1) { alert('Ngày trả phải sau ngày bắt đầu thuê!'); return; }
 
    const guestsForPricing = currentChiTiet.map(ct => ({
        type: ct.loaikhach,
        loaikhach: ct.loaikhach
    }));
    const tongMotNgay = calcRoomPricePerDay(
        guestsForPricing,
        currentCheckoutBooking.dongia || 0,
        checkoutTiLePhuThu,
        checkoutPricingOptions
    );
    const tongTien = Math.round(tongMotNgay * days);
 
    try {
        const res = await fetch(`${API_URL}/thue-phong/${currentCheckoutBooking.mathuephong}/tra-phong`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                NgayTraPhong: checkoutDate,
                SoNgayThue: days,
                ThanhTien: tongTien
            })
        });
        const json = await res.json();
        if (json.success) {
            await setRoomStatusCleaning(currentCheckoutBooking.sophong);
            alert(`Trả phòng thành công!\nVào mục "Hóa đơn" → "Tạo hóa đơn" để lập hóa đơn thanh toán.`);
            closeCheckoutModal();
            initializeData();
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
    currentChiTiet = [];
}

/** Sau trả phòng: đặt trạng thái phòng = Dọn dẹp (maintenance) */
async function setRoomStatusCleaning(soPhong) {
    if (!soPhong) return;
    try {
        const resList = await fetch(`${API_URL}/phong`);
        if (!resList.ok) return;
        const rooms = await resList.json();
        const room = rooms.find(r => String(r.id) === String(soPhong));
        if (!room) return;

        await fetch(`${API_URL}/phong/${soPhong}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: room.type,
                status: 'maintenance',
                notes: room.notes || ''
            })
        });
    } catch (err) {
        console.warn('Không cập nhật được trạng thái Dọn dẹp:', err);
    }
}
 
function convertToISO(ddmmyyyy) {
    if (!ddmmyyyy) return '';
    const parts = ddmmyyyy.split('/');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return ddmmyyyy;
}

// ─── Search & Utils ───────────────────────────────────────────────────────────
 
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = bookings.filter(b =>
            String(b.sophong).toLowerCase().includes(searchTerm) ||
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