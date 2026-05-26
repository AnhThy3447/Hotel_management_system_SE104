const API_URL =
'https://hotel-management-system-se104.onrender.com/api/phong';

document.addEventListener('DOMContentLoaded', () => {
    loadRoomDetail();
});

// ======================================================
// LOAD ROOM DETAIL
// ======================================================

async function loadRoomDetail() {

    const params =
        new URLSearchParams(window.location.search);

    const id = params.get('id');

    if (!id) return;

    try {

        const response =
            await fetch(`${API_URL}/chi-tiet/${id}`);

        const json =
            await response.json();

        const room =
            json.data;

        document.getElementById('roomTitle')
            .textContent = `Phòng ${room.sophong}`;

        document.getElementById('id')
            .textContent = room.sophong;

        document.getElementById('type')
            .textContent = room.loaiphong;

        document.getElementById('price')
            .textContent =
            formatCurrency(room.dongia);

        document.getElementById('notes')
            .textContent =
            room.ghichu || 'Không có';

        document.getElementById('roomStatus')
            .textContent =
            room.tinhtrang;

    } catch (err) {

        console.error(err);
    }
}

function formatCurrency(number) {

    return new Intl.NumberFormat('vi-VN')
    .format(number || 0) + ' VNĐ';
}