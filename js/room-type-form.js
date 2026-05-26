const API_URL = "https://hotel-management-system-se104.onrender.com/api/phong";

async function handleSubmit(event) {
  event.preventDefault();

  const typeCodeVal = document.getElementById("typeCode").value.trim();
  const typeNameVal = document.getElementById("typeName").value.trim();
  const priceVal = document.getElementById("price").value.trim();

  if (!typeCodeVal || !typeNameVal || !priceVal) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  const bodyData = {
    maLoaiPhong: parseInt(typeCodeVal, 10),
    loaiPhong: typeNameVal,
    donGia: parseFloat(priceVal)
  };

  try {
    // Gọi chính xác link Render không kèm gạch chéo cuối cùng
    const response = await fetch(`${API_URL}/loai-phong`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Thêm loại phòng thất bại!");
    }

    alert("Thêm loại phòng thành công!");
    window.location.href = "rooms.html";

  } catch (err) {
    console.error("Lỗi:", err);
    alert(err.message);
  }
}

function cancelForm() {
  if (confirm("Bạn có chắc chắn muốn hủy?")) {
    window.location.href = "rooms.html";
  }
}

window.handleSubmit = handleSubmit;
window.cancelForm = cancelForm;