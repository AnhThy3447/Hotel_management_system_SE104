// Hỗ trợ: Tạo mới, Xem chi tiết (read-only), Chỉnh sửa

const API_URL = 'http://localhost:3000/api';
let currentBooking = null;
let guests = [];
let isViewMode = false;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('id');
    const mode = urlParams.get('mode');
    isViewMode = mode === 'view';

    if (bookingId) {
        loadBooking(parseInt(bookingId));
    } else {
        document.getElementById('form-date').value = new Date().toISOString().split('T')[0];
        addGuest();
    }
});

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
        document.getElementById('room-number').value = chitiet[0]?.maphong || '';
        document.getElementById('start-date').value = currentBooking?.ngaylap?.split('T')[0] || '';

        // Map dữ liệu từ DB sang format hiển thị
        guests = chitiet.map(ct => ({
            name: ct.tenkhachhang || '',
            type: ct.tenloaikhach || 'nội địa',
            idNumber: ct.cmnd || '',
            address: ct.diachi || '',
            makhachhang: ct.makhachhang,
            maphong: ct.maphong
        }));

        renderGuests();

        // Nếu là chế độ xem thì disable hết input
        if (isViewMode) {
            document.querySelectorAll('input, select, button:not(.btn-back)').forEach(el => {
                el.disabled = true;
            });
            document.getElementById('save-btn-text').closest('button').style.display = 'none';
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
                <input type="text"
                    value="${guest.name}"
                    placeholder="Tên khách hàng"
                    onchange="updateGuest(${index}, 'name', this.value)"
                    required>
            </td>
            <td>
                <select onchange="updateGuest(${index}, 'type', this.value)">
                    <option value="nội địa" ${guest.type === 'nội địa' ? 'selected' : ''}>Nội địa</option>
                    <option value="nước ngoài" ${guest.type === 'nước ngoài' ? 'selected' : ''}>Nước ngoài</option>
                </select>
            </td>
            <td>
                <input type="text"
                    value="${guest.idNumber}"
                    placeholder="Số CMND"
                    onchange="updateGuest(${index}, 'idNumber', this.value)"
                    required>
            </td>
            <td>
                <input type="text"
                    value="${guest.address}"
                    placeholder="Địa chỉ"
                    onchange="updateGuest(${index}, 'address', this.value)">
            </td>
            <td>
                <button type="button"
                    class="btn-remove"
                    onclick="removeGuest(${index})"
                    ${guests.length === 1 ? 'disabled' : ''}
                    title="Xóa khách">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </td>
        </tr>
    `).join('');

    updateGuestCount();
}

function addGuest() {
    if (guests.length >= 3) {
        alert('Mỗi phòng chỉ được tối đa 3 khách!');
        return;
    }
    guests.push({ name: '', type: 'nội địa', idNumber: '', address: '' });
    renderGuests();
}

function removeGuest(index) {
    if (guests.length === 1) {
        alert('Phải có ít nhất 1 khách hàng!');
        return;
    }
    guests.splice(index, 1);
    renderGuests();
}

function updateGuest(index, field, value) {
    guests[index][field] = value;
}

function updateGuestCount() {
    document.getElementById('current-count').textContent = guests.length;
    document.getElementById('add-guest-btn').disabled = guests.length >= 3;
}

function validateForm() {
    const formDate = document.getElementById('form-date').value;
    const roomNumber = document.getElementById('room-number').value;
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

async function saveForm() {
    if (!validateForm()) return;

    const bookingData = {
        SoPhong: document.getElementById('room-number').value,
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
        const res = await fetch('http://localhost:3000/api/thue-phong', {
            method: 'POST',
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

function cancelForm() {
    if (confirm('Bạn có chắc chắn muốn hủy? Các thay đổi sẽ không được lưu.')) {
        window.location.href = 'booking-list.html';
    }
}

function printForm() {
    window.print();
}
