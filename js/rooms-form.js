// ==========================
// LOAD STORAGE
// ==========================
let rooms = JSON.parse(localStorage.getItem("rooms")) || [];

// ==========================
// INIT
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    // chỉ init nếu cần (không edit nữa)
});

// ==========================
// AUTO UPDATE PRICE
// ==========================
function updatePrice() {
    const select = document.getElementById('roomType');
    const selected = select.options[select.selectedIndex];
    const price = selected.getAttribute('data-price');

    if (price) {
        document.getElementById('price').value = price;
    }
}

// ==========================
// SUBMIT - ADD ONLY
// ==========================
function handleSubmit(event) {
    event.preventDefault();

    const data = {
        id: document.getElementById('roomCode').value.trim(),
        name: document.getElementById('roomName').value.trim(),
        typeName: document.getElementById('roomType').value,
        price: Number(document.getElementById('price').value),
        status: document.getElementById('status').value,
        notes: document.getElementById('notes').value.trim()
    };

    // validate
    if (!data.id || !data.name || !data.typeName) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    // check trùng mã
    const exists = rooms.some(r => r.id === data.id);
    if (exists) {
        alert("Mã phòng đã tồn tại!");
        return;
    }

    // thêm mới
    rooms.push(data);
    localStorage.setItem("rooms", JSON.stringify(rooms));

    // THÔNG BÁO THÀNH CÔNG
    alert("Thêm phòng thành công!");

    // QUAY LẠI TRANG TRƯỚC
    window.location.href = "rooms.html";
}

// ==========================
// CANCEL
// ==========================
function cancelForm() {
    if (confirm("Bạn có chắc muốn hủy?")) {
        window.location.href = "rooms.html";
    }
}
