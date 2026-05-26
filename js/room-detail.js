const API_URL = "https://hotel-management-system-se104.onrender.com/api/phong";

document.addEventListener("DOMContentLoaded", async () => {

    const params = new URLSearchParams(window.location.search);

    const id = params.get("id");

    const res = await fetch(API_URL);

    const rooms = await res.json();

    const room = rooms.find(r => r.sophong == id);

    if (!room) return;

    document.getElementById("roomTitle").textContent =
        `Phòng ${room.sophong}`;

    document.getElementById("id").textContent =
        room.sophong;

    document.getElementById("type").textContent =
        room.loaiphong;

    document.getElementById("price").textContent =
        Number(room.dongia).toLocaleString("vi-VN") + " VNĐ";

    document.getElementById("notes").textContent =
        room.ghichu || "Không có ghi chú";

    document.getElementById("roomStatus").textContent =
        room.tinhtrang;
});