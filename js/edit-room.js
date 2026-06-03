// ==========================
// LOAD DATA
// ==========================
const API_BASE = "https://hotel-management-system-se104-hgkg.onrender.com/api/phong";

let currentRoom = null;

// ==========================
// INIT
// ==========================
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('id');

    if (!roomId) {
        alert("Không có mã phòng!");
        window.location.href = "rooms.html";
        return;
    }

   try {
    const response = await fetch(API_BASE);
    const rooms = await response.json();

    currentRoom = rooms.find(
        r => String(r.id) === String(roomId)
    );
    console.log("Current Room:", currentRoom);
console.log("Status API:", currentRoom.status);
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
// KIỂM TRA TRẠNG THÁI PHÒNG (THÊM MỚI TOÀN BỘ HÀM NÀY)
// ==========================
function checkRoomStatusRestrictions(status) {
    const statusSelect = document.getElementById('status');

    // Nếu phòng đang thuê => khóa combobox
    
    if (status === 'occupied' || status === 'Đang thuê') {
        statusSelect.disabled = true;
        return;
    }

    // Xóa lựa chọn "Đang thuê"
    for (let i = statusSelect.options.length - 1; i >= 0; i--) {
        const value = statusSelect.options[i].value;

        if (
            value === 'occupied' ||
            value === 'Đang thuê'
        ) {
            statusSelect.remove(i);
        }
    }
}
// ==========================
// SUBMIT UPDATE
// ==========================
function handleSubmit(event) {
    event.preventDefault();
   
    const typeNameMap = {
    standard: "Phòng tiêu chuẩn",
    deluxe: "Phòng cao cấp",
    suite: "Phòng hạng sang"
};

const data = {
    id: document.getElementById('roomCode').value.trim(),
    name: document.getElementById('roomName').value.trim(),
    type: document.getElementById('roomType').value,
    typeName: typeNameMap[document.getElementById('roomType').value], 
    status: document.getElementById('status').value,
    notes: document.getElementById('notes').value.trim()
};
    console.log("Current Status:", currentRoom.status);
console.log("New Status:", data.status);
// Không cho đổi sang Đang thuê
// Chỉ chặn khi từ trạng thái khác chuyển sang Đang thuê
if (
    currentRoom.status !== 'occupied' &&
    currentRoom.status !== 'Đang thuê' &&
    (
        data.status === 'occupied' ||
        data.status === 'Đang thuê'
    )
) {
    alert("Không được chuyển phòng sang trạng thái Đang thuê!");
    return;
}
    // validate
    if (!data.id || !data.name || !data.type) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

   try {
    const response = await fetch(
        `${API_BASE}/${currentRoom.id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );

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
// DELETE
// ==========================
async function deleteRoom() {

    if (!currentRoom) return;

    if (
        currentRoom.status === "occupied" ||
        currentRoom.status === "Đang thuê"
    ) {
        alert("Không thể xóa phòng đang thuê!");
        return;
    }

    if (!confirm("Bạn có chắc muốn xóa phòng này?")) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE}/${currentRoom.id}`,
            {
                method: "DELETE"
            }
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
