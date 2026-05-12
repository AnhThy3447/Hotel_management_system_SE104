
let rooms = [
    {
        id: "P101",
        name: "Phòng 101",
        typeName: "Phòng tiêu chuẩn",
        floor: 1,
        price: 150000,
        status: "available"
    },
    {
        id: "P102",
        name: "Phòng 102",
        typeName: "Phòng cao cấp",
        floor: 1,
        price: 170000,
        status: "occupied"
    }
];

// ==========================
// CHECK EDIT MODE
// ==========================
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("id");
let isEdit = false;

// ==========================
// INIT
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    if (roomId) {
        isEdit = true;
        loadRoom(roomId);

        const btn = document.querySelector(".btn-submit");
        if (btn) btn.innerText = "Cập nhật phòng";
    }
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
// GET AMENITIES
// ==========================
function getAmenities() {
    const checked = document.querySelectorAll('input[name="amenities"]:checked');
    return Array.from(checked).map(item => item.value);
}

// ==========================
// LOAD ROOM (EDIT)
// ==========================
function loadRoom(id) {
    const room = rooms.find(r => r.id === id);
    if (!room) return;

    document.getElementById("roomCode").value = room.id;
    document.getElementById("roomName").value = room.name;
    document.getElementById("floor").value = room.floor;
    document.getElementById("price").value = room.price;
    document.getElementById("status").value = room.status;
}

// ==========================
// SUBMIT FORM (ADD + UPDATE)
// ==========================
function handleSubmit(event) {
    event.preventDefault();

    const data = {
        id: document.getElementById('roomCode').value.trim(),
        name: document.getElementById('roomName').value.trim(),
        floor: Number(document.getElementById('floor').value),
        price: Number(document.getElementById('price').value),
        status: document.getElementById('status').value
    };

    // validate
    if (!data.id || !data.name) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    // ================= UPDATE =================
    if (isEdit) {
        const index = rooms.findIndex(r => r.id === roomId);

        if (index !== -1) {
            rooms[index] = {
                ...rooms[index],
                id: data.id,
                name: data.name,
                floor: data.floor,
                price: data.price,
                status: data.status
            };
        }

        alert("Cập nhật phòng thành công!");
        window.location.href = "rooms.html";
        return;
    }

    // ================= ADD =================
    const exists = rooms.some(r => r.id === data.id);
    if (exists) {
        alert("Mã phòng đã tồn tại!");
        return;
    }

    rooms.push({
        id: data.id,
        name: data.name,
        typeName: "Chưa phân loại",
        floor: data.floor,
        price: data.price,
        status: data.status
    });

    alert("Thêm phòng thành công!");
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
