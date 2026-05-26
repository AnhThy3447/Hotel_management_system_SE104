const API_URL =
'https://hotel-management-system-se104.onrender.com/api/phong';

// ======================================================
// LOAD ROOM TYPES
// ======================================================

document.addEventListener('DOMContentLoaded', () => {

    loadRoomTypes();
});

async function loadRoomTypes() {

    try {

        const res =
        await fetch(`${API_URL}/loai-phong`);

        const json =
        await res.json();

        const data =
        json.data || [];

        const select =
        document.getElementById('roomType');

        select.innerHTML =
        `<option value="">-- Chọn loại phòng --</option>`;

        data.forEach(item => {

            select.innerHTML += `
                <option value="${item.maloaiphong}">
                    ${item.loaiphong}
                </option>
            `;
        });

    } catch (err) {

        console.error(err);
    }
}

// ======================================================
// SUBMIT
// ======================================================

async function handleSubmit(event) {

    event.preventDefault();

    const soPhong =
    document.getElementById('roomId').value;

    const maLoaiPhong =
    document.getElementById('roomType').value;

    const tinhTrang =
    document.getElementById('status').value;

    const ghiChu =
    document.getElementById('notes').value;

    try {

        const res =
        await fetch(`${API_URL}`, {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                soPhong,
                maLoaiPhong,
                tinhTrang,
                ghiChu
            })
        });

        const json = await res.json();

        if (!res.ok) {
            throw new Error(json.message);
        }

        alert('Thêm phòng thành công');

        window.location.href = 'rooms.html';

    } catch (err) {

        console.error(err);

        alert(err.message);
    }
}

window.handleSubmit = handleSubmit;