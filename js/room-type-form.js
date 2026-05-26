const API_URL =
  "https://hotel-management-system-se104.onrender.com/api/phong";

// ================= SUBMIT =================
async function handleSubmit(event) {
  event.preventDefault();

  const maLoaiPhong =
    document.getElementById("typeCode").value.trim();

  const loaiPhong =
    document.getElementById("typeName").value.trim();

  const donGia =
    Number(document.getElementById("price").value);

  // ===== VALIDATE =====
  if (!maLoaiPhong) {
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

  const body = {
    maLoaiPhong,
    loaiPhong,
    donGia,
  };

  console.log("BODY SEND:", body);

  try {
    const response = await fetch(
      `${API_URL}/loai-phong`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(body),
      }
    );

    // ===== ĐỌC TEXT TRƯỚC =====
    const text = await response.text();

    console.log("RAW RESPONSE:", text);

    let result;

    try {
      result = JSON.parse(text);
    } catch {
      throw new Error(
        "Server không trả JSON.\n\n" + text
      );
    }

    if (!response.ok) {
      throw new Error(
        result.message || "Thêm loại phòng thất bại"
      );
    }

    alert("Thêm loại phòng thành công");

    window.location.href = "rooms.html";

  } catch (err) {
    console.error(err);

    alert(err.message);
  }
}

// ================= CANCEL =================
function cancelForm() {
  if (confirm("Bạn có chắc muốn hủy?")) {
    window.location.href = "rooms.html";
  }
}

// ===== EXPORT =====
window.handleSubmit = handleSubmit;
window.cancelForm = cancelForm;