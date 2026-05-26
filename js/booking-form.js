const API_URL = 'https://hotel-management-system-se104.onrender.com/api';
let currentBooking = null;
let guests = [];
let isViewMode = false;
let allRooms = [];
let thamSo = { soKhachToiDa: 3 };
let tiLePhuThu = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadRooms();
    await loadThamSo();

    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('id');
    const mode = urlParams.get('mode');
    isViewMode = mode === 'view';

    if (bookingId) {
        loadBooking(parseInt(bookingId));
    } else {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('form-date').value = today;
        addGuest();
    }
});

async function loadRooms() {
    try {
        const res = await fetch(`${API_URL}/phong`);
        const json = await res.json();
        allRooms = Array.isArray(json) ? json : (json.data || []);

        const select = document.getElementById('room-select');
        const availableRooms = allRooms.filter(p =>
            (p.tinhtrang || '').toLowerCase() === 'trống' ||
            (p.tinhtrang || '').toLowerCase() === 'trong'
        );

        select.innerHTML = '<option value="">-- Chọn phòng trống --</option>' +
            availableRooms.map(p =>
                `<option value="${p.sophong}">${p.sophong} - ${p.loaiphong || ''} (${formatCurrency(p.dongia)} VNĐ/ngày)</option>`
            ).join('');
    } catch (err) {
        console.error('Lỗi load phòng:', err);
    }
}

async function loadThamSo() {
    try {
        const res = await fetch(`${API_URL}/quy-dinh/thamso`);
        const json = await res.json();
        const data = json.data || [];
        const soKhach = data.find(t => t.tenthamso === 'SoKhachToiDa');
        if (soKhach) thamSo.soKhachToiDa = parseInt(soKhach.giatri) || 3;

        const resPT = await fetch(`${API_URL}/quy-dinh/phu-thu`);
        const jsonPT = await resPT.json();
        tiLePhuThu = jsonPT.data || [];
    } catch (err) {
        console.error('Lỗi load tham số:', err);
    }
}

function onRoomChange() {
    const select = document.getElementById('room-select');
    const sophong = select.value;
    const room = allRooms.find(p => String(p.sophong) === String(sophong));

    if (room) {
        document.getElementById('room-info').style.display = 'flex';
        document.getElementById('selected-room-type').textContent = room.loaiphong || 'N/A';
        document.getElementById('selected-room-price').textContent = formatCurrency(room.dongia) + ' VNĐ';
        document.getElementById('max-guests-display').textContent = thamSo.soKhachToiDa;
        document.getElementById('max-guests').textContent = thamSo.soKhachToiDa;
        document.getElementById('max-count').textContent = thamSo.soKhachToiDa;
    } else {
        document.getElementById('room-info').style.display = 'none';
    }
    updatePricePreview();
}

function updatePricePreview() {
    const sophong = document.getElementById('room-select').value;
    const room = allRooms.find(p => String(p.sophong) === String(sophong));
    if (!room || guests.length === 0) {
        document.getElementById('price-preview').style.display = 'none';
        return;
    }

    document.getElementById('price-preview').style.display = 'block';
    let total = 0;
    guests.forEach((g, i) => {
        const pt = tiLePhuThu.find(t => t.thutukhach === (i + 1));
        const heSoThuTu = pt ? pt.hesophuthu : 1.0;
        const heSoLoai = g.type === 'nước ngoài' ? 1.5 : 1.0;
        total += room.dongia * heSoThuTu * heSoLoai;
    });
    document.getElementById('total-per-day').textContent = formatCurrency(total) + ' VNĐ';
}

async function loadBooking(id) {
    try {
        const res = await fetch(`${API_URL}/thue-phong/${id}`);
        const json = await res.json();
        currentBooking = json.data?.phieu;
        const chitiet = json.data?.chitiet || [];

        document.getElementById('form-title').textContent =
            isViewMode ? 'Chi tiết Phiếu Thuê Phòng (BM2)' : 'Cập nhật Phiếu Thuê Phòng (BM2)';
        document.getElementById('form-subtitle').textContent = `Mã phiếu: #${id}`;
        document.getElementById('save-btn-text').textContent = 'Cập nhật';
        document.getElementById('form-date').value = currentBooking?.ngaylap?.split('T')[0] || '';
        document.getElementById('start-date').value = currentBooking?.ngaybatdauthue?.split('T')[0] || '';

        // Set giá trị dropdown phòng
        const select = document.getElementById('room-select');
        select.innerHTML += `<option value="${currentBooking?.sophong}" selected>${currentBooking?.sophong}</option>`;
        select.value = currentBooking?.sophong;

        guests = chitiet.map(ct => ({
            name: ct.tenkhachhang || '',
            type: ct.loaikhach === 'Nước ngoài' ? 'nước ngoài' : 'nội địa',
            idNumber: ct.cmnd || '',
            address: ct.diachi || '',
            makhachhang: ct.makhachhang,
        }));

        renderGuests();

        if (isViewMode) {
            document.querySelectorAll('input, select, button:not(.btn-back)').forEach(el => {
                el.disabled = true;
            });
            document.getElementById('save-btn').style.display = 'none';
        }
    } catch (err) {
        alert('Lỗi tải dữ liệu: ' + err.message);
    }
}

function renderGuests() {
    const tbody = document.getElementById('guest-list');
    tbody.innerHTML = guests.map((guest, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>
                <input type="text" value="${guest.name}" placeholder="Tên khách hàng"
                    onchange="updateGuest(${index}, 'name', this.value)" required>
            </td>
            <td>
                <select onchange="updateGuest(${index}, 'type', this.value)">
                    <option value="nội địa" ${guest.type === 'nội địa' ? 'selected' : ''}>Nội địa</option>
                    <option value="nước ngoài" ${guest.type === 'nước ngoài' ? 'selected' : ''}>Nước ngoài</option>
                </select>
            </td>
            <td>
                <input type="text" value="${guest.idNumber}" placeholder="Số CMND"
                    onchange="updateGuest(${index}, 'idNumber', this.value)" required>
            </td>
            <td>
                <input type="text" value="${guest.address}" placeholder="Địa chỉ"
                    onchange="updateGuest(${index}, 'address', this.value)">
            </td>
            <td style="text-align:right">—</td>
            <td>
                <button type="button" class="btn-remove" onclick="removeGuest(${index})"
                    ${guests.length === 1 ? 'disabled' : ''}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </td>
        </tr>
    `).join('');
    updateGuestCount();
    updatePricePreview();
}

function addGuest() {
    const maxKhach = thamSo.soKhachToiDa || 3;
    if (guests.length >= maxKhach) {
        alert(`Mỗi phòng chỉ được tối đa ${maxKhach} khách!`);
        return;
    }
    guests.push({ name: '', type: 'nội địa', idNumber: '', address: '' });
    renderGuests();
}

function removeGuest(index) {
    if (guests.length === 1) { alert('Phải có ít nhất 1 khách hàng!'); return; }
    guests.splice(index, 1);
    renderGuests();
}

function updateGuest(index, field, value) {
    guests[index][field] = value;
    updatePricePreview();
}

function updateGuestCount() {
    const maxKhach = thamSo.soKhachToiDa || 3;
    document.getElementById('current-count').textContent = guests.length;
    document.getElementById('add-guest-btn').disabled = guests.length >= maxKhach;
}

function validateForm() {
    const formDate = document.getElementById('form-date').value;
    const roomNumber = document.getElementById('room-select').value;
    const startDate = document.getElementById('start-date').value;

    if (!formDate || !roomNumber || !startDate) {
        alert('Vui lòng điền đầy đủ thông tin cơ bản!');
        return false;
    }
    for (let i = 0; i < guests.length; i++) {
        if (!guests[i].name || !guests[i].idNumber) {
            alert(`Vui lòng điền đầy đủ thông tin cho khách hàng ${i + 1}!`);
            return false;
        }
    }
    return true;
}

// Hàm này được gọi từ HTML (onclick="saveBooking()")
async function saveBooking() {
    if (!validateForm()) return;

    const bookingData = {
        SoPhong: document.getElementById('room-select').value,
        NgayLap: document.getElementById('form-date').value,
        NgayBatDauThue: document.getElementById('start-date').value,
        DanhSachKhach: guests.map(g => ({
            name: g.name,
            type: g.type,
            idNumber: g.idNumber,
            address: g.address
        }))
    };

    try {
        const method = currentBooking ? 'PUT' : 'POST';
        const url = currentBooking
            ? `${API_URL}/thue-phong/${currentBooking.mathuephong}`
            : `${API_URL}/thue-phong`;

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });

        const json = await res.json();
        if (json.success) {
            alert('Phiếu thuê phòng đã được lưu thành công!');
            window.location.href = 'booking-list.html';
        } else {
            alert('Lỗi: ' + json.message);
        }
    } catch (err) {
        alert('Lỗi kết nối backend: ' + err.message);
    }
}

// Alias để tương thích
const saveForm = saveBooking;

function cancelForm() {
    if (confirm('Bạn có chắc chắn muốn hủy? Các thay đổi sẽ không được lưu.')) {
        window.location.href = 'booking-list.html';
    }
}

function printForm() { window.print(); }

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount || 0);
}
