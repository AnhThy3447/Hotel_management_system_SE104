let rooms = [];
let roomTypes = [];

const API_ROOMS = 'http://localhost:3000/api/rooms';
const API_TYPES = 'http://localhost:3000/api/room-types';

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    renderRooms();
    renderRoomTypes();
    updateCounts();
    setupSearch();
});

async function loadData() {
    try {
        const [roomsRes, typesRes] = await Promise.all([
            fetch(API_ROOMS),
            fetch(API_TYPES)
        ]);

        rooms = await roomsRes.json();
        roomTypes = await typesRes.json();
    } catch (err) {
        console.error(err);
        alert('Lỗi kết nối server');
    }
}

function renderRooms(data = rooms) {
    const tbody = document.querySelector('#rooms-tab tbody');

    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    Chưa có phòng nào
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = data.map(room => `
        <tr>
            <td>${room.roomCode}</td>
            <td>${room.roomName}</td>
            <td>${getRoomTypeName(room.roomType)}</td>
            <td>${room.floor}</td>
            <td>${Number(room.price).toLocaleString()} VNĐ</td>
            <td>${renderStatus(room.status)}</td>
            <td>
                <button class="btn-action btn-delete" onclick="deleteRoom('${room.roomCode}')">
                    Xóa
                </button>
            </td>
        </tr>
    `).join('');
}

function renderRoomTypes() {
    const tbody = document.getElementById('room-types-table');

    if (!tbody) return;

    if (roomTypes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    Chưa có loại phòng nào
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = roomTypes.map(type => `
        <tr>
            <td>${type.typeCode}</td>
            <td>${type.typeName}</td>
            <td>${Number(type.price).toLocaleString()} VNĐ</td>
            <td>${type.capacity || '-'}</td>
            <td>${type.area || '-'} m²</td>
            <td>${type.beds || '-'}</td>
            <td>
                <button class="btn-action btn-delete" onclick="deleteRoomType('${type.typeCode}')">
                    Xóa
                </button>
            </td>
        </tr>
    `).join('');
}

async function deleteRoom(code) {
    if (!confirm(`Xóa phòng ${code}?`)) return;

    try {
        await fetch(`${API_ROOMS}/${code}`, {
            method: 'DELETE'
        });

        rooms = rooms.filter(r => r.roomCode !== code);
        renderRooms();
        updateCounts();
    } catch (err) {
        console.error(err);
        alert('Xóa thất bại');
    }
}

async function deleteRoomType(code) {
    if (!confirm(`Xóa loại phòng ${code}?`)) return;

    try {
        await fetch(`${API_TYPES}/${code}`, {
            method: 'DELETE'
        });

        roomTypes = roomTypes.filter(t => t.typeCode !== code);
        renderRoomTypes();
        updateCounts();
    } catch (err) {
        console.error(err);
        alert('Xóa thất bại');
    }
}

function setupSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;

    input.addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();

        const filtered = rooms.filter(room =>
            room.roomCode.toLowerCase().includes(keyword) ||
            room.roomName.toLowerCase().includes(keyword)
        );

        renderRooms(filtered);
    });
}

function getRoomTypeName(code) {
    const type = roomTypes.find(t => t.typeCode === code);
    return type ? type.typeName : code;
}

function renderStatus(status) {
    if (status === 'available') {
        return '<span class="badge badge-available">Trống</span>';
    }
    if (status === 'occupied') {
        return '<span class="badge badge-occupied">Đang thuê</span>';
    }
    return '<span class="badge badge-maintenance">Dọn dẹp</span>';
}

function updateCounts() {
    const roomCount = document.getElementById('total-rooms');
    const typeCount = document.getElementById('total-types');

    if (roomCount) roomCount.textContent = rooms.length;
    if (typeCount) typeCount.textContent = roomTypes.length;
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    if (tab === 'rooms') {
        document.querySelector('.tab-btn:first-child').classList.add('active');
        document.getElementById('rooms-tab').classList.add('active');
    } else {
        document.querySelector('.tab-btn:last-child').classList.add('active');
        document.getElementById('room-types-tab').classList.add('active');
    }
}
