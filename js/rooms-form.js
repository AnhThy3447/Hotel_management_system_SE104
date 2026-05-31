const API_BASE = "https://hotel-management-system-se104-hgkg.onrender.com/api/phong";
let isEditMode = false;
let currentRoomId = null;

document.addEventListener("DOMContentLoaded", async () => {
    await fetchRoomTypesToSelect();

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const codeInput = document.getElementById("roomCode");

    if (id) {
        isEditMode = true;
        currentRoomId = id;
        setupEditMode(id);
    } else {
        // Cho phép nhập số phòng khi tạo mới
       if (codeInput) {
        const newId = await generateRoomTypeId();

        codeInput.value = newId;
        codeInput.readOnly = true;
}
    }
});
async function generateRoomTypeId() {
    try {
        const response = await fetch(`${API_BASE}/loai-phong`);
        const roomTypes = await response.json();

        if (roomTypes.length === 0) return 1;

        const maxId = Math.max(
            ...roomTypes.map(item => parseInt(item.id) || 0)
        );

        return maxId + 1;
    } catch (error) {
        console.error("Lỗi tạo mã:", error);
        return 1;
    }
}

async function fetchRoomTypesToSelect() {
    try {
        const response = await fetch(`${API_BASE}/loai-phong`);
        if (!response.ok) return;
        const types = await response.json();
        
        const select = document.getElementById("roomType");
        select.innerHTML = '<option value="">-- Chọn loại phòng --</option>';
        types.forEach(t => {
            const opt = document.createElement("option");
            opt.value = t.id;
            opt.setAttribute("data-price", t.price);
            opt.textContent = t.name;
            select.appendChild(opt);
        });
    } catch (error) {
        console.error("Lỗi đồng bộ danh mục loại phòng:", error);
    }
}

function updatePrice() {
    const select = document.getElementById("roomType");
    const selectedOption = select.options[select.selectedIndex];
    const priceInput = document.getElementById("price");
    
    if (selectedOption && selectedOption.value) {
        priceInput.value = selectedOption.getAttribute("data-price");
    } else {
        priceInput.value = "";
    }
}

async function setupEditMode(id) {
    document.querySelector(".page-header h2").textContent = "Cập nhật thông tin phòng";
    document.querySelector(".page-header p").textContent = "Chỉnh sửa thông tin chi tiết của phòng";
    document.querySelector(".btn-submit").innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg> Lưu thay đổi`;

    const codeInput = document.getElementById("roomCode");
    codeInput.value = id;
    codeInput.disabled = true; // Khóa trường Số phòng khi edit

    try {
        const response = await fetch(API_BASE);
        const rooms = await response.json();
        const room = rooms.find(r => r.id.toString() === id.toString());
        
        if (room) {
            document.getElementById("roomType").value = room.type;
            document.getElementById("price").value = room.price;
            
            const selectStatus = document.getElementById("status");
            if(room.status === "Trống") selectStatus.value = "available";
            else if(room.status === "Đang thuê") selectStatus.value = "occupied";
            else selectStatus.value = "maintenance";

            document.getElementById("notes").value = room.notes || "";
        }
    } catch (e) {
        console.error("Lỗi lấy thông tin phòng cũ:", e);
    }
}

async function handleSubmit(event) {
    event.preventDefault();

    const select = document.getElementById("roomType");
    const roomCodeValue = document.getElementById("roomCode").value.trim();

    const data = {
        type: select.value,
        status: document.getElementById("status").value,
        notes: document.getElementById("notes").value.trim()
    };

        data.id = roomCodeValue;
    }

    if (!data.type) {
        alert("Vui lòng chọn loại phòng!");
        return;
    }

    try {
        let response;
        if (isEditMode) {
            response = await fetch(`${API_BASE}/${currentRoomId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch(API_BASE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        }

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            window.location.href = "rooms.html";
        } else {
            alert(result.error || "Thao tác thất bại!");
        }
    } catch (error) {
        alert("Lỗi kết nối máy chủ Render!");
    }
}

function cancelForm() {
    if (confirm("Xác nhận hủy bỏ thao tác?")) {
        window.location.href = "rooms.html";
    }
}

window.updatePrice = updatePrice;
window.handleSubmit = handleSubmit;
window.cancelForm = cancelForm;
