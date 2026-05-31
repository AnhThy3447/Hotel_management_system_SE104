const API_BASE = "https://hotel-management-system-se104-hgkg.onrender.com/api/phong/loai-phong";

document.addEventListener("DOMContentLoaded", async () => {
    const codeInput = document.getElementById("typeCode");

    if (codeInput) {
        const newId = await generateRoomTypeId();

        codeInput.value = newId;
        codeInput.readOnly = true;
    }
});
async function generateRoomTypeId() {
    try {
        const response = await fetch(API_BASE);
        const roomTypes = await response.json();

        if (roomTypes.length === 0) return 1;

        const maxId = Math.max(
            ...roomTypes.map(item => parseInt(item.id) || 0)
        );

        return maxId + 1;
    } catch (error) {
        console.error("Lỗi tạo mã loại phòng:", error);
        return 1;
    }
}
async function handleSubmit(event) {
    event.preventDefault();

    const typeCodeValue = document.getElementById("typeCode").value.trim();

    const data = {
        id: typeCodeValue,
        name: document.getElementById("typeName").value.trim(),
        price: Number(document.getElementById("price").value)
    };

    
    if (!data.name || !data.price) {
        alert("Vui lòng nhập đầy đủ Tên loại phòng và Đơn giá!");
        return;
    }

    try {
        const response = await fetch(API_BASE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            window.location.href = "rooms.html";
        } else {
            alert(result.error || "Có lỗi xảy ra khi tạo loại phòng.");
        }
    } catch (error) {
        alert("Lỗi kết nối máy chủ Render, không thể thêm loại phòng!");
    }
}

function cancelForm() {
    if (confirm("Bạn có chắc muốn hủy thao tác?")) {
        window.location.href = "rooms.html";
    }
}
