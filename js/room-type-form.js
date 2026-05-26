const API_URL = "https://hotel-management-system-se104.onrender.com/api/phong";

// ================= LOAD ROOM TYPES =================
document.addEventListener("DOMContentLoaded", async () => {

    const res = await fetch(`${API_URL}/loai-phong`);

    const roomTypes = await res.json();

    const select = document.getElementById("roomType");

    roomTypes.forEach(type => {

        select.innerHTML += `
            <option value="${type.maloaiphong}">
                ${type.loaiphong}
            </option>
        `;
    });
});

// ================= SUBMIT =================
async function handleSubmit(event) {

    event.preventDefault();

    const data = {

        maLoaiPhong:
            document.getElementById("roomType").value,

        tinhTrang:
            document.getElementById("status").value,

        ghiChu:
            document.getElementById("notes").value
    };

    try {

        const res = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        });

        if (!res.ok) {

            throw new Error("Lỗi thêm phòng");
        }

        alert("Thêm phòng thành công!");

        window.location.href = "rooms.html";

    } catch (err) {

        console.error(err);

        alert("Không thể thêm phòng");
    }
}

function cancelForm() {

    window.location.href = "rooms.html";
}