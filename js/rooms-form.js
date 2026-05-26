const API_URL =
  "https://hotel-management-system-se104.onrender.com/api/phong";

// ================= LOAD ROOM TYPES =================
document.addEventListener("DOMContentLoaded", async () => {
  await loadRoomTypes();
});

// ================= LOAD TYPES =================
async function loadRoomTypes() {
  try {
    const response = await fetch(`${API_URL}/loai-phong`);

    if (!response.ok) {
      throw new Error("Không tải được loại phòng");
    }

    const data = await response.json();

    const select =
      document.getElementById("roomType");

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

    alert(err.message);
  }
}

// ================= UPDATE PRICE =================
function updatePrice() {

  const select =
    document.getElementById("roomType");

  const option =
    select.options[select.selectedIndex];

  const price =
    option.getAttribute("data-price");

  document.getElementById("price").value =
    price || "";
}

// ================= SUBMIT =================
async function handleSubmit(event) {

  event.preventDefault();

  const soPhong =
    document.getElementById("roomId")
      .value
      .trim();

  const maLoaiPhong =
    document.getElementById("roomType")
      .value;

  const tinhTrang =
    document.getElementById("status")
      .value;

  const ghiChu =
    document.getElementById("notes")
      .value;

  if (!soPhong) {
    alert("Vui lòng nhập số phòng");
    return;
  }

  if (!maLoaiPhong) {
    alert("Vui lòng chọn loại phòng");
    return;
  }

  const body = {
    soPhong: soPhong,

    maLoaiPhong: maLoaiPhong,

    tinhTrang:
      convertStatus(tinhTrang),

    ghiChu: ghiChu,
  };

  try {

    const response = await fetch(API_URL, {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(body),
    });

    const result =
      await response.json();

    if (!response.ok) {

      throw new Error(
        result.message ||
        "Thêm phòng thất bại"
      );
    }

    alert("Thêm phòng thành công");

    window.location.href =
      "rooms.html";

  } catch (err) {

    console.error(err);

    alert(err.message);
  }
}

// ================= STATUS =================
function convertStatus(status) {

  if (status === "available") {
    return "Trống";
  }

  if (status === "occupied") {
    return "Đang thuê";
  }

  return "Dọn dẹp";
}

// ================= CANCEL =================
function cancelForm() {

  if (
    confirm("Bạn có chắc muốn hủy?")
  ) {
    window.location.href =
      "rooms.html";
  }
}