// Dùng chung địa chỉ API phòng của bạn
const API_ROOMS = "https://hotel-management-system-se104-hgkg.onrender.com/api/phong";

document.addEventListener("DOMContentLoaded", () => {
    // Gọi hàm lấy tổng số phòng ngay khi trang dashboard load xong
    fetchTotalRoomsDashboard();
});

async function fetchTotalRoomsDashboard() {
    const totalDashboardEl = document.getElementById("dashTotalRooms");
    if (!totalDashboardEl) return;

    try {
        // 1. Gọi lên Server lấy toàn bộ danh sách phòng về
        const response = await fetch(API_ROOMS);
        if (!response.ok) throw new Error("Không thể lấy dữ liệu phòng");

        const rooms = await response.json(); // Mảng chứa danh sách phòng

        // 2. Đếm số lượng phần tử trong mảng và hiển thị lên Dashboard
        totalDashboardEl.textContent = rooms.length;

    } catch (error) {
        console.error("Lỗi khi lấy số phòng cho Dashboard:", error);
        totalDashboardEl.textContent = "0"; // Nếu lỗi thì hiển thị số 0
    }
}