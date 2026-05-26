const API_URL =
'https://hotel-management-system-se104.onrender.com/api/phong';

let rooms = [];
let roomTypes = [];

// ======================================================
// INIT
// ======================================================

document.addEventListener('DOMContentLoaded', () => {

    loadRooms();

    loadRoomTypes();
});

// ======================================================
// LOAD ROOMS
// ======================================================

async function loadRooms() {

    try {

        const res =
        await fetch(`${API_URL}/danh-sach`);

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();

        rooms = json.data || [];

        renderRooms();

    } catch (err) {

        console.error(err);
    }
}

// ======================================================
// LOAD ROOM TYPES
// ======================================================

async function loadRoomTypes() {

    try {

        const res =
        await fetch(`${API_URL}/loai-phong`);

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();

        roomTypes = json.data || [];

        renderRoomTypes();

    } catch (err) {

        console.error(err);
    }
}

// ======================================================
// RENDER ROOMS
// ======================================================

function renderRooms() {

    const tbody =
    document.getElementById('roomTableBody');

    if (!tbody) return;

    tbody.innerHTML = '';

    rooms.forEach((room, index) => {

        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>

                <td>
                    <a href="room-detail.html?id=${room.sophong}">
                        ${room.sophong}
                    </a>
                </td>

                <td>${room.loaiphong}</td>

                <td>
                    ${formatCurrency(room.dongia)}
                </td>

                <td>${room.tinhtrang}</td>

                <td>${room.ghichu || ''}</td>
            </tr>
        `;
    });
}

// ======================================================
// RENDER ROOM TYPES
// ======================================================

function renderRoomTypes() {

    const tbody =
    document.getElementById('room-types-table');

    if (!tbody) return;

    tbody.innerHTML = '';

    roomTypes.forEach((type, index) => {

        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>

                <td>${type.maloaiphong}</td>

                <td>${type.loaiphong}</td>

                <td>
                    ${formatCurrency(type.dongia)}
                </td>
            </tr>
        `;
    });
}

// ======================================================
// FORMAT
// ======================================================

function formatCurrency(number) {

    return new Intl.NumberFormat('vi-VN')
    .format(number || 0) + ' VNĐ';
}

// ======================================================
// HÀM CHUYỂN ĐỔI TAB (BỔ SUNG CHO HTML)
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

    // 3. Hiển thị tab được chọn và kích hoạt nút tương ứng
    if (tabName === 'rooms') {
        document.getElementById('rooms-tab').classList.add('active');
        // Tìm nút có onclick chứa 'rooms' để thêm class active
        document.querySelector("button[onclick*='rooms']").classList.add('active');
    } else if (tabName === 'room-types') {
        document.getElementById('room-types-tab').classList.add('active');
        // Tìm nút có onclick chứa 'room-types' để thêm class active
        document.querySelector("button[onclick*='room-types']").classList.add('active');
    }
}

// Đăng ký hàm ra phạm vi toàn cục (window) để thuộc tính onclick ngoài HTML gọi được
window.switchTab = switchTab;


// ======================================================
// CẬP NHẬT LẠI CÁC HÀM RENDER ĐỂ HIỂN THỊ TỔNG SỐ LƯỢNG
// ======================================================

// Bạn tìm đến hàm renderRooms() cũ trong file và cập nhật thêm dòng đếm số lượng này:
function renderRooms() {
    const tbody = document.getElementById('roomTableBody');
    if (!tbody) return;

    // Cập nhật tổng số lượng phòng lên giao diện
    const totalRoomsEl = document.getElementById('totalRooms');
    if (totalRoomsEl) totalRoomsEl.textContent = rooms.length;

    tbody.innerHTML = '';
    rooms.forEach((room, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <a href="room-detail.html?id=${room.sophong}">
                        ${room.sophong}
                    </a>
                </td>
                <td>${room.loaiphong}</td>
                <td>${formatCurrency(room.dongia)}</td>
                <td>${room.tinhtrang}</td>
                <td>${room.ghichu || ''}</td>
                <td>
                     <button class="btn-secondary" onclick="location.href='edit-room.html?id=${room.sophong}'">Sửa</button>
                </td>
            </tr>
        `;
    });
}

// Bạn tìm đến hàm renderRoomTypes() cũ trong file và cập nhật thêm dòng đếm số lượng này:
function renderRoomTypes() {
    const tbody = document.getElementById('room-types-table');
    if (!tbody) return;

    // Cập nhật tổng số lượng loại phòng lên giao diện
    const totalTypesEl = document.getElementById('total-types');
    if (totalTypesEl) totalTypesEl.textContent = roomTypes.length;

    tbody.innerHTML = '';
    roomTypes.forEach((type, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${type.maloaiphong}</td>
                <td>${type.loaiphong}</td>
                <td>${formatCurrency(type.dongia)}</td>
                <td>
                     <button class="btn-secondary" onclick="location.href='edit-room-type.html?id=${type.maloaiphong}'">Sửa</button>
                </td>
            </tr>
        `;
    });
}