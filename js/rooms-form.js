const API_URL = "https://hotel-management-system-se104.onrender.com/api/phong";

// ================= SUBMIT =================
async function handleSubmit(event) {

    event.preventDefault();

    const data = {

        loaiPhong:
            document.getElementById("typeName").value,

        donGia:
            document.getElementById("price").value
    };

    try {

        const res = await fetch(`${API_URL}/loai-phong`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        });

        if (!res.ok) {

            throw new Error("Lỗi thêm loại phòng");
        }

        alert("Thêm loại phòng thành công!");

        window.location.href = "rooms.html";

    } catch (err) {

        console.error(err);

        alert("Không thể thêm loại phòng");
    }
}

function cancelForm() {

    window.location.href = "rooms.html";
}