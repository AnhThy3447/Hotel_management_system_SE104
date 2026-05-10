// booking-form.js - Logic cho trang form thuê phòng

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

function loadBooking(id) {
    const bookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
    currentBooking = bookings.find(b => b.id === id);

    if (currentBooking) {
        document.getElementById('form-title').textContent =
            isViewMode ? 'Chi tiết Phiếu Thuê Phòng (BM2)' : 'Cập nhật Phiếu Thuê Phòng (BM2)';
        document.getElementById('form-subtitle').textContent = `Mã phiếu: #${currentBooking.id}`;
        document.getElementById('save-btn-text').textContent = 'Cập nhật';

        document.getElementById('form-date').value = currentBooking.formDate;
        document.getElementById('room-number').value = currentBooking.roomNumber;
        document.getElementById('start-date').value = currentBooking.startDate;

        guests = currentBooking.guests;
        renderGuests();
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

    guests.push({
        id: guests.length + 1,
        name: '',
        type: 'nội địa',
        idNumber: '',
        address: ''
    });

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

    const addBtn = document.getElementById('add-guest-btn');
    if (guests.length >= 3) {
        addBtn.disabled = true;
    } else {
        addBtn.disabled = false;
    }
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

function saveForm() {
    if (!validateForm()) {
        return;
    }

    const bookingData = {
        id: currentBooking ? currentBooking.id : Date.now(),
        formDate: document.getElementById('form-date').value,
        roomNumber: document.getElementById('room-number').value,
        startDate: document.getElementById('start-date').value,
        guests: guests
    };

    const bookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');

    if (currentBooking) {
        const index = bookings.findIndex(b => b.id === currentBooking.id);
        bookings[index] = bookingData;
    } else {
        bookings.push(bookingData);
    }

    localStorage.setItem('hotelBookings', JSON.stringify(bookings));

    alert('Phiếu thuê phòng đã được lưu thành công!');
    window.location.href = 'booking-list.html';
}

function cancelForm() {
    if (confirm('Bạn có chắc chắn muốn hủy? Các thay đổi sẽ không được lưu.')) {
        window.location.href = 'booking-list.html';
    }
}

function printForm() {
    window.print();
}
