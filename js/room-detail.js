const API_BASE = "https://hotel-management-system-se104.onrender.com/api/phong";

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        document.getElementById("roomTitle").textContent = "Không tìm thấy thông tin phòng";
        return;
    }

    try {
        const response = await fetch(API_BASE);
        if (!response.ok) throw new Error();
        
        const rooms = await response.json();
        const room = rooms.find(r => r.id.toString() === id.toString());

        if (!room) {
            document.getElementById("roomTitle").textContent = "Số phòng không tồn tại";
            return;
        }

        document.getElementById("roomTitle").textContent = `Phòng ${room.id}`;
        document.getElementById("id").textContent = room.id;
        document.getElementById("type").textContent = room.typeName;
        document.getElementById("notes").textContent = room.notes || "Không có ghi chú";
        document.getElementById("price").textContent = Number(room.price || 0).toLocaleString("vi-VN") + " VNĐ";

        const statusEl = document.getElementById("roomStatus");
        if (room.status === "Trống" || room.status === "available") {
            statusEl.textContent = "Trống";
            statusEl.className = "badge badge-available";
        } else if (room.status === "Đang thuê" || room.status === "occupied") {
            statusEl.textContent = "Đang thuê";
            statusEl.className = "badge badge-occupied";
        } else {
            statusEl.textContent = "Dọn dẹp";
            statusEl.className = "badge badge-maintenance";
        }

        document.getElementById("editBtn").onclick = () => {
            window.location.href = `rooms-form.html?id=${room.id}`;
        };
    } catch (error) {
        console.error("Lỗi lấy chi tiết phòng:", error);
    }
});