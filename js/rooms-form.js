const API_URL =
  "https://hotel-management-system-se104.onrender.com/api/phong";

// ================= LOAD ROOM TYPES =================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch(`${API_URL}/loai-phong`);

    const data = await response.json();

    const select = document.getElementById("roomType");

    select.innerHTML =
      '<option value="">-- Chọn loại phòng --</option>';

    data.forEach((type) => {
      select.innerHTML += `
            <option
                value="${type.maloaiphong}"
                data-price="${type.dongia}"
            >
                ${type.loaiphong}
            </option>
        `;
    });
  } catch (err) {
    console.error(err);
  }
});

// ================= UPDATE PRICE =================
function updatePrice() {
  const select = document.getElementById("roomType");

  const option = select.options[select.selectedIndex];

  const price = option.getAttribute("data-price");

  document.getElementById("price").value = price || "";
}

// ================= SUBMIT =================
async function handleSubmit(event) {
  event.preventDefault();

  const body = {
    maLoaiPhong:
      document.getElementById("roomType").value,

    tinhTrang:
      convertStatus(document.getElementById("status").value),

    ghiChu:
      document.getElementById("notes").value,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Thêm phòng thất bại");
    }

    alert("Thêm phòng thành công");

    window.location.href = "rooms.html";
  } catch (err) {
    console.error(err);

    alert(err.message);
  }
}

function convertStatus(status) {
  if (status === "available") return "Trống";

  if (status === "occupied") return "Đang thuê";

  return "Dọn dẹp";
}

// ================= CANCEL =================
function cancelForm() {
  if (confirm("Bạn có chắc muốn hủy?")) {
    window.location.href = "rooms.html";
  }
}