const API_URL = "https://hotel-management-system-se104.onrender.com/api/phong";

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addRoomTypeForm");
  if (form) {
    // Loại bỏ gán sự kiện thủ công để nhường quyền xử lý cho onsubmit="handleSubmit(event)" trực tiếp từ HTML
    console.log("Form 'addRoomTypeForm' đã sẵn sàng điều hướng dữ liệu.");
  }
});

// ================= SUBMIT =================
async function handleSubmit(event) {
  event.preventDefault();

  // Đọc đúng ID từ cấu trúc HTML gốc của bạn
  const maLoaiPhongVal = document.getElementById("typeCode").value.trim();
  const loaiPhong = document.getElementById("typeName").value.trim();
  const donGia = Number(document.getElementById("price").value);

  if (!maLoaiPhongVal) {
    alert("Vui lòng nhập mã loại phòng");
    return;
  }

  if (!loaiPhong) {
    alert("Vui lòng nhập tên loại phòng");
    return;
  }

  if (!donGia || donGia <= 0) {
    alert("Đơn giá không hợp lệ");
    return;
  }

  // Chuyển mã loại phòng sang kiểu số nguyên (INT) để khớp với kiểu dữ liệu SERIAL của Database
  const maLoaiPhong = parseInt(maLoaiPhongVal, 10);

  const body = {
    maLoaiPhong,
    loaiPhong,
    donGia,
  };

  try {
    console.log("Gửi gói tin:", body);

    const response = await fetch(`${API_URL}/loai-phong`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    console.log("Kết quả từ Server:", result);

    if (!response.ok) {
      throw new Error(result.message || "Thêm loại phòng thất bại");
    }

    alert("Thêm loại phòng thành công");
    window.location.href = "rooms.html";

  } catch (err) {
    console.error("Lỗi:", err);
    alert(err.message);
  }
}

// ================= CANCEL =================
function cancelForm() {
  if (confirm("Bạn có chắc muốn hủy?")) {
    window.location.href = "rooms.html";
  }
}

// Xuất các hàm ra phạm vi Window để xử lý sự kiện inline HTML hoạt động bình thường
window.handleSubmit = handleSubmit;
window.cancelForm = cancelForm;