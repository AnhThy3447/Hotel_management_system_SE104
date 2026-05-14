let currentBooking = null;
let guests = [];
let isViewMode = false;

function formatDateVN(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function convertISOToVN(dateStr) {
    if (!dateStr.includes('-')) return dateStr;

    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

function parseVNDate(dateStr) {
    const parts = dateStr.split('/');

    if (parts.length !== 3) return null;

    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const year = parseInt(parts[2]);

    const date = new Date(year, month, day);

    if (
        date.getDate() !== day ||
        date.getMonth() !== month ||
        date.getFullYear() !== year
    ) {
        return null;
    }

    return date;
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('id');
    const mode = urlParams.get('mode');

    isViewMode = mode === 'view';

    document.getElementById('form-date').value = formatDateVN(new Date());

    const startDateInput = document.getElementById('start-date');

    // tự thêm dấu /
    startDateInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');

        if (value.length > 8) {
            value = value.slice(0, 8);
        }

        if (value.length >= 5) {
            value = `${value.slice(0,2)}/${value.slice(2,4)}/${value.slice(4)}`;
        } else if (value.length >= 3) {
            value = `${value.slice(0,2)}/${value.slice(2)}`;
        }

        e.target.value = value;
    });

    if (bookingId) {
        loadBooking(parseInt(bookingId));
    } else {
        addGuest();
    }
});

function loadBooking(id) {
    const bookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
    currentBooking = bookings.find(b => b.id === id);

    if (currentBooking) {
        document.getElementById('form-title').textContent =
            isViewMode
                ? 'Chi tiết Phiếu Thuê Phòng (BM2)'
                : 'Cập nhật Phiếu Thuê Phòng (BM2)';

        document.getElementById('form-subtitle').textContent = `Mã phiếu: #${currentBooking.id}`;
        document.getElementById('save-btn-text').textContent = 'Cập nhật';

        document.getElementById('form-date').value =
            convertISOToVN(currentBooking.formDate);

        document.getElementById('room-number').value =
            currentBooking.roomNumber;

        document.getElementById('start-date').value =
            convertISOToVN(currentBooking.startDate);

        guests = currentBooking.guests || [];
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
                    onchange="updateGuest(${index}, 'idNumber', this.value)"
                    required>
            </td>
            <td>
                <input type="text"
                    value="${guest.address}"
                    onchange="updateGuest(${index}, 'address', this.value)">
            </td>
            <td>
                <button type="button"
                    onclick="removeGuest(${index})"
                    ${guests.length === 1 ? 'disabled' : ''}>
                    Xóa
                </button>
            </td>
        </tr>
    `).join('');

    updateGuestCount();
}

function addGuest() {
    if (guests.length >= 3) {
        alert('Mỗi phòng chỉ tối đa 3 khách!');
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
        alert('Phải có ít nhất 1 khách!');
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

function validateStartDate(startDate) {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;

    if (!regex.test(startDate)) {
        alert('Ngày phải đúng định dạng dd/mm/yyyy!');
        return false;
    }

    const inputDate = parseVNDate(startDate);

    if (!inputDate) {
        alert('Ngày không hợp lệ!');
        return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    const diffDays = (inputDate - today) / (1000 * 60 * 60 * 24);

    if (diffDays < 0) {
        alert('Không được nhập ngày quá khứ!');
        return false;
    }

    if (diffDays > 100) {
        alert('Ngày thuê không được vượt quá 100 ngày từ hôm nay!');
        return false;
    }

    return true;
}

function validateForm() {
    const roomNumber = document.getElementById('room-number').value;
    const startDate = document.getElementById('start-date').value;

    if (!roomNumber || !startDate) {
        alert('Vui lòng nhập đầy đủ thông tin!');
        return false;
    }

    if (!validateStartDate(startDate)) return false;

    for (let guest of guests) {
        if (!guest.name || !guest.idNumber) {
            alert('Vui lòng nhập đầy đủ thông tin khách!');
            return false;
        }
    }

    return true;
}

function saveForm() {
    if (!validateForm()) return;

    const bookingData = {
        id: currentBooking ? currentBooking.id : Date.now(),
        formDate: document.getElementById('form-date').value,
        roomNumber: document.getElementById('room-number').value,
        startDate: document.getElementById('start-date').value,
        guests
    };

    const bookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');

    if (currentBooking) {
        const index = bookings.findIndex(b => b.id === currentBooking.id);
        bookings[index] = bookingData;
    } else {
        bookings.push(bookingData);
    }

    localStorage.setItem('hotelBookings', JSON.stringify(bookings));

    alert('Lưu thành công!');
    window.location.href = 'booking-list.html';
}

function cancelForm() {
    if (confirm('Bạn có chắc muốn hủy?')) {
        window.location.href = 'booking-list.html';
    }
}

function printForm() {
    window.print();
}
