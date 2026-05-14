// Hỗ trợ: Tạo mới, Xem chi tiết (read-only), Chỉnh sửa

let selectedRoom = null;
let guestCount = 0;
const maxGuests = getThamSo().SoKhachToiDa || 3;

let currentMode = 'create'; // 'create', 'view', 'edit'
let currentBookingId = null;

// ============= KHỞI TẠO TRANG =============
document.addEventListener('DOMContentLoaded', function() {
    checkMode();
    loadAvailableRooms();
    initFormDate();
    updateGuestCounter();
    updateMaxGuestsDisplay();
});

function checkMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const mode = urlParams.get('mode');

    if (id) {
        currentBookingId = parseInt(id);

        if (mode === 'view') {
            currentMode = 'view';
            setViewMode();
            loadBookingData(currentBookingId);
        } else {
            currentMode = 'edit';
            setEditMode();
            loadBookingData(currentBookingId);
        }
    } else {
        currentMode = 'create';
        setCreateMode();
    }
}

function setViewMode() {
    document.getElementById('form-title').textContent = 'Chi tiết Phiếu Thuê Phòng';
    document.getElementById('save-btn').classList.add('hidden');

    // Show print button
    const printBtn = document.getElementById('print-btn');
    if (printBtn) printBtn.classList.remove('hidden');

    // Disable tất cả input
    setTimeout(() => {
        document.querySelectorAll('input, select, button').forEach(el => {
            if (!el.classList.contains('btn-back') &&
                el.id !== 'save-btn' &&
                el.id !== 'print-btn' &&
                !el.onclick || el.onclick.toString().includes('cancelForm') ||
                el.onclick.toString().includes('printForm')) {
                el.disabled = true;
            }
        });

        // Disable add guest button
        const addBtn = document.getElementById('add-guest-btn');
        if (addBtn) addBtn.disabled = true;
    }, 500);
}

function setEditMode() {
    document.getElementById('form-title').textContent = 'Chỉnh sửa Phiếu Thuê Phòng';
    const saveBtnText = document.getElementById('save-btn-text');
    if (saveBtnText) {
        saveBtnText.textContent = 'Cập nhật phiếu';
    }

    // Hide print button in edit mode
    const printBtn = document.getElementById('print-btn');
    if (printBtn) printBtn.classList.add('hidden');
}

function setCreateMode() {
    document.getElementById('form-title').textContent = 'Tạo Phiếu Thuê Phòng Mới (BM2)';

    // Hide print button in create mode
    const printBtn = document.getElementById('print-btn');
    if (printBtn) printBtn.classList.add('hidden');
}

function loadBookingData(maThuePhong) {
    const thuePhong = getThuePhong();
    const ctThuePhong = getCTThuePhong();
    const khachHang = getKhachHang();
    const loaiKhach = getLoaiKhach();
    const phong = getPhong();
    const loaiPhong = getLoaiPhong();

    const booking = thuePhong.find(tp => tp.MaThuePhong === maThuePhong);
    if (!booking) {
        alert('Không tìm thấy phiếu thuê!');
        window.location.href = 'booking-list-v3.html';
        return;
    }

    // Load basic info
    setDateValue(document.getElementById('form-date'), booking.NgayLap);
    setDateValue(document.getElementById('start-date'), booking.NgayBatDauThue);

    // Load room
    const room = phong.find(p => p.SoPhong === booking.SoPhong);
    selectedRoom = room;

    document.getElementById('room-select').value = booking.SoPhong;

    const roomType = loaiPhong.find(lp => lp.MaLoaiPhong === room.MaLoaiPhong);
    displayRoomInfo(roomType);

    // Load guests
    const chiTiet = ctThuePhong.filter(ct => ct.MaThuePhong === maThuePhong);
    chiTiet.forEach(ct => {
        const khach = khachHang.find(kh => kh.MaKhachHang === ct.MaKhachHang);
        const loai = loaiKhach.find(lk => lk.MaLoaiKhach === khach.MaLoaiKhach);

        addGuestWithData({
            name: khach.TenKhachHang,
            type: khach.MaLoaiKhach,
            cmnd: khach.CMND,
            address: khach.DiaChi || '',
            maKhachHang: khach.MaKhachHang
        });
    });

    updatePricePreview();
}

// Hiển thị số khách tối đa
function updateMaxGuestsDisplay() {
    const elements = document.querySelectorAll('#max-guests, #max-count, #max-guests-rule');
    elements.forEach(el => {
        if (el) el.textContent = maxGuests;
    });
}

// Thiết lập ngày lập mặc định là hôm nay
function initFormDate() {
    if (currentMode === 'create') {
        const today = getTodayFormatted();
        document.getElementById('form-date').value = today;
        document.getElementById('form-date').setAttribute('data-iso-date', getTodayISO());

        document.getElementById('start-date').value = today;
        document.getElementById('start-date').setAttribute('data-iso-date', getTodayISO());
    }
}

// ============= LOAD PHÒNG TRỐNG =============
function loadAvailableRooms() {
    const phong = getPhong();
    const loaiPhong = getLoaiPhong();
    const roomSelect = document.getElementById('room-select');

    if (!roomSelect) return;

    // Lọc phòng trống (hoặc phòng hiện tại nếu đang edit)
    let availableRooms = phong.filter(p => p.TinhTrang === 'Trống');

    // Nếu đang edit, thêm phòng hiện tại vào danh sách
    if (currentMode === 'edit' && selectedRoom) {
        const currentRoom = phong.find(p => p.SoPhong === selectedRoom.SoPhong);
        if (currentRoom && !availableRooms.find(r => r.SoPhong === currentRoom.SoPhong)) {
            availableRooms.push(currentRoom);
        }
    }

    // Xóa options cũ (trừ option đầu tiên)
    roomSelect.innerHTML = '<option value="">-- Chọn phòng trống --</option>';

    // Thêm các phòng
    availableRooms.forEach(room => {
        const loai = loaiPhong.find(lp => lp.MaLoaiPhong === room.MaLoaiPhong);
        const option = document.createElement('option');
        option.value = room.SoPhong;
        option.textContent = `Phòng ${room.SoPhong} - ${loai.LoaiPhong} (${formatCurrency(loai.DonGia)})`;
        roomSelect.appendChild(option);
    });

    if (availableRooms.length === 0) {
        roomSelect.innerHTML = '<option value="">Không có phòng trống</option>';
        roomSelect.disabled = true;
    }
}

// ============= XỬ LÝ CHỌN PHÒNG =============
function onRoomChange() {
    const roomSelect = document.getElementById('room-select');
    const soPhong = parseInt(roomSelect.value);

    if (!soPhong) {
        hideRoomInfo();
        return;
    }

    const phong = getPhong();
    const loaiPhong = getLoaiPhong();

    selectedRoom = phong.find(p => p.SoPhong === soPhong);

    if (selectedRoom) {
        const loai = loaiPhong.find(lp => lp.MaLoaiPhong === selectedRoom.MaLoaiPhong);
        displayRoomInfo(loai);
        updatePricePreview();
    }
}

function displayRoomInfo(loaiPhong) {
    const roomInfo = document.getElementById('room-info');
    const roomType = document.getElementById('selected-room-type');
    const roomPrice = document.getElementById('selected-room-price');

    if (roomInfo) roomInfo.style.display = 'flex';
    if (roomType) roomType.textContent = loaiPhong.LoaiPhong;
    if (roomPrice) roomPrice.textContent = formatCurrency(loaiPhong.DonGia);
}

function hideRoomInfo() {
    const roomInfo = document.getElementById('room-info');
    if (roomInfo) roomInfo.style.display = 'none';
    selectedRoom = null;
    updatePricePreview();
}

// ============= QUẢN LÝ KHÁCH =============
function addGuest() {
    if (guestCount >= maxGuests) {
        alert(`Chỉ được phép tối đa ${maxGuests} khách!`);
        return;
    }

    if (!selectedRoom) {
        alert('Vui lòng chọn phòng trước!');
        return;
    }

    guestCount++;
    const guestList = document.getElementById('guest-list');
    const loaiKhach = getLoaiKhach();

    const row = document.createElement('tr');
    row.innerHTML = `
        <td style="text-align: center;">${guestCount}</td>
        <td>
            <input type="text" class="guest-name" placeholder="Nhập tên khách hàng" required>
        </td>
        <td>
            <select class="guest-type" onchange="updatePricePreview()">
                ${loaiKhach.map(lk => `
                    <option value="${lk.MaLoaiKhach}">${lk.LoaiKhach}</option>
                `).join('')}
            </select>
        </td>
        <td>
            <input type="text" class="guest-id" placeholder="Nhập CMND" required>
        </td>
        <td>
            <input type="text" class="guest-address" placeholder="Nhập địa chỉ">
        </td>
        <td style="text-align: right; font-weight: 600; color: #1e293b;">
            <span class="guest-price">${formatCurrency(0)}</span>
        </td>
        <td style="text-align: center;">
            <button type="button" class="btn-delete" onclick="removeGuest(this)">Xóa</button>
        </td>
    `;

    guestList.appendChild(row);
    updateGuestCounter();
    updatePricePreview();

    // Disable nút thêm nếu đã đủ
    const addBtn = document.getElementById('add-guest-btn');
    if (guestCount >= maxGuests && addBtn) {
        addBtn.disabled = true;
    }
}

function addGuestWithData(data) {
    guestCount++;
    const guestList = document.getElementById('guest-list');
    const loaiKhach = getLoaiKhach();

    const row = document.createElement('tr');
    row.setAttribute('data-guest-id', data.maKhachHang || '');
    row.innerHTML = `
        <td style="text-align: center;">${guestCount}</td>
        <td>
            <input type="text" class="guest-name" placeholder="Nhập tên khách hàng" value="${data.name}" required>
        </td>
        <td>
            <select class="guest-type" onchange="updatePricePreview()">
                ${loaiKhach.map(lk => `
                    <option value="${lk.MaLoaiKhach}" ${lk.MaLoaiKhach === data.type ? 'selected' : ''}>
                        ${lk.LoaiKhach}
                    </option>
                `).join('')}
            </select>
        </td>
        <td>
            <input type="text" class="guest-id" placeholder="Nhập CMND" value="${data.cmnd}" required>
        </td>
        <td>
            <input type="text" class="guest-address" placeholder="Nhập địa chỉ" value="${data.address}">
        </td>
        <td style="text-align: right; font-weight: 600; color: #1e293b;">
            <span class="guest-price">${formatCurrency(0)}</span>
        </td>
        <td style="text-align: center;">
            <button type="button" class="btn-delete" onclick="removeGuest(this)">Xóa</button>
        </td>
    `;

    guestList.appendChild(row);
    updateGuestCounter();

    // Disable nút thêm nếu đã đủ
    const addBtn = document.getElementById('add-guest-btn');
    if (guestCount >= maxGuests && addBtn) {
        addBtn.disabled = true;
    }
}

function removeGuest(button) {
    const row = button.closest('tr');
    row.remove();
    guestCount--;

    // Cập nhật lại STT
    const rows = document.querySelectorAll('#guest-list tr');
    rows.forEach((row, index) => {
        row.cells[0].textContent = index + 1;
    });

    updateGuestCounter();
    updatePricePreview();

    // Enable nút thêm
    const addBtn = document.getElementById('add-guest-btn');
    if (addBtn) addBtn.disabled = false;
}

function updateGuestCounter() {
    const currentCount = document.getElementById('current-count');
    if (currentCount) currentCount.textContent = guestCount;
}

// ============= TÍNH TIỀN =============
function calculateGuestPrice(thuTuKhach, maLoaiKhach) {
    if (!selectedRoom) return 0;

    const loaiPhong = getLoaiPhong();
    const tiLePhuThu = getTiLePhuThu();
    const loaiKhach = getLoaiKhach();

    const loai = loaiPhong.find(lp => lp.MaLoaiPhong === selectedRoom.MaLoaiPhong);
    const donGiaPhong = loai ? loai.DonGia : 0;

    const phuThu = tiLePhuThu.find(pt => pt.ThuTuKhach === thuTuKhach);
    const heSoKhach = phuThu ? phuThu.HeSoPhuThu : 1.0;

    const loaiKH = loaiKhach.find(lk => lk.MaLoaiKhach === parseInt(maLoaiKhach));
    const heSoLoaiKhach = loaiKH ? loaiKH.HeSoPhuThu : 1.0;

    return donGiaPhong * heSoKhach * heSoLoaiKhach;
}

function updatePricePreview() {
    if (!selectedRoom) {
        document.getElementById('total-per-day').textContent = '0 VNĐ';
        return;
    }

    const rows = document.querySelectorAll('#guest-list tr');
    let totalPerDay = 0;

    rows.forEach((row, index) => {
        const thuTuKhach = index + 1;
        const guestTypeSelect = row.querySelector('.guest-type');
        const maLoaiKhach = guestTypeSelect ? guestTypeSelect.value : 1;

        const guestPrice = calculateGuestPrice(thuTuKhach, maLoaiKhach);

        const priceCell = row.querySelector('.guest-price');
        if (priceCell) {
            priceCell.textContent = formatCurrency(guestPrice);
        }

        totalPerDay += guestPrice;
    });

    const totalElement = document.getElementById('total-per-day');
    if (totalElement) {
        totalElement.textContent = formatCurrency(totalPerDay) + ' VNĐ';
    }
}

// ============= LƯU PHIẾU THUÊ =============
function saveBooking() {
    if (!validateForm()) return;

    const formDate = getISODate(document.getElementById('form-date'));
    const startDate = getISODate(document.getElementById('start-date'));

    if (!formDate || !startDate) {
        alert('Vui lòng nhập đầy đủ ngày lập và ngày bắt đầu thuê!');
        return;
    }

    if (!selectedRoom) {
        alert('Vui lòng chọn phòng!');
        return;
    }

    if (guestCount === 0) {
        alert('Vui lòng thêm ít nhất 1 khách hàng!');
        return;
    }

    const guests = collectGuestData();
    if (!guests) return;

    if (currentMode === 'edit') {
        updateBooking(formDate, startDate, guests);
    } else {
        createBooking(formDate, startDate, guests);
    }
}

function createBooking(formDate, startDate, guests) {
    const khachHang = getKhachHang();
    const thuePhong = getThuePhong();
    const ctThuePhong = getCTThuePhong();

    const maThuePhong = getNextId('THUEPHONG');

    const savedGuestIds = [];
    guests.forEach(guest => {
        const maKhachHang = getNextId('KHACHHANG');

        khachHang.push({
            MaKhachHang: maKhachHang,
            TenKhachHang: guest.name,
            MaLoaiKhach: guest.type,
            CMND: guest.cmnd,
            DiaChi: guest.address || ''
        });

        savedGuestIds.push({
            maKhachHang: maKhachHang,
            thuTuKhach: guest.order
        });
    });

    thuePhong.push({
        MaThuePhong: maThuePhong,
        SoPhong: selectedRoom.SoPhong,
        NgayLap: formDate,
        NgayBatDauThue: startDate,
        NgayTraPhong: null,
        SoNgayThue: null,
        ThanhTien: null
    });

    savedGuestIds.forEach(guest => {
        const maChiTiet = getNextId('CTTHUEPHONG');
        ctThuePhong.push({
            MaChiTiet: maChiTiet,
            MaKhachHang: guest.maKhachHang,
            MaThuePhong: maThuePhong,
            ThuTuKhach: guest.thuTuKhach
        });
    });

    updateTinhTrangPhong(selectedRoom.SoPhong, 'Đang thuê');

    saveKhachHang(khachHang);
    saveThuePhong(thuePhong);
    saveCTThuePhong(ctThuePhong);

    alert('Lưu phiếu thuê thành công!');
    window.location.href = 'booking-list-v3.html';
}

function updateBooking(formDate, startDate, guests) {
    const khachHang = getKhachHang();
    const thuePhong = getThuePhong();
    const ctThuePhong = getCTThuePhong();

    // Cập nhật phiếu thuê
    const bookingIndex = thuePhong.findIndex(tp => tp.MaThuePhong === currentBookingId);
    if (bookingIndex !== -1) {
        thuePhong[bookingIndex].NgayLap = formDate;
        thuePhong[bookingIndex].NgayBatDauThue = startDate;
        thuePhong[bookingIndex].SoPhong = selectedRoom.SoPhong;
    }

    // Xóa chi tiết cũ
    const updatedCTThuePhong = ctThuePhong.filter(ct => ct.MaThuePhong !== currentBookingId);

    // Cập nhật khách hàng và tạo chi tiết mới
    guests.forEach(guest => {
        let maKhachHang = guest.maKhachHang;

        if (maKhachHang) {
            // Cập nhật khách cũ
            const khachIndex = khachHang.findIndex(kh => kh.MaKhachHang === maKhachHang);
            if (khachIndex !== -1) {
                khachHang[khachIndex].TenKhachHang = guest.name;
                khachHang[khachIndex].MaLoaiKhach = guest.type;
                khachHang[khachIndex].CMND = guest.cmnd;
                khachHang[khachIndex].DiaChi = guest.address || '';
            }
        } else {
            // Thêm khách mới
            maKhachHang = getNextId('KHACHHANG');
            khachHang.push({
                MaKhachHang: maKhachHang,
                TenKhachHang: guest.name,
                MaLoaiKhach: guest.type,
                CMND: guest.cmnd,
                DiaChi: guest.address || ''
            });
        }

        // Tạo chi tiết mới
        const maChiTiet = getNextId('CTTHUEPHONG');
        updatedCTThuePhong.push({
            MaChiTiet: maChiTiet,
            MaKhachHang: maKhachHang,
            MaThuePhong: currentBookingId,
            ThuTuKhach: guest.order
        });
    });

    saveKhachHang(khachHang);
    saveThuePhong(thuePhong);
    saveCTThuePhong(updatedCTThuePhong);

    alert('Cập nhật phiếu thuê thành công!');
    window.location.href = 'booking-list-v3.html';
}

function validateForm() {
    const rows = document.querySelectorAll('#guest-list tr');

    for (let row of rows) {
        const name = row.querySelector('.guest-name').value.trim();
        const cmnd = row.querySelector('.guest-id').value.trim();

        if (!name) {
            alert('Vui lòng nhập tên khách hàng!');
            row.querySelector('.guest-name').focus();
            return false;
        }

        if (!cmnd) {
            alert('Vui lòng nhập CMND!');
            row.querySelector('.guest-id').focus();
            return false;
        }
    }

    return true;
}

function collectGuestData() {
    const rows = document.querySelectorAll('#guest-list tr');
    const guests = [];

    rows.forEach((row, index) => {
        const name = row.querySelector('.guest-name').value.trim();
        const type = parseInt(row.querySelector('.guest-type').value);
        const cmnd = row.querySelector('.guest-id').value.trim();
        const address = row.querySelector('.guest-address').value.trim();
        const maKhachHang = row.getAttribute('data-guest-id');

        guests.push({
            order: index + 1,
            name: name,
            type: type,
            cmnd: cmnd,
            address: address,
            maKhachHang: maKhachHang ? parseInt(maKhachHang) : null
        });
    });

    return guests;
}

// ============= HỦY FORM =============
function cancelForm() {
    if (confirm('Bạn có chắc muốn hủy? Dữ liệu chưa lưu sẽ mất.')) {
        window.location.href = 'booking-list-v3.html';
    }
}

// ============= IN PHIẾU =============
function printForm() {
    window.print();
}

// ============= HELPER =============
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount);
}
