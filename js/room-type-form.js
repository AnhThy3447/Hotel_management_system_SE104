const API_URL =
'https://hotel-management-system-se104.onrender.com/api/phong';

// ======================================================
// SUBMIT
// ======================================================

async function handleSubmit(event) {

    event.preventDefault();

    const loaiPhong =
    document.getElementById('typeName').value;

    const donGia =
    document.getElementById('price').value;

    try {

        const res =
        await fetch(`${API_URL}/loai-phong`, {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                loaiPhong,
                donGia
            })
        });

        const json = await res.json();

        if (!res.ok) {
            throw new Error(json.message);
        }

        alert('Thêm loại phòng thành công');

        window.location.href = 'rooms.html';

    } catch (err) {

        console.error(err);

        alert(err.message);
    }
}

window.handleSubmit = handleSubmit;