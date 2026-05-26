const API_URL =
  "https://hotel-management-system-se104.onrender.com/api/phong";

let rooms = [];
let roomTypes = [];

// ================= INIT =================
document.addEventListener("DOMContentLoaded", async () => {
  await loadRooms();
  await loadRoomTypes();

  setupEvents();
});

// ================= LOAD ROOMS =================
async function loadRooms() {
  try {
    const response = await fetch(API_URL);

    const data = await response.json();

    rooms = data.map((r) => ({
      id: r.sophong,
      typeId: r.maloaiphong,
      typeName: r.loaiphong,
      price: r.dongia,
      status: convertStatus(r.tinhtrang),
      notes: r.ghichu,
    }));

    renderRooms();
  } catch (err) {
    console.error("Load rooms error:", err);
  }
}

// ================= LOAD ROOM TYPES =================
async function loadRoomTypes() {
  try {
    const response = await fetch(`${API_URL}/loai-phong`);

    const data = await response.json();

    roomTypes = data.map((t) => ({
      id: t.maloaiphong,
      name: t.loaiphong,
      price: t.dongia,
    }));

    renderRoomTypes();
    renderTypeFilter();
  } catch (err) {
    console.error(err);
  }
}

// ================= RENDER ROOMS =================
function renderRooms(list = rooms) {
  const tbody = document.getElementById("roomTableBody");
  const total = document.getElementById("totalRooms");

  if (!tbody) return;

  tbody.innerHTML = "";

  total.textContent = list.length;

  list.forEach((room, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${room.id}</td>
        <td>${room.typeName}</td>
        <td>${formatPrice(room.price)}</td>
        <td>${renderStatus(room.status)}</td>
        <td>${room.notes || ""}</td>

        <td>

            <button class="btn-action btn-edit"
                onclick="editRoom('${room.id}')">
                ✏️
            </button>

            <button class="btn-action btn-delete"
                onclick="deleteRoom('${room.id}')">
                🗑️
            </button>

        </td>
    `;

    tr.style.cursor = "pointer";

    tr.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;

      viewRoomDetail(room.id);
    });

    tbody.appendChild(tr);
  });
}

// ================= RENDER ROOM TYPES =================
function renderRoomTypes() {
  const tbody = document.getElementById("room-types-table");
  const total = document.getElementById("total-types");

  if (!tbody) return;

  tbody.innerHTML = "";

  total.textContent = roomTypes.length;

  roomTypes.forEach((type, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${type.id}</td>
        <td>${type.name}</td>
        <td>${formatPrice(type.price)}</td>

        <td>

            <button class="btn-action btn-edit"
                onclick="editRoomType('${type.id}')">
                ✏️
            </button>

            <button class="btn-action btn-delete"
                onclick="deleteRoomType('${type.id}')">
                🗑️
            </button>

        </td>
    `;

    tbody.appendChild(tr);
  });
}

// ================= STATUS =================
function renderStatus(status) {
  if (status === "available") {
    return `<span class="badge badge-available">Trống</span>`;
  }

  if (status === "occupied") {
    return `<span class="badge badge-occupied">Đang thuê</span>`;
  }

  return `<span class="badge badge-maintenance">Dọn dẹp</span>`;
}

function convertStatus(status) {
  if (status === "Trống") return "available";

  if (status === "Đang thuê") return "occupied";

  return "maintenance";
}

function reverseStatus(status) {
  if (status === "available") return "Trống";

  if (status === "occupied") return "Đang thuê";

  return "Dọn dẹp";
}

// ================= FORMAT =================
function formatPrice(price) {
  return Number(price).toLocaleString("vi-VN") + " VNĐ";
}

// ================= DELETE ROOM =================
async function deleteRoom(id) {
  if (!confirm("Bạn có chắc muốn xóa phòng này?")) return;

  try {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    await loadRooms();

    alert("Xóa phòng thành công");
  } catch (err) {
    console.error(err);
  }
}

// ================= DELETE ROOM TYPE =================
async function deleteRoomType(id) {
  if (!confirm("Bạn có chắc muốn xóa loại phòng?")) return;

  try {
    await fetch(`${API_URL}/loai-phong/${id}`, {
      method: "DELETE",
    });

    await loadRoomTypes();

    alert("Xóa loại phòng thành công");
  } catch (err) {
    console.error(err);
  }
}

// ================= SEARCH =================
function setupEvents() {
  const search = document.getElementById("searchInput");

  const status = document.getElementById("filterStatus");

  const type = document.getElementById("filterType");

  if (!search) return;

  search.addEventListener("input", applyFilter);

  status.addEventListener("change", applyFilter);

  type.addEventListener("change", applyFilter);
}

function applyFilter() {
  const keyword = document
    .getElementById("searchInput")
    .value.toLowerCase();

  const status = document.getElementById("filterStatus").value;

  const type = document.getElementById("filterType").value;

  const filtered = rooms.filter((r) => {
    return (
      String(r.id).includes(keyword) &&
      (status === "" || r.status === status) &&
      (type === "" || String(r.typeId) === type)
    );
  });

  renderRooms(filtered);
}

// ================= FILTER TYPE =================
function renderTypeFilter() {
  const filter = document.getElementById("filterType");

  if (!filter) return;

  filter.innerHTML = `
        <option value="">Tất cả loại phòng</option>
    `;

  roomTypes.forEach((t) => {
    filter.innerHTML += `
            <option value="${t.id}">
                ${t.name}
            </option>
        `;
  });
}

// ================= TAB =================
function switchTab(tab) {
  document
    .querySelectorAll(".tab-content")
    .forEach((t) => t.classList.remove("active"));

  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));

  document
    .getElementById(tab + "-tab")
    .classList.add("active");

  event.target.classList.add("active");
}

// ================= VIEW DETAIL =================
function viewRoomDetail(id) {
  window.location.href = `room-detail.html?id=${id}`;
}

// ================= EDIT ROOM =================
function editRoom(id) {
  window.location.href = `edit-room.html?id=${id}`;
}

// ================= EDIT ROOM TYPE =================
async function editRoomType(id) {
  const newPrice = prompt("Nhập đơn giá mới");

  if (!newPrice) return;

  try {
    await fetch(`${API_URL}/loai-phong/${id}`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        donGia: Number(newPrice),
      }),
    });

    alert("Cập nhật thành công");

    await loadRoomTypes();
    await loadRooms();
  } catch (err) {
    console.error(err);
  }
}

// ================= EXPORT =================
window.switchTab = switchTab;

window.deleteRoom = deleteRoom;

window.deleteRoomType = deleteRoomType;

window.editRoom = editRoom;

window.editRoomType = editRoomType;

window.viewRoomDetail = viewRoomDetail;