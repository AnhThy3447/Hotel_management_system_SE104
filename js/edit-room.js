// ==========================
// LOAD DATA
// ==========================
const API_BASE =
    "https://hotel-management-system-se104-hgkg.onrender.com/api/phong";

let currentRoom = null;

// ==========================
// INIT
// ==========================
document.addEventListener("DOMContentLoaded", async () => {

    const params = new URLSearchParams(window.location.search);
    const roomId = params.get("id");

    if (!roomId) {
        alert("Không có mã phòng!");
        window.location.href = "rooms.html";
        return;
    }

    try {
        const response = await fetch(API_BASE);
        const rooms = await response.json();

        currentRoom = rooms.find(
            room => String(room.id) === String(roomId)
        );

        if (!currentRoom) {
            alert("Không tìm thấy phòng!");
            window.location.href = "rooms.html";
            return;
        }

        fillForm(currentRoom);
        checkRoomStatusRestrictions(currentRoom.status);

    } catch (error) {
        console.error(error);
        alert("Không tải được dữ liệu phòng!");
    }
});


// ==========================
// FILL FORM
// ==========================
function fillForm(room) {

    document.getElementById("roomCode").value = room.id || "";

    const typeMap = {
        1: "standard",
        2: "deluxe",
        3: "suite"
    };

    document.getElementById("roomType").value =
        typeMap[room.type] || "";

    document.getElementById("price").value = room.price || "";

    // status chuẩn API
    document.getElementById("status").value =
        room.status || "available";

    document.getElementById("notes").value =
        room.notes || "";
}


// ==========================
// AUTO PRICE
// ==========================
function updatePrice() {

    const prices = {
        standard: 150000,
        deluxe: 170000,
        suite: 200000
    };

    const type = document.getElementById("roomType").value;

    if (prices[type]) {
        document.getElementById("price").value = prices[type];
    }
}


// ==========================
// LOCK ROOM IF OCCUPIED
// ==========================

function checkRoomStatusRestrictions(status) {

    const statusSelect =
        document.getElementById("status");

    if (status === "occupied") {

        statusSelect.value = "occupied";

        statusSelect.disabled = true;

        statusSelect.title =
            "Không thể thay đổi trạng thái khi phòng đang thuê";
    }
}

// ==========================
// UPDATE ROOM
// ==========================
async function handleSubmit(event) {
    event.preventDefault();

    if (!currentRoom) return;

    const newStatus = document.getElementById("status").value;

    // chặn chuyển sang occupied
   if (
    currentRoom.status !== "occupied" &&
    newStatus === "occupied"
) {
    alert("Không được chuyển sang trạng thái 'Đang thuê'!");
    return;
}

    const typeMap = {
        standard: 1,
        deluxe: 2,
        suite: 3
    };

    const typeNameMap = {
        standard: "A",
        deluxe: "B",
        suite: "C"
    };

    const data = {
        id: Number(document.getElementById("roomCode").value),

        status: newStatus,

        notes: document.getElementById("notes").value.trim(),

        type: typeMap[document.getElementById("roomType").value],

        typeName: typeNameMap[document.getElementById("roomType").value],

        price: Number(document.getElementById("price").value)
    };

    try {
        const response = await fetch(`${API_BASE}/${currentRoom.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            alert("Cập nhật phòng thành công!");
            window.location.href = "rooms.html";
        } else {
            alert(result.error || "Cập nhật thất bại!");
        }

    } catch (error) {
        console.error(error);
        alert("Lỗi kết nối!");
    }
}


// ==========================
// DELETE ROOM
// ==========================
async function deleteRoom() {

    if (!currentRoom) return;

    if (currentRoom.status === "occupied") {
        alert("Không thể xóa phòng đang thuê!");
        return;
    }

    if (!confirm("Bạn có chắc muốn xóa phòng này?")) return;

    try {
        const response = await fetch(
            `${API_BASE}/${currentRoom.id}`,
            { method: "DELETE" }
        );

        const result = await response.json();

        if (response.ok) {
            alert(result.message || "Xóa phòng thành công!");
            window.location.href = "rooms.html";
        } else {
            alert(result.error || "Không thể xóa phòng!");
        }

    } catch (error) {
        console.error(error);
        alert("Lỗi kết nối!");
    }
}
