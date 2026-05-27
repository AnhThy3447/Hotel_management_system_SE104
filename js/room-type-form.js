const API_BASE = "https://hotel-management-system-se104.onrender.com/api/phong/loai-phong";

document.addEventListener("DOMContentLoaded", () => {
    // Bật lại ô nhập mã loại phòng (không để disabled nữa)
    const codeInput = document.getElementById("typeCode");
    if (codeInput) {
        codeInput.disabled = false;
        codeInput.placeholder = "Nhập mã loại phòng (Ví dụ: 1, 2, 3...)";
        codeInput.value = "";
    }
});

async function handleSubmit(event) {
    event.preventDefault();

    const typeCodeValue = document.getElementById("typeCode").value.trim();

    const data = {
        id: typeCodeValue, // Đóng gói Mã loại phòng gửi lên Server
        name: document.getElementById("typeName").value.trim(),
        price: Number(document.getElementById("price").value)
    };

    // Kiểm tra tính hợp lệ dữ liệu đầu vào
    if (!data.id) {
        alert("Vui lòng nhập Mã loại phòng!");
        return;
    }
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