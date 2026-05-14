// ==========================
// LOAD DATA
// ==========================
let rooms = JSON.parse(localStorage.getItem('rooms'));

if (!rooms || !rooms.length) {
    rooms = [];
}
// ==========================
// INIT
// ==========================
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const roomCode = params.get('id'); // FIX: dùng id thay vì code

    if (!roomCode) {
        alert("Không có mã phòng!");
        window.location.href = "rooms.html";
        return;
    }

    currentRoom = rooms.find(r => r.id === roomCode);

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
    document.getElementById('roomType').value = room.type || '';
    document.getElementById('price').value = room.price || '';
    document.getElementById('floor').value = room.floor || '';
    document.getElementById('area').value = room.area || '';
    document.getElementById('capacity').value = room.capacity || '';
    document.getElementById('bedType').value = room.bedType || '';
    document.getElementById('status').value = room.status || '';

    // amenities
    if (room.amenities && room.amenities.length) {
        document.querySelectorAll('input[name="amenities"]').forEach(cb => {
            cb.checked = room.amenities.includes(cb.value);
        });
    }

    document.getElementById('notes').value = room.notes || '';
}

// ==========================
// AUTO PRICE UPDATE
// ==========================
function updatePrice() {
    const roomType = document.getElementById('roomType').value;

    const prices = {
        standard: 150000,
        deluxe: 170000,
        suite: 200000
    };

    if (prices[roomType]) {
        document.getElementById('price').value = prices[roomType];
    }
}

// ==========================
// GET AMENITIES
// ==========================
function getAmenities() {
    const checked = document.querySelectorAll('input[name="amenities"]:checked');
    return Array.from(checked).map(i => i.value);
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
        floor: Number(document.getElementById('floor').value),
        area: Number(document.getElementById('area').value),
        capacity: Number(document.getElementById('capacity').value),
        bedType: document.getElementById('bedType').value,
        status: document.getElementById('status').value,
        amenities: getAmenities(),
        notes: document.getElementById('notes').value
    };

    // validate
    if (!data.id || !data.name) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    // tìm index
    const index = rooms.findIndex(r => r.id === currentRoom.id);

    if (index === -1) {
        alert("Không tìm thấy phòng để cập nhật!");
        return;
    }

    // update
    rooms[index] = data;

    // save localStorage
    localStorage.setItem('rooms', JSON.stringify(rooms));

    alert("Cập nhật phòng thành công!");

    window.location.href = "rooms.html";
}

// ==========================
// DELETE ROOM
// ==========================
function deleteRoom() {
    if (!currentRoom) return;

    if (!confirm("Bạn có chắc chắn muốn xóa phòng này?")) return;

    rooms = rooms.filter(r => r.id !== currentRoom.id);

    localStorage.setItem('rooms', JSON.stringify(rooms));

    alert("Đã xóa phòng!");

    window.location.href = "rooms.html";
}

// ==========================
// CANCEL
// ==========================
function cancelForm() {
    if (confirm("Hủy thay đổi?")) {
        window.location.href = "rooms.html";
    }
}
