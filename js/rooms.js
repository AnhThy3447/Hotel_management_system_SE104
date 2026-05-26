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

                <td>${room.sophong}</td>

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