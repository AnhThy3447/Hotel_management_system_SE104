const API_BASE = "https://hotel-management-system-se104.onrender.com/api/phong/loai-phong";

document.addEventListener("DOMContentLoaded", () => {
    // Vô hiệu hóa input Mã loại phòng vì DB dùng SERIAL tự tạo
    const codeInput = document.getElementById("typeCode");
    if(codeInput) {
        codeInput.disabled = true;
        codeInput.placeholder = "Hệ thống tự động sinh mã loại phòng";
    }
});

async function handleSubmit(event) {
    event.preventDefault();

    const data = {
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