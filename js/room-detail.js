const API_BASE = "https://hotel-management-system-se104-hgkg.onrender.com/api/phong";

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const titleEl = document.getElementById("roomTitle");

    if (!id) {
        if (titleEl) titleEl.textContent = "Không tìm thấy thông tin phòng";
        return;
    }

    try {
        const response = await fetch(API_BASE);
        if (!response.ok) throw new Error(`Lỗi Server: ${response.status}`);

        const rooms = await response.json();

        // Ép kiểu string để tránh lệch number/string
        const room = rooms.find(r => String(r.id) === String(id));

        if (!room) {
            if (titleEl) titleEl.textContent = "Không tìm thấy phòng";
            return;
        }

        // Hiển thị tiêu đề an toàn
        if (titleEl) titleEl.textContent = `Phòng ${room.id}`;

        // ------------------------------------------------------------------
        // HÀM GÁN DỮ LIỆU AN TOÀN (Không bao giờ lỗi nếu thiếu ID trong HTML)
        // ------------------------------------------------------------------
        const setTextSafe = (elementId, text) => {
            const el = document.getElementById(elementId);
            if (el) {
                // Nếu thẻ là thẻ input thì dùng .value, nếu là thẻ p/span/div thì dùng .textContent
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.value = text;
                else el.textContent = text;
            } else {
                console.warn(`Lưu ý: Không tìm thấy thẻ HTML có id="${elementId}" để gắn dữ liệu.`);
            }
        };

        // Gán dữ liệu
        setTextSafe("id", room.id ?? "-");
        setTextSafe("type", room.typeName ?? "Không rõ");
        setTextSafe("notes", room.notes?.trim() || "Không có ghi chú");
        setTextSafe("price", (Number(room.price) || 0).toLocaleString("vi-VN") + " VNĐ");

        // Xử lý trạng thái (Badge) an toàn
        const statusEl = document.getElementById("roomStatus");
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

        // Nút sửa an toàn
        const editBtn = document.getElementById("editBtn");
        if (editBtn) {
            editBtn.onclick = () => {
                window.location.href = `rooms-form.html?id=${room.id}`;
            };
        }

    } catch (error) {
        console.error("Lỗi lấy chi tiết phòng:", error);
        if (titleEl) titleEl.textContent = "Lỗi kết nối Server (Nhấn F12 xem Console)";
    }
});