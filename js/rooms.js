const API_URL = "https://hotel-management-system-se104.onrender.com/api/phong";

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

        const res = await fetch(API_URL);

        rooms = await res.json();

        renderRooms();

    } catch (err) {

        console.error(err);

        alert("Không thể tải danh sách phòng");
    }
}

// ================= LOAD ROOM TYPES =================
async function loadRoomTypes() {

    try {

        const res = await fetch(`${API_URL}/loai-phong`);

        roomTypes = await res.json();

        renderRoomTypes();

    } catch (err) {

        console.error(err);

        alert("Không thể tải loại phòng");
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

        tbody.innerHTML += `
            <tr onclick="viewRoomDetail(${room.sophong})">

                <td>${index + 1}</td>

                <td>${room.sophong}</td>

                <td>${room.loaiphong}</td>

                <td>${formatPrice(room.dongia)}</td>

                <td>${room.tinhtrang}</td>

                <td>${room.ghichu || ""}</td>

                <td>

                    <button onclick="event.stopPropagation(); deleteRoom(${room.sophong})">
                        Xóa
                    </button>

                </td>

            </tr>
        `;
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

        tbody.innerHTML += `
            <tr>

                <td>${index + 1}</td>

                <td>${type.maloaiphong}</td>

                <td>${type.loaiphong}</td>

                <td>${formatPrice(type.dongia)}</td>

                <td>

                    <button onclick="deleteRoomType(${type.maloaiphong})">
                        Xóa
                    </button>

                </td>

            </tr>
        `;
    });
}

// ================= DELETE ROOM =================
async function deleteRoom(id) {

    if (!confirm("Xóa phòng này?")) return;

    await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    loadRooms();
}

// ================= DELETE ROOM TYPE =================
async function deleteRoomType(id) {

    if (!confirm("Xóa loại phòng?")) return;

    await fetch(`${API_URL}/loai-phong/${id}`, {
        method: "DELETE"
    });

    loadRoomTypes();
}

// ================= SEARCH =================
function setupEvents() {

    const search = document.getElementById("searchInput");

    if (!search) return;

    search.addEventListener("input", applyFilter);
}

function applyFilter() {

    const keyword = document
        .getElementById("searchInput")
        .value
        .toLowerCase();

    const filtered = rooms.filter(r =>
        String(r.sophong)
            .toLowerCase()
            .includes(keyword)
    );

    renderRooms(filtered);
}

// ================= FORMAT =================
function formatPrice(price) {

    return Number(price).toLocaleString("vi-VN") + " VNĐ";
}

// ================= DETAIL =================
function viewRoomDetail(id) {

    window.location.href = `room-detail.html?id=${id}`;
}

window.deleteRoom = deleteRoom;
window.deleteRoomType = deleteRoomType;
window.viewRoomDetail = viewRoomDetail;