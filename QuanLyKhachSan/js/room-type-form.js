const API_TYPES = 'http://localhost:3000/api/room-types';

// ==========================
// SUBMIT FORM
// ==========================
function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = {
        amenities: []
    };

    for (let [key, value] of formData.entries()) {
        if (key === 'amenities') {
            data.amenities.push(value);
        } else {
            data[key] = value;
        }
    }

    // ================= VALIDATE =================
    if (!data.typeName || !data.typeCode || !data.price || !data.area || !data.capacity || !data.totalRooms) {
        alert("⚠️ Vui lòng nhập đầy đủ thông tin bắt buộc!");
        return;
    }

    // ================= CONVERT TYPE =================
    data.price = Number(data.price);
    data.area = Number(data.area);
    data.capacity = Number(data.capacity);
    data.totalRooms = Number(data.totalRooms);

    fetch(API_TYPES, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(res => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
    })
    .then(() => {

        alert(
            "✅ Thêm loại phòng thành công!\n\n" +
            "Tên loại: " + data.typeName + "\n" +
            "Mã loại: " + data.typeCode + "\n" +
            "Giá: " + data.price.toLocaleString('vi-VN') + " VNĐ/đêm\n" +
            "Diện tích: " + data.area + " m²\n" +
            "Sức chứa: " + data.capacity + " người\n" +
            "Số lượng phòng: " + data.totalRooms
        );

        // reset form
        event.target.reset();

        // quay về danh sách
        window.location.href = 'rooms.html';
    })
    .catch(err => {
        console.error(err);
        alert("❌ Lỗi khi thêm loại phòng!");
    });
}

// ==========================
// CANCEL
// ==========================
function cancelForm() {
    if (confirm('Bạn có chắc muốn hủy?')) {
        location.href = 'rooms.html';
    }
}

// ==========================
// AUTO GENERATE CODE
// ==========================
document.addEventListener("DOMContentLoaded", function () {

    const nameInput = document.getElementById('typeName');
    const codeInput = document.getElementById('typeCode');

    nameInput.addEventListener('input', function (e) {
        const name = e.target.value.trim();

        if (name && !codeInput.value) {
            const code = name
                .split(" ")
                .map(w => w[0])
                .join("")
                .substring(0, 3)
                .toUpperCase();

            codeInput.value = code;
        }
    });
});
