// Sử dụng API lấy danh sách toàn bộ phòng
const API_BASE = "https://hotel-management-system-se104-hgkg.onrender.com/api/phong";

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Lấy ID phòng từ URL
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get("id");

    const titleEl = document.getElementById("roomTitle");
    const statusEl = document.getElementById("roomStatus");

    // Nếu không có ID trong URL, dừng lại
    if (!roomId) {
        if (titleEl) titleEl.textContent = "Không tìm thấy mã phòng trong URL";
        return;
    }

    try {
        // 2. Gọi API để lấy danh sách phòng
        const response = await fetch(API_BASE);
        
        if (!response.ok) {
            throw new Error(`Lỗi mạng: ${response.status}`);
        }

        const rooms = await response.json();
        
        // 3. Tìm phòng theo ID (ép kiểu String để so sánh an toàn)
        const room = rooms.find(r => String(r.id) === String(roomId));

        // Nếu phòng không tồn tại trong DB
        if (!room) {
            if (titleEl) titleEl.textContent = "Số phòng không tồn tại";
            if (statusEl) statusEl.style.display = "none";
            return;
        }

        // 4. Đổ dữ liệu vào HTML
        // Tiêu đề
        if (titleEl) titleEl.textContent = `Chi tiết phòng ${room.id}`;

        // Trạng thái (Badge)
        if (statusEl) {
            const status = room.status;
            if (status === "Trống" || status === "available") {
                statusEl.textContent = "Trống";
                statusEl.className = "badge badge-available";
            } else if (status === "Đang thuê" || status === "occupied") {
                statusEl.textContent = "Đang thuê";
                statusEl.className = "badge badge-occupied";
            } else {
                statusEl.textContent = "Dọn dẹp";
                statusEl.className = "badge badge-maintenance";
            }
        }

        // Các thông tin chi tiết
        document.getElementById("id").textContent = room.id || "-";
        document.getElementById("type").textContent = room.typeName || "Không rõ";
        
        // Định dạng giá tiền
        const priceText = (Number(room.price) || 0).toLocaleString("vi-VN") + " VNĐ";
        document.getElementById("price").textContent = priceText;
        
        // Ghi chú
        const notesText = (room.notes && room.notes.trim() !== "") ? room.notes : "Không có ghi chú";
        document.getElementById("notes").textContent = notesText;

        // 5. Cấu hình nút Cập nhật
        const editBtn = document.getElementById("editBtn");
        if (editBtn) {
            editBtn.onclick = () => {
                window.location.href = `rooms-form.html?id=${room.id}`;
            };
        }

    } catch (error) {
        console.error("Chi tiết lỗi API:", error);
        if (titleEl) titleEl.textContent = "Lỗi kết nối Backend. Vui lòng kiểm tra Server.";
        if (statusEl) statusEl.style.display = "none";
    }
});