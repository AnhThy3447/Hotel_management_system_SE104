
function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = {};

    for (let [key, value] of formData.entries()) {
        if (key === 'amenities') {
            if (!data.amenities) data.amenities = [];
            data.amenities.push(value);
        } else {
            data[key] = value;
        }
    }

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
    .then(res => res.json())
    .then(() => {
        alert(
            '✅ Thêm loại phòng thành công!\n\n' + 
            'Tên loại: ' + data.typeName + '\n' +
            'Mã loại: ' + data.typeCode + '\n' +
            'Giá: ' + data.price.toLocaleString('vi-VN') + ' VNĐ/đêm\n' +
            'Diện tích: ' + data.area + ' m²\n' +
            'Sức chứa: ' + data.capacity + ' người\n' +
            'Số lượng phòng: ' + data.totalRooms
        );

        window.location.href = 'rooms.html';
    })
    .catch(err => {
        console.error(err);
        alert('❌ Lỗi khi thêm loại phòng!');
    });
}

function cancelForm() {
    if (confirm('Bạn có chắc muốn hủy?')) {
        location.href = 'rooms.html';
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('typeName').addEventListener('input', function(e) {
        const name = e.target.value;
        const codeInput = document.getElementById('typeCode');

        if (name && !codeInput.value) {
            const code = name.substring(0, 3).toUpperCase();
            codeInput.value = code;
        }
    });
});
