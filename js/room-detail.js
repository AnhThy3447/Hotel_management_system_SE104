const API_URL =
  "https://hotel-management-system-se104.onrender.com/api/phong";

document.addEventListener("DOMContentLoaded", async () => {

  const params =
    new URLSearchParams(window.location.search);

  const id =
    params.get("id");

  try {

    const response =
      await fetch(`${API_URL}/${id}`);

    const text =
      await response.text();

    let room;

    try {
      room = JSON.parse(text);
    } catch {

      throw new Error(
        "API trả về HTML thay vì JSON"
      );
    }

    if (!room) {

      document.getElementById("roomTitle")
        .textContent =
        "Không tìm thấy phòng";

      return;
    }

    document.getElementById("roomTitle")
      .textContent =
      `Phòng ${room.sophong}`;

    document.getElementById("id")
      .textContent =
      room.sophong;

    document.getElementById("type")
      .textContent =
      room.loaiphong;

    document.getElementById("price")
      .textContent =
      Number(room.dongia)
        .toLocaleString("vi-VN")
      + " VNĐ";

    document.getElementById("notes")
      .textContent =
      room.ghichu ||
      "Không có ghi chú";

    const statusEl =
      document.getElementById("roomStatus");

    if (room.tinhtrang === "Trống") {

      statusEl.textContent = "Trống";

      statusEl.className =
        "badge badge-available";

    } else if (
      room.tinhtrang === "Đang thuê"
    ) {

      statusEl.textContent =
        "Đang thuê";

      statusEl.className =
        "badge badge-occupied";

    } else {

      statusEl.textContent =
        "Dọn dẹp";

      statusEl.className =
        "badge badge-maintenance";
    }

    document.getElementById("editBtn")
      .onclick = () => {

      window.location.href =
        `edit-room.html?id=${room.sophong}`;
    };

  } catch (err) {

    console.error(
      "ROOM DETAIL ERROR:",
      err
    );

    alert(err.message);
  }
});