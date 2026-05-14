// ================= DATA =================
let rooms = [
    {
        id: "P101",
        name: "Phòng 101",
        type: "standard",
        typeName: "Phòng tiêu chuẩn",
        floor: 1,
        price: 150000,
        status: "available",
        area: 25,
    capacity: 2,
    bedType: "double",
    amenities: ["wifi", "tv", "ac"],
    notes: "Phòng view hồ bơi"
    },
    {
        id: "P102",
        name: "Phòng 102",
        type: "deluxe",
        typeName: "Phòng cao cấp",
        floor: 1,
        price: 170000,
        status: "occupied",
        area: 25,
    capacity: 2,
    bedType: "double",
    amenities: ["wifi", "tv", "ac"],
    notes: "Phòng view hồ bơi"
    }
];

//  THÊM DATA LOẠI PHÒNG
let roomTypes = [
    {
        id: "RT01",
        name: "Phòng tiêu chuẩn",
        price: 150000,
        capacity: "1 người",
        area: "20 m²",
        bed: "1 giường đơn"
    },
    {
        id: "RT02",
        name: "Phòng cao cấp",
        price: 170000,
        capacity: "2 người",
        area: "30 m²",
        bed: "2 giường đơn"
    },
    {
        id: "RT03",
        name: "Phòng hạng sang",
        price: 200000,
        capacity: "2 người",
        area: "45 m²",
        bed: "1 giường King size + 1 giường đơn"
    }
];
document.addEventListener("DOMContentLoaded", () => {
    localStorage.setItem("rooms", JSON.stringify(rooms));
    localStorage.setItem("roomTypes", JSON.stringify(roomTypes));

    renderRooms();
    renderRoomTypes();
    setupEvents();
});
// ==========================SAVE TO LOCAL STORAGE==========================
function saveData() {
    localStorage.setItem("rooms", JSON.stringify(rooms));
    localStorage.setItem("roomTypes", JSON.stringify(roomTypes));
}
// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
    renderRooms();
    renderRoomTypes();
    setupEvents();
});

// ================= RENDER ROOMS =================
function renderRooms(list = rooms) {
    const tbody = document.getElementById("roomTableBody");
    const total = document.getElementById("totalRooms");

    if (!tbody) return;

    tbody.innerHTML = "";
    total.textContent = list.length;

    list.forEach(room => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${room.id}</td>
            <td>${room.name}</td>
            <td>${room.typeName}</td>
            <td>${room.floor}</td>
            <td>${formatPrice(room.price)}</td>
            <td>${renderStatus(room.status)}</td>
            <td>
                <button class="btn-action btn-edit" onclick="editRoom('${room.id}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="btn-action btn-delete" onclick="deleteRoom('${room.id}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                    </svg>
                </button>
            </td>
        `;
tr.style.cursor = "pointer";

    tr.addEventListener("click", (e) => {
        // tránh click nút edit/delete bị mở detail
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

    roomTypes.forEach(type => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${type.id}</td>
            <td>${type.name}</td>
            <td>${formatPrice(type.price)}</td>
            <td>${type.capacity}</td>
            <td>${type.area}</td>
            <td>${type.bed}</td>
           <td>
    <button class="btn-action btn-delete" onclick="deleteRoomType('${type.id}')" title="Xóa">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
        </svg>
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

// ================= FORMAT =================
function formatPrice(price) {
    return Number(price || 0).toLocaleString("vi-VN") + " VNĐ";
}

// ================= DELETE =================
function deleteRoom(id) {
    if (!confirm("Bạn có chắc muốn xóa phòng này?")) return;

    rooms = rooms.filter(r => r.id !== id);
    saveData();
    renderRooms();
}

function deleteRoomType(id) {
    const confirmDelete = confirm("Bạn có chắc muốn xóa loại phòng này không?");
    if (!confirmDelete) return;

    // tìm index theo id
    const index = roomTypes.findIndex(type => type.id === id);

    if (index !== -1) {
        roomTypes.splice(index, 1); // xóa khỏi mảng
        renderRoomTypes(); // render lại bảng
    }
}
// ================= EDIT =================
function editRoom(id) {
    console.log("EDIT CLICK:", id);
    window.location.href = `edit-room.html?id=${id}`;
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
    const keyword = document.getElementById("searchInput").value.toLowerCase();
    const status = document.getElementById("filterStatus").value;
    const type = document.getElementById("filterType").value;

    let filtered = rooms.filter(r =>
        (r.id.toLowerCase().includes(keyword) ||
         r.name.toLowerCase().includes(keyword)) &&
        (status === "" || r.status === status) &&
        (type === "" || r.type === type)
    );

    renderRooms(filtered);
}

// ================= TAB =================
function switchTab(tab) {
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));

    document.getElementById(tab + "-tab").classList.add("active");
    event.target.classList.add("active");

}


function viewRoomDetail(id) {
    window.location.href = `room-detail.html?id=${id}`;
}

window.editRoom = editRoom;
window.deleteRoom = deleteRoom;
window.deleteRoomType = deleteRoomType;
window.switchTab = switchTab;
window.viewRoomDetail = viewRoomDetail;
