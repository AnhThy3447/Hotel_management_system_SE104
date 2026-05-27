const API_BASE = "https://hotel-management-system-se104-hgkg.onrender.com/api/phong";
let rooms = [];
let roomTypes = [];

document.addEventListener("DOMContentLoaded", () => {
    loadAllData();
    setupEvents();
});

async function loadAllData() {
    try {
        const [resRooms, resTypes] = await Promise.all([
            fetch(API_BASE),
            fetch(`${API_BASE}/loai-phong`)
        ]);

        if (resRooms.ok) rooms = await resRooms.json();
        if (resTypes.ok) roomTypes = await resTypes.json();

        renderRooms();
        renderRoomTypes();
        dynamicRenderFilterOptions();
    } catch (error) {
        console.error("Không thể kết nối đến cơ sở dữ liệu Render:", error);
    }
}

function dynamicRenderFilterOptions() {
    const filterTypeSelect = document.getElementById("filterType");
    if (!filterTypeSelect) return;
    
    filterTypeSelect.innerHTML = '<option value="">Tất cả loại phòng</option>';
    roomTypes.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t.id;
        opt.textContent = t.name;
        filterTypeSelect.appendChild(opt);
    });
}

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
            if (e.target.closest("button")) return;
            viewRoomDetail(room.id);
        });
        tbody.appendChild(tr);
    });
}

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
                <button class="btn-action btn-edit" onclick="editRoomType('${type.id}', ${type.price})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
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

function renderStatus(status) {
    if (status === "Trống" || status === "available") return `<span class="badge badge-available">Trống</span>`;
    if (status === "Đang thuê" || status === "occupied") return `<span class="badge badge-occupied">Đang thuê</span>`;
    return `<span class="badge badge-maintenance">Dọn dẹp</span>`;
}

function formatPrice(price) {
    return Number(price || 0).toLocaleString("vi-VN") + " VNĐ";
}

async function deleteRoom(id) {
    if (!confirm("Bạn có chắc muốn xóa phòng này khỏi hệ thống?")) return;
    try {
        const response = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            loadAllData();
        } else alert(result.error);
    } catch (error) {
        alert("Lỗi kết nối khi xóa phòng!");
    }
}

async function deleteRoomType(id) {
    if (!confirm("Bạn có chắc muốn xóa loại phòng này không?")) return;
    try {
        const response = await fetch(`${API_BASE}/loai-phong/${id}`, { method: "DELETE" });
        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            loadAllData();
        } else alert(result.error);
    } catch (error) {
        alert("Lỗi kết nối khi xóa loại phòng!");
    }
}

function editRoom(id) {
    window.location.href = `rooms-form.html?id=${id}`; 
}

function editRoomType(id) {

    let overlay = document.getElementById("changePriceOverlay");

    if (!overlay) {

        overlay = document.createElement("div");

        overlay.id = "changePriceOverlay";

        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.background = "rgba(0,0,0,0.5)";
        overlay.style.zIndex = "9999";
        overlay.style.display = "flex";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";

        const frame = document.createElement("iframe");

        frame.id = "changePriceFrame";

        frame.src = "change-price.html";

        frame.style.width = "80%";
        frame.style.height = "80%";
        frame.style.border = "none";
        frame.style.borderRadius = "12px";
        frame.style.background = "white";

        overlay.appendChild(frame);

        document.body.appendChild(overlay);
    }

    overlay.style.display = "flex";
}

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
    let statusFilter = document.getElementById("filterStatus").value;
    const typeFilter = document.getElementById("filterType").value;

    if (statusFilter === "available") statusFilter = "Trống";
    if (statusFilter === "occupied") statusFilter = "Đang thuê";
    if (statusFilter === "maintenance") statusFilter = "Dọn dẹp";

    let filtered = rooms.filter(r =>
        r.id.toString().toLowerCase().includes(keyword) &&
        (statusFilter === "" || r.status === statusFilter) &&
        (typeFilter === "" || r.type.toString() === typeFilter)
    );
    renderRooms(filtered);
}

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
window.editRoomType = editRoomType;
window.deleteRoom = deleteRoom;
window.deleteRoomType = deleteRoomType;
window.switchTab = switchTab;
window.viewRoomDetail = viewRoomDetail;
