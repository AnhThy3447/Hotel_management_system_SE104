// create-invoice.js - Lập hóa đơn thanh toán

const API_URL = 'https://hotel-management-system-se104.onrender.com/api';

let allBookings = [];
let allAgencies = [];
let customerDropdownApi = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();
    setDefaultDate();
    renderAvailableBookings();
    customerDropdownApi = initCustomerDropdown();
    initAgencyDropdown();
    setupCheckboxEvents();
    updateCustomerDropdownForSelection();
});

async function loadAllData() {
    try {
        const resBooking = await fetch(`${API_URL}/thue-phong`);
        const jsonBooking = await resBooking.json();
        allBookings = (jsonBooking.data || []).filter(b => b.ngaytrphong && !b.dahoadon && b.songaythue > 0);

        const resCQ = await fetch(`${API_URL}/co-quan`);
        const jsonCQ = await resCQ.json();
        allAgencies = jsonCQ.data || [];
    } catch (err) {
        console.error('Lỗi tải dữ liệu:', err);
    }
}

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('payment-date').value = today;
}

function formatGuestNames(booking) {
    const guests = booking.guests || [];
    if (guests.length === 0) return '—';
    return guests.map(g => g.name || '—').join(', ');
}

function renderAvailableBookings() {
    const tbody = document.getElementById('booking-list-body');

    if (allBookings.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">Không có phiếu thuê chờ thanh toán</td>
            </tr>`;
        return;
    }

    tbody.innerHTML = allBookings.map(booking => `
        <tr>
            <td>
                <input type="checkbox" class="booking-checkbox"
                    data-ma-thue-phong="${booking.mathuephong}"
                    data-thanh-tien="${booking.thanhtien || 0}">
            </td>
            <td>${booking.mathuephong}</td>
            <td>${booking.sophong || 'N/A'}</td>
            <td>${booking.loaiphong || '—'}</td>
            <td>${formatDateVN(booking.ngaybatdauthue?.split('T')[0])}</td>
            <td>${booking.songaythue || 0}</td>
            <td>${booking.dongia ? formatCurrency(booking.dongia) + ' VNĐ' : '—'}</td>
            <td>${formatGuestNames(booking)}</td>
            <td><strong>${formatCurrency(booking.thanhtien || 0)} VNĐ</strong></td>
        </tr>`
    ).join('');
}

function getSelectedBookingIds() {
    return [...document.querySelectorAll('.booking-checkbox:checked')]
        .map(cb => parseInt(cb.dataset.maThuePhong, 10));
}

function getGuestsFromSelectedBookings() {
    const selectedIds = getSelectedBookingIds();
    const guestMap = new Map();

    allBookings
        .filter(b => selectedIds.includes(b.mathuephong))
        .forEach(booking => {
            (booking.guests || []).forEach(g => {
                const id = g.makhachhang;
                if (id != null && !guestMap.has(id)) {
                    guestMap.set(id, g);
                }
            });
        });

    return [...guestMap.values()];
}

function updateCustomerDropdownForSelection() {
    const guests = getGuestsFromSelectedBookings();
    const searchInput = document.getElementById('customer-search');

    const items = guests.map(g => ({
        value: String(g.makhachhang),
        label: g.name || '(Không có tên)',
        subLabel: `CMND: ${g.idNumber || 'N/A'} • ${g.address || ''}`
    }));

    if (customerDropdownApi) {
        customerDropdownApi.updateItems(items);
    }

    if (items.length === 0) {
        searchInput.disabled = true;
        searchInput.placeholder = getSelectedBookingIds().length === 0
            ? 'Chọn phiếu thuê trước'
            : 'Phiếu đã chọn chưa có khách trong hệ thống';
        document.getElementById('customer-address').value = '';
    } else {
        searchInput.disabled = false;
        searchInput.placeholder = '-- Tìm theo tên hoặc CMND (khách trong phiếu đã chọn) --';
    }
}

function setupCheckboxEvents() {
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('booking-checkbox')) {
            calculateTotal();
            updateCustomerDropdownForSelection();
        }
    });
}

function calculateTotal() {
    const checkboxes = document.querySelectorAll('.booking-checkbox:checked');
    let total = 0;
    checkboxes.forEach(cb => { total += parseInt(cb.dataset.thanhTien, 10) || 0; });
    document.getElementById('invoice-total').textContent = formatCurrency(total) + ' VNĐ';
}

async function createInvoice() {
    const selected = document.querySelectorAll('.booking-checkbox:checked');
    if (selected.length === 0) { alert('Vui lòng chọn ít nhất một phiếu thuê!'); return; }

    const maKhachHang = document.getElementById('customer-select').value;
    if (!maKhachHang) { alert('Vui lòng chọn khách hàng thanh toán!'); return; }

    const allowedGuests = getGuestsFromSelectedBookings();
    if (allowedGuests.length === 0) {
        alert('Các phiếu đã chọn không có khách hàng trong danh sách thuê. Vui lòng kiểm tra lại phiếu thuê!');
        return;
    }
    const allowedIds = new Set(allowedGuests.map(g => String(g.makhachhang)));
    if (!allowedIds.has(String(maKhachHang))) {
        alert('Khách thanh toán phải là khách nằm trong danh sách thuê của các phiếu đã chọn!');
        return;
    }

    const paymentDate = document.getElementById('payment-date').value;
    if (!paymentDate) { alert('Vui lòng chọn ngày thanh toán!'); return; }

    const maCoQuan = document.getElementById('agency-select').value || null;

    let tongTien = 0;
    const danhSachPhieu = [];

    selected.forEach(cb => {
        const maThuePhong = parseInt(cb.dataset.maThuePhong, 10);
        const thanhTien = parseInt(cb.dataset.thanhTien, 10) || 0;
        tongTien += thanhTien;
        danhSachPhieu.push({
            MaThuePhong: maThuePhong,
            TriGia: thanhTien
        });
    });

    try {
        const res = await fetch(`${API_URL}/hoa-don`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                MaKhachHangThanhToan: parseInt(maKhachHang, 10),
                MaCoQuan: maCoQuan ? parseInt(maCoQuan, 10) : null,
                NgayThanhToan: paymentDate,
                TongTien: tongTien,
                DanhSachPhieu: danhSachPhieu
            })
        });

        const json = await res.json();
        if (json.success) {
            alert(`Tạo hóa đơn thành công!\nTổng tiền: ${formatCurrency(tongTien)} VNĐ`);
            window.location.href = 'invoice-list.html';
        } else {
            alert('Lỗi: ' + json.message);
        }
    } catch (err) {
        alert('Lỗi kết nối: ' + err.message);
    }
}

function initCustomerDropdown() {
    return createSearchableDropdown({
        searchInputId: 'customer-search',
        hiddenInputId: 'customer-select',
        listId: 'customer-list',
        items: [],
        placeholder: '-- Chọn khách hàng --',
        onSelect(value) {
            const addressInput = document.getElementById('customer-address');
            if (!value) { addressInput.value = ''; return; }
            const guest = getGuestsFromSelectedBookings().find(g => String(g.makhachhang) === String(value));
            addressInput.value = guest ? (guest.address || '') : '';
        }
    });
}

function initAgencyDropdown() {
    const items = allAgencies.map(cq => ({
        value: String(cq.macoquan),
        label: cq.tencoquan || '(Không có tên)',
        subLabel: cq.diachi || ''
    }));

    createSearchableDropdown({
        searchInputId: 'agency-search',
        hiddenInputId: 'agency-select',
        listId: 'agency-list',
        items,
        placeholder: '-- Không có cơ quan --',
        onSelect() {}
    });
}

function createSearchableDropdown({ searchInputId, hiddenInputId, listId, items, placeholder, onSelect }) {
    const searchInput = document.getElementById(searchInputId);
    const hiddenInput = document.getElementById(hiddenInputId);
    const listEl = document.getElementById(listId);

    let allItems = items;
    let selectedValue = '';

    function renderList(query) {
        const q = (query || '').toLowerCase().trim();
        const filtered = q
            ? allItems.filter(item =>
                item.label.toLowerCase().includes(q) ||
                (item.subLabel && item.subLabel.toLowerCase().includes(q)))
            : allItems;

        if (filtered.length === 0) {
            listEl.innerHTML = '<div class="dropdown-empty">Không tìm thấy kết quả</div>';
        } else {
            listEl.innerHTML = filtered.map(item => `
                <div class="dropdown-item${String(item.value) === String(selectedValue) ? ' selected' : ''}"
                    data-value="${item.value}">
                    <div>${item.label}</div>
                    ${item.subLabel ? `<div class="item-sub">${item.subLabel}</div>` : ''}
                </div>`).join('');
        }

        const clearItem = document.createElement('div');
        clearItem.className = 'dropdown-item' + (selectedValue === '' ? ' selected' : '');
        clearItem.dataset.value = '';
        clearItem.textContent = placeholder;
        listEl.insertBefore(clearItem, listEl.firstChild);

        listEl.querySelectorAll('.dropdown-item').forEach(el => {
            el.addEventListener('mousedown', (e) => {
                e.preventDefault();
                selectItem(el.dataset.value);
            });
        });
    }

    function selectItem(value) {
        selectedValue = value;
        hiddenInput.value = value;
        if (value === '') {
            searchInput.value = '';
        } else {
            const found = allItems.find(i => String(i.value) === String(value));
            searchInput.value = found ? found.label : '';
        }
        closeDropdown();
        if (onSelect) {
            const found = allItems.find(i => String(i.value) === String(value));
            onSelect(value, found || null);
        }
    }

    function openDropdown() {
        if (searchInput.disabled) return;
        renderList(searchInput.value);
        listEl.classList.add('open');
    }

    function closeDropdown() { listEl.classList.remove('open'); }

    function updateItems(newItems) {
        allItems = newItems;
        if (selectedValue && !newItems.some(i => String(i.value) === String(selectedValue))) {
            selectItem('');
            document.getElementById('customer-address').value = '';
        }
    }

    searchInput.addEventListener('focus', () => { searchInput.select(); openDropdown(); });
    searchInput.addEventListener('input', () => {
        selectedValue = '';
        hiddenInput.value = '';
        renderList(searchInput.value);
        if (!listEl.classList.contains('open')) listEl.classList.add('open');
    });
    searchInput.addEventListener('blur', () => { setTimeout(closeDropdown, 150); });

    return { updateItems, clearSelection: () => selectItem('') };
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
