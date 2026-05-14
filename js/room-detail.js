// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    // Lấy data từ localStorage
    const rooms = JSON.parse(localStorage.getItem("rooms")) || [];

    console.log("ROOMS:", rooms);
    console.log("ID:", id);

    const room = rooms.find(r => r.id === id);

    if (!room) {
        document.getElementById("roomTitle").textContent = "Không tìm thấy phòng";
        return;
    }

    // ================= FILL DATA =================
    document.getElementById("roomTitle").textContent = room.name;
    document.getElementById("id").textContent = room.id;
    document.getElementById("name").textContent = room.name;
    document.getElementById("type").textContent = room.typeName;
    document.getElementById("notes").textContent = room.notes || "Không có ghi chú";
    // FIX GIÁ 
    document.getElementById("price").textContent =
        Number(room.price || 0).toLocaleString("vi-VN") + " VNĐ";

    // ================= STATUS =================
    const statusEl = document.getElementById("roomStatus");

    if (room.status === "available") {
        statusEl.textContent = "Trống";
        statusEl.className = "badge badge-available";
    } else if (room.status === "occupied") {
        statusEl.textContent = "Đang thuê";
        statusEl.className = "badge badge-occupied";
    } else {
        statusEl.textContent = "Dọn dẹp";
        statusEl.className = "badge badge-maintenance";
    }

    // ================= EDIT BUTTON =================
    document.getElementById("editBtn").onclick = () => {
        window.location.href = `edit-room.html?id=${room.id}`;
    };
});
