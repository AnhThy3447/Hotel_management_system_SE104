let rooms = JSON.parse(localStorage.getItem('rooms')) || [];
let currentRoom = null;

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const roomCode = params.get('code');

    if (roomCode) {
        currentRoom = rooms.find(r => r.roomCode === roomCode);
        if (currentRoom) fillForm(currentRoom);
    }
});

function fillForm(room) {
    document.getElementById('roomCode').value = room.roomCode || '';
    document.getElementById('roomName').value = room.roomName || '';
    document.getElementById('roomType').value = room.roomType || '';
    document.getElementById('price').value = room.price || '';
    document.getElementById('floor').value = room.floor || '';
    document.getElementById('area').value = room.area || '';
    document.getElementById('capacity').value = room.capacity || '';
    document.getElementById('bedType').value = room.bedType || '';
    document.getElementById('status').value = room.status || '';

    if (room.amenities) {
        document.querySelectorAll('input[name="amenities"]').forEach(cb => {
            cb.checked = room.amenities.includes(cb.value);
        });
    }

    if (room.notes) {
        document.getElementById('notes').value = room.notes;
    }
}

function updatePrice() {
    const roomType = document.getElementById('roomType').value;
    const priceInput = document.getElementById('price');

    const prices = {
        'standard': 150000,
        'deluxe': 170000,
        'suite': 200000
    };

    if (prices[roomType]) {
        priceInput.value = prices[roomType];
    }
}

function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = {};

    for (let [key, value] of formData.entries()) {
        if (key === 'amenities') {
            if (!data.amenities) data.amenities = [];
            data.amenities.push(value);
        } else {
            data[key] = value;
        }
    }

    if (currentRoom) {
        const index = rooms.findIndex(r => r.roomCode === currentRoom.roomCode);
        rooms[index] = data;
    } else {
        rooms.push(data);
    }

    localStorage.setItem('rooms', JSON.stringify(rooms));

    alert('Cập nhật phòng thành công!');
    window.location.href = 'rooms.html';
}

function deleteRoom() {
    if (!currentRoom) return;

    if (confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
        rooms = rooms.filter(r => r.roomCode !== currentRoom.roomCode);
        localStorage.setItem('rooms', JSON.stringify(rooms));

        alert('Đã xóa phòng!');
        window.location.href = 'rooms.html';
    }
}
