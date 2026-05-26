const API_URL =
  "https://hotel-management-system-se104.onrender.com/api/phong";

// ================= SUBMIT =================
async function handleSubmit(event) {
  event.preventDefault();

  const body = {
    loaiPhong:
      document.getElementById("typeName").value,

    donGia:
      Number(document.getElementById("price").value),
  };

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

    if (!response.ok) {
      throw new Error("Thêm loại phòng thất bại");
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