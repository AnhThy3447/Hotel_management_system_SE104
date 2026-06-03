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

        console.log("Current Room:", currentRoom);

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

    document.getElementById("roomCode").value =
        room.id || "";

    // Loại phòng
    const typeMap = {
        1: "standard",
        2: "deluxe",
        3: "suite"
    };

    document.getElementById("roomType").value =
        typeMap[room.type] || "";

    // Giá
    document.getElementById("price").value =
        room.price || "";

    // Trạng thái
    const statusMap = {
        "Trống": "available",
        "Đang thuê": "occupied",
        "Dọn dẹp": "maintenance"
    };

    document.getElementById("status").value =
        statusMap[room.status] || "available";

    // Ghi chú
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

    const type =
        document.getElementById("roomType").value;

    if (prices[type]) {
        document.getElementById("price").value =
            prices[type];
    }

}

// ==========================
// KIỂM TRA TRẠNG THÁI
// ==========================
function checkRoomStatusRestrictions(status) {

    if (status !== "Đang thuê") return;

    document.getElementById("roomType").disabled = true;
    document.getElementById("price").disabled = true;
    document.getElementById("status").disabled = true;
    document.getElementById("notes").disabled = true;

    const submitBtn =
        document.querySelector('button[type="submit"]');

    if (submitBtn) {
        submitBtn.disabled = true;
    }

    alert("Phòng đang thuê, không được chỉnh sửa!");

}

// ==========================
// UPDATE
// ==========================
async function handleSubmit(event) {

    event.preventDefault();

    // Chặn phòng đang thuê
    if (currentRoom.status === "Đang thuê") {
        alert("Phòng đang thuê, không được chỉnh sửa!");
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

    const statusMap = {
        available: "Trống",
        occupied: "Đang thuê",
        maintenance: "Dọn dẹp"
    };

    const data = {

        id: Number(
            document.getElementById("roomCode").value
        ),

        status:
            statusMap[
                document.getElementById("status").value
            ],

        notes:
            document.getElementById("notes").value.trim(),

        type:
            typeMap[
                document.getElementById("roomType").value
            ],

        typeName:
            typeNameMap[
                document.getElementById("roomType").value
            ],

        price: Number(
            document.getElementById("price").value
        )

    };

    console.log("Current:", currentRoom.status);
    console.log("New:", data.status);

    // Không cho đổi sang Đang thuê
    if (
        currentRoom.status !== "Đang thuê" &&
        data.status === "Đang thuê"
    ) {
        alert(
            "Không được chuyển phòng sang trạng thái Đang thuê!"
        );
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

        const result =
            await response.json();

        if (response.ok) {

            alert("Cập nhật phòng thành công!");
            window.location.href = "rooms.html";

        } else {

            alert(
                result.error ||
                "Cập nhật thất bại!"
            );

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

    if (currentRoom.status === "Đang thuê") {

        alert("Không thể xóa phòng đang thuê!");
        return;

    }

    if (
        !confirm("Bạn có chắc muốn xóa phòng này?")
    ) {
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE}/${currentRoom.id}`,
            {
                method: "DELETE"
            }
        );

        const result =
            await response.json();

        if (response.ok) {

            alert(
                result.message ||
                "Xóa phòng thành công!"
            );

            window.location.href =
                "rooms.html";

        } else {

            alert(
                result.error ||
                "Không thể xóa phòng!"
            );

        }

    } catch (error) {

        console.error(error);
        alert("Lỗi kết nối!");

    }

}
