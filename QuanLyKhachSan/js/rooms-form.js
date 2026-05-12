

// ==========================
// AUTO UPDATE PRICE
// ==========================
function updatePrice() {
    const select = document.getElementById('roomType');
    const selected = select.options[select.selectedIndex];
    const price = selected.getAttribute('data-price');

    if (price) {
        document.getElementById('price').value = price;
    }
}

// ==========================
// GET AMENITIES
// ==========================
function getAmenities() {
    const checked = document.querySelectorAll('input[name="amenities"]:checked');
    return Array.from(checked).map(item => item.value);
}

// ==========================
// SUBMIT FORM
// ==========================
async function handleSubmit(event) {
    event.preventDefault();

    const data = {
        roomCode: document.getElementById('roomCode').value.trim(),
        roomName: document.getElementById('roomName').value.trim(),
        roomType: document.getElementById('roomType').value,
        floor: document.getElementById('floor').value,
        price: Number(document.getElementById('price').value),
        status: document.getElementById('status').value,
        area: Number(document.getElementById('area').value) || null,
        capacity: Number(document.getElementById('capacity').value) || null,
        beds: document.getElementById('beds').value,
        view: document.getElementById('view').value,
        amenities: getAmenities(),
        description: document.getElementById('description').value
    };

    // Validate
    if (!data.roomCode || !data.roomName) {
        alert('Vui lòng nhập đầy đủ thông tin!');
        return;
    }

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error();

        alert('Thêm phòng thành công!');
        window.location.href = 'rooms.html';

    } catch (err) {
        console.error(err);
        alert('Lỗi kết nối server!');
    }
}

// ==========================
// CANCEL
// ==========================
function cancelForm() {
    if (confirm('Bạn có chắc muốn hủy?')) {
        window.location.href = 'rooms.html';
    }
}
