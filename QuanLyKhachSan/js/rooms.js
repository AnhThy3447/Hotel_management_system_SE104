function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    if (tab === 'rooms') {
        document.querySelector('.tab-btn:first-child').classList.add('active');
        document.getElementById('rooms-tab').classList.add('active');
    } else {
        document.querySelector('.tab-btn:last-child').classList.add('active');
        document.getElementById('room-types-tab').classList.add('active');
    }
}

function deleteRoom(roomCode) {
    if (confirm(`Bạn có chắc chắn muốn xóa phòng ${roomCode}?`)) {
        alert(`Đã xóa phòng ${roomCode} thành công!`);
    }
}