const API_URL = 'https://hotel-management-system-se104.onrender.com/api';
let currentBooking = null;
let guests = [];
let isViewMode = false;
let allRooms = [];
let thamSo = { soKhachToiDa: 3, khachIncluded: 2 };
let tiLePhuThu = [];
let foreignExtraRate = 0.5;

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
        initNewBookingForm();
    }
});

const MAX_START_DAYS_FROM_FORM = 30;

function initNewBookingForm() {
    const formDateInput = document.getElementById('form-date');
    const startDateInput = document.getElementById('start-date');

    setDateValue(formDateInput, getTodayISO());
    lockFormDateToToday(formDateInput);

    updateStartDateLimits();
    setDateValue(startDateInput, getISODate(formDateInput) || getTodayISO());

    startDateInput.dataset.lastValidDate = getISODate(formDateInput) || getTodayISO();
    startDateInput.addEventListener('blur', validateStartDateOnBlur);

    addGuest();
}

function formatIsoToVN(iso) {
    if (!iso) return '';
    const p = iso.split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso;
}

function lockFormDateToToday(input) {
    input.readOnly = true;
    input.title = 'Ngày lập luôn là ngày hôm nay';
    input.addEventListener('keydown', (e) => e.preventDefault());
    input.addEventListener('paste', (e) => e.preventDefault());
    input.addEventListener('input', () => setDateValue(input, getTodayISO()));
}

function addDaysToISO(isoDate, days) {
    const [y, m, d] = isoDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
}

function updateStartDateLimits() {
    const formDateInput = document.getElementById('form-date');
    const startDateInput = document.getElementById('start-date');
    let formIso = getISODate(formDateInput);

    if (!currentBooking) {
        setDateValue(formDateInput, getTodayISO());
        formIso = getTodayISO();
    } else if (!formIso && formDateInput.value) {
        validateAndConvertDate(formDateInput);
        formIso = getISODate(formDateInput);
    }
    if (!formIso) {
        formIso = getTodayISO();
        setDateValue(formDateInput, formIso);
    }

    const maxIso = addDaysToISO(formIso, MAX_START_DAYS_FROM_FORM);
    startDateInput.dataset.minDate = formIso;
    startDateInput.dataset.maxDate = maxIso;

    const currentIso = getISODate(startDateInput) || convertToISO(startDateInput.value);
    if (currentIso && currentIso >= formIso && currentIso <= maxIso) {
        startDateInput.dataset.lastValidDate = currentIso;
    }
}

function isStartDateInRange(startIso, minIso, maxIso) {
    return startIso && minIso && maxIso && startIso >= minIso && startIso <= maxIso;
}

function getStartDateRangeMessage(minIso, maxIso) {
    return `Chỉ được chọn từ ${formatIsoToVN(minIso)} đến ${formatIsoToVN(maxIso)} (tối đa ${MAX_START_DAYS_FROM_FORM} ngày kể từ ngày lập).`;
}

function validateStartDateOnBlur() {
    const startDateInput = document.getElementById('start-date');
    const minIso = startDateInput.dataset.minDate;
    const maxIso = startDateInput.dataset.maxDate;
    if (!minIso || !maxIso || !startDateInput.value.trim()) return;

    validateAndConvertDate(startDateInput);
    const startIso = getISODate(startDateInput);
    if (!startIso) return;

    if (isStartDateInRange(startIso, minIso, maxIso)) {
        startDateInput.dataset.lastValidDate = startIso;
        return;
    }

    alert(`Ngày bắt đầu thuê không hợp lệ. ${getStartDateRangeMessage(minIso, maxIso)}`);

    const lastValid = startDateInput.dataset.lastValidDate;
    if (lastValid) {
        setDateValue(startDateInput, lastValid);
    } else {
        startDateInput.value = '';
        startDateInput.removeAttribute('data-iso-date');
    }
}

function validateStartDateRange() {
    const startDateInput = document.getElementById('start-date');
    const minIso = startDateInput.dataset.minDate;
    const maxIso = startDateInput.dataset.maxDate;
    const startIso = getISODate(startDateInput) || convertToISO(startDateInput.value);

    if (!startIso || !minIso || !maxIso) {
        alert('Vui lòng chọn ngày bắt đầu thuê hợp lệ!');
        return false;
    }
    if (!isStartDateInRange(startIso, minIso, maxIso)) {
        alert(`Ngày bắt đầu thuê không hợp lệ. ${getStartDateRangeMessage(minIso, maxIso)}`);
        startDateInput.focus();
        return false;
    }
    return true;
}

function normalizeRoomFields(room) {
    return {
        id: room.id ?? room.sophong ?? room.SoPhong,
        typeName: room.typeName || room.typename || room.loaiphong || 'N/A',
        price: Number(room.price ?? room.dongia ?? 0),
        status: room.status || room.tinhtrang || ''
    };
}

function formatRoomOptionText(room) {
    const r = normalizeRoomFields(room);
    return `Phòng ${r.id} — ${r.typeName} — ${formatCurrency(r.price)} VNĐ/ngày`;
}

function buildRoomSelectOptions(rooms, placeholder) {
    return `<option value="">${placeholder}</option>` +
        rooms.map(room => {
            const r = normalizeRoomFields(room);
            return `<option value="${r.id}">${formatRoomOptionText(room)}</option>`;
        }).join('');
}

async function loadRooms() {
    try {
        const res = await fetch(`${API_URL}/phong`);
        if (!res.ok) throw new Error('Không thể tải danh sách phòng');

        const data = await res.json();
        const select = document.getElementById('room-select');
        if (!select) return;

        const rawRooms = Array.isArray(data) ? data : (data.data || []);
        allRooms = rawRooms.map(r => ({ ...r, ...normalizeRoomFields(r) }));

        const availableRooms = allRooms.filter(room =>
            (room.status || '').trim().toLowerCase() === 'trống'
        );

        select.innerHTML = buildRoomSelectOptions(availableRooms, '-- Chọn phòng trống --');
    } catch (err) {
        console.error('Lỗi load phòng:', err);
        alert('Không thể tải danh sách phòng. Vui lòng kiểm tra console (F12).');
    }
}

async function loadThamSo() {
    try {
        const res = await fetch(`${API_URL}/quy-dinh/thamso`);
        const json = await res.json();
        const data = json.data || [];
        const soKhach = data.find(t => t.tenthamso === 'SoKhachToiDa');
        if (soKhach) thamSo.soKhachToiDa = parseInt(soKhach.giatri) || 3;
        const ruleEl = document.getElementById('max-guests-rule');
        if (ruleEl) ruleEl.textContent = thamSo.soKhachToiDa;

        const soKhachMienPhi = data.find(t =>
            t.tenthamso === 'SoKhachKhongTinhPhi' || t.tenthamso === 'Số khách không tính phí phụ thu'
        );
        if (soKhachMienPhi) thamSo.khachIncluded = parseInt(soKhachMienPhi.giatri) || 2;

        const resPT = await fetch(`${API_URL}/quy-dinh/phu-thu`);
        const jsonPT = await resPT.json();
        tiLePhuThu = normalizePhuThu(jsonPT.data || []);

        const resLK = await fetch(`${API_URL}/quy-dinh/loai-khach`);
        const jsonLK = await resLK.json();
        const lkRows = jsonLK.data || [];
        const nn = lkRows.find(l =>
            (l.name || l.LoaiKhach || '').toLowerCase().includes('nước ngoài')
        );
        if (nn) {
            const heSo = parseFloat(nn.surcharge ?? nn.HeSoPhuThu) || 1.5;
            foreignExtraRate = Math.max(0, heSo - 1);
        }
    } catch (err) {
        console.error('Lỗi load tham số:', err);
    }
}

function pricingOptions() {
    return { khachIncluded: thamSo.khachIncluded ?? 2, foreignExtraRate };
}

function onRoomChange() {
    const select = document.getElementById('room-select');
    const sophong = select.value;
    const room = allRooms.find(p => String(p.id) === String(sophong));

    if (room) {
        document.getElementById('room-info').style.display = 'flex';
        document.getElementById('selected-room-type').textContent = room.typeName || 'N/A';
        document.getElementById('selected-room-price').textContent = formatCurrency(room.price) + ' VNĐ';
        document.getElementById('max-guests-display').textContent = thamSo.soKhachToiDa;
        document.getElementById('max-guests').textContent = thamSo.soKhachToiDa;
        document.getElementById('max-count').textContent = thamSo.soKhachToiDa;
        const ruleEl = document.getElementById('max-guests-rule');
        if (ruleEl) ruleEl.textContent = thamSo.soKhachToiDa;
    } else {
        document.getElementById('room-info').style.display = 'none';
    }
    renderGuests();
    updatePricePreview();
}

function updatePricePreview() {
    const sophong = document.getElementById('room-select').value;
    const room = allRooms.find(p => String(p.id) === String(sophong));
    if (!room || guests.length === 0) {
        document.getElementById('price-preview').style.display = 'none';
        return;
    }

    document.getElementById('price-preview').style.display = 'block';
    const total = calcRoomPricePerDay(guests, room.price, tiLePhuThu, pricingOptions());
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
        const formDateInput = document.getElementById('form-date');
        formDateInput.readOnly = false;
        setDateValue(formDateInput, currentBooking?.ngaylap?.split('T')[0] || '');
        setDateValue(document.getElementById('start-date'), currentBooking?.ngaybatdauthue?.split('T')[0] || '');
        updateStartDateLimits();

        const startDateInput = document.getElementById('start-date');
        startDateInput.dataset.lastValidDate =
            getISODate(startDateInput) || currentBooking?.ngaybatdauthue?.split('T')[0] || '';
        formDateInput.addEventListener('blur', updateStartDateLimits);
        startDateInput.addEventListener('blur', validateStartDateOnBlur);

        const bookedRoom = {
            id: currentBooking?.sophong,
            typeName: currentBooking?.loaiphong,
            price: currentBooking?.dongia,
            status: 'Đang thuê'
        };
        if (!allRooms.some(r => String(r.id) === String(bookedRoom.id))) {
            allRooms.push({ ...bookedRoom, ...normalizeRoomFields(bookedRoom) });
        }

        const select = document.getElementById('room-select');
        const existingOptions = buildRoomSelectOptions(
            allRooms.filter(r =>
                String(r.id) === String(bookedRoom.id) ||
                (r.status || '').trim().toLowerCase() === 'trống'
            ),
            '-- Chọn phòng --'
        );
        select.innerHTML = existingOptions;
        select.value = currentBooking?.sophong;
        onRoomChange();

        guests = chitiet.map(ct => ({
            name: ct.tenkhachhang || '',
            type: ct.loaikhach === 'Nước ngoài' ? 'nước ngoài' : 'nội địa',
            idNumber: ct.cmnd || '',
            address: ct.diachi || '',
            makhachhang: ct.makhachhang,
        }));

        renderGuests();

        if (isViewMode) {
            document.querySelectorAll('input, select, button:not(.btn-back):not(#print-btn):not(.btn-secondary)').forEach(el => {
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
            <td style="text-align:right">${calcGuestPrice(index)}</td>
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
    renderGuests();
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
    if (!currentBooking) {
        const formDateInput = document.getElementById('form-date');
        const ngayLapIso = getISODate(formDateInput) || convertToISO(formDate);
        if (ngayLapIso !== getTodayISO()) {
            alert('Ngày lập phải là ngày hôm nay và không được thay đổi.');
            setDateValue(formDateInput, getTodayISO());
            updateStartDateLimits();
            return false;
        }
    }
    if (!validateStartDateRange()) return false;
    for (let i = 0; i < guests.length; i++) {
        if (!guests[i].name || !guests[i].idNumber) {
            alert(`Vui lòng điền đầy đủ thông tin cho khách hàng ${i + 1}!`);
            return false;
        }
    }
    return true;
}

function calcGuestPrice(index) {
    const sophong = document.getElementById('room-select').value;
    const room = allRooms.find(p => String(p.id) === String(sophong));
    if (!room) return formatGuestSurchargeCell(0, formatCurrency);
    const surcharge = calcGuestSurchargeForDay(
        index, guests[index], room.price, tiLePhuThu, pricingOptions()
    );
    return formatGuestSurchargeCell(surcharge, formatCurrency);
}

function convertToISO(ddmmyyyy) {
    if (!ddmmyyyy) return '';
    const parts = ddmmyyyy.split('/');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return ddmmyyyy;
}

// Hàm này được gọi từ HTML (onclick="saveBooking()")
async function saveBooking() {
    if (!validateForm()) return;

    const bookingData = {
        SoPhong: document.getElementById('room-select').value,
        NgayLap: convertToISO(document.getElementById('form-date').value),
        NgayBatDauThue: convertToISO(document.getElementById('start-date').value),
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
