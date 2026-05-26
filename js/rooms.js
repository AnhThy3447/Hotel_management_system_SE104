const API_URL = 'https://hotel-management-system-se104.onrender.com/api/phong';

let rooms = [];
let roomTypes = [];

// ======================================================
// KHỞI TẠO ỨNG DỤNG (INIT)
// ======================================================
document.addEventListener('DOMContentLoaded', () => {
    loadRooms();
    loadRoomTypes();
});

// ======================================================
// TẢI DANH SÁCH PHÒNG (LOAD ROOMS)
// ======================================================
async function loadRooms() {
    try {
        // Đã sửa: Gọi thẳng về gốc API_URL thay vì API_URL/danh-sach để tránh lỗi Cannot GET
        const res = await fetch(`${API_URL}`);

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();
        rooms = json.data || [];
        renderRooms();

    } catch (err) {
        console.error('Lỗi khi tải danh sách phòng:', err);
    }
}

// ======================================================
// TẢI DANH SÁCH LOẠI PHÒNG (LOAD ROOM TYPES)
// ======================================================
async function loadRoomTypes() {
    try {
        const res = await fetch(`${API_URL}/loai-phong`);

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();
        roomTypes = json.data || [];
        renderRoomTypes();

    } catch (err) {
        console.error('Lỗi khi tải danh sách loại phòng:', err);
    }
}

// ======================================================
// HIỂN THỊ DANH SÁCH PHÒNG (RENDER ROOMS)
// ======================================================
function renderRooms() {
    const tbody = document.getElementById('roomTableBody');
    if (!tbody) return;

    // Cập nhật tổng số lượng phòng lên giao diện HTML
    const totalRoomsEl = document.getElementById('totalRooms');
    if (totalRoomsEl) totalRoomsEl.textContent = rooms.length;

    tbody.innerHTML = '';

    if (rooms.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: #888;">Không có dữ liệu phòng</td></tr>`;
        return;
    }

    rooms.forEach((room, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <a href="room-detail.html?id=${room.sophong}" style="font-weight: bold; color: #8b5e3c;">
                        Phòng ${room.sophong}
                    </a>
                </td>
                <td>Loại ${room.loaiphong}</td>
                <td>${formatCurrency(room.dongia)}</td>
                <td>
                    <span class="status-badge ${room.tinhtrang === 'Trống' ? 'available' : room.tinhtrang === 'Đang thuê' ? 'occupied' : 'maintenance'}">
                        ${room.tinhtrang}
                    </span>
                </td>
                <td>${room.ghichu || ''}</td>
                <td>
                     <button class="btn-secondary" onclick="location.href='rooms-form.html?id=${room.sophong}'">Sửa</button>
                </td>
            </tr>
        `;
    });
}

// ======================================================
// HIỂN THỊ DANH SÁCH LOẠI PHÒNG (RENDER ROOM TYPES)
// ======================================================
function renderRoomTypes() {
    const tbody = document.getElementById('room-types-table');
    if (!tbody) return;

    // Cập nhật tổng số lượng loại phòng lên giao diện HTML
    const totalTypesEl = document.getElementById('total-types');
    if (totalTypesEl) totalTypesEl.textContent = roomTypes.length;

    tbody.innerHTML = '';

    if (roomTypes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: #888;">Không có dữ liệu loại phòng</td></tr>`;
        return;
    }

    roomTypes.forEach((type, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td><strong>LP0${type.maloaiphong}</strong></td>
                <td>Phòng tiêu chuẩn (Loại ${type.loaiphong})</td>
                <td>${formatCurrency(type.dongia)}</td>
                <td>
                     <button class="btn-secondary" onclick="location.href='room-type-form.html?id=${type.maloaiphong}'">Sửa</button>
                </td>
            </tr>
        `;
    });
}

// ======================================================
// CHUYỂN ĐỔI GIAO DIỆN TAB (SWITCH TAB)
// ======================================================
function switchTab(tabName) {
    // 1. Ẩn tất cả các nội dung tab
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // 2. Gỡ bỏ trạng thái active của tất cả các nút tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // 3. Hiển thị tab được chọn và kích hoạt nút tương ứng công khai
    if (tabName === 'rooms') {
        document.getElementById('rooms-tab').classList.add('active');
        document.querySelector("button[onclick*='rooms']").classList.add('active');
    } else if (tabName === 'room-types') {
        document.getElementById('room-types-tab').classList.add('active');
        document.querySelector("button[onclick*='room-types']").classList.add('active');
    }
}

// ======================================================
// ĐỊNH DẠNG TIỀN TỆ (FORMAT CURRENCY)
// ======================================================
function formatCurrency(number) {
    return new Intl.NumberFormat('vi-VN').format(number || 0) + ' VNĐ';
}

// Đăng ký hàm switchTab ra phạm vi toàn cục (window) để thuộc tính onclick ngoài HTML gọi được
window.switchTab = switchTab;