// ==========================
// LOAD DATA
// ==========================
let rooms = JSON.parse(localStorage.getItem('rooms')) || [];
let currentRoom = null;

// ==========================
// INIT
// ==========================
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('id');

    if (!roomId) {
        alert("Không có mã phòng!");
        window.location.href = "rooms.html";
        return;
    }

    currentRoom = rooms.find(r => r.id === roomId);

    if (!currentRoom) {
        alert("Không tìm thấy phòng!");
        window.location.href = "rooms.html";
        return;
    }

    fillForm(currentRoom);
});

// ==========================
// FILL FORM
// ==========================
function fillForm(room) {
    document.getElementById('roomCode').value = room.id || '';
    document.getElementById('roomName').value = room.name || '';
    const typeSelect = document.getElementById('roomType');
    const mapType = {
        "Phòng tiêu chuẩn": "standard",
        "Phòng cao cấp": "deluxe",
        "Phòng hạng sang": "suite"
    };
    typeSelect.value = mapType[room.type] || room.type || '';
    document.getElementById('price').value = room.price || '';
    document.getElementById('status').value = room.status || 'available';
    document.getElementById('notes').value = room.notes || '';
}

// ==========================
// AUTO PRICE
// ==========================
function updatePrice() {
    const type = document.getElementById('roomType').value;

    const prices = {
        standard: 150000,
        deluxe: 170000,
        suite: 200000
    };

    if (prices[type]) {
        document.getElementById('price').value = prices[type];
    }
}

// ==========================
// SUBMIT UPDATE
// ==========================
function handleSubmit(event) {
    event.preventDefault();

    const data = {
        id: document.getElementById('roomCode').value.trim(),
        name: document.getElementById('roomName').value.trim(),
        type: document.getElementById('roomType').value,
        price: Number(document.getElementById('price').value),
        status: document.getElementById('status').value,
        notes: document.getElementById('notes').value.trim()
        
    };

    // validate
    if (!data.id || !data.name || !data.type) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    const index = rooms.findIndex(r => r.id === currentRoom.id);

    if (index === -1) {
        alert("Không tìm thấy phòng!");
        return;
    }

    // update
    rooms[index] = {
        ...rooms[index],
        ...data
    };

    localStorage.setItem('rooms', JSON.stringify(rooms));

    alert("Cập nhật phòng thành công!");
    window.location.href = "rooms.html";
}

// ==========================
// DELETE
// ==========================
function deleteRoom() {
    if (!currentRoom) return;

    if (!confirm("Bạn có chắc muốn xóa phòng này?")) return;

    rooms = rooms.filter(r => r.id !== currentRoom.id);

    localStorage.setItem('rooms', JSON.stringify(rooms));

    alert("Đã xóa phòng!");
    window.location.href = "rooms.html";
}
