const API_BASE = "https://hotel-management-system-se104-hgkg.onrender.com/api/phong";

let roomTypes = [];

document.addEventListener("DOMContentLoaded", loadRoomTypes);

async function loadRoomTypes() {
    try {
        const response = await fetch(`${API_BASE}/loai-phong`);
        
        if (!response.ok) {
            throw new Error("Không thể tải dữ liệu loại phòng");
        }

        roomTypes = await response.json();

        render();
    } catch (error) {
        console.error(error);
        alert("Lỗi tải dữ liệu loại phòng!");
    }
}

function render() {
    const tbody = document.getElementById("priceBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    roomTypes.forEach((type) => {
        tbody.innerHTML += `
            <tr>
                <td>${type.id}</td>
                <td>${type.name}</td>
                <td>
                    <input 
                        type="number"
                        class="price-input"
                        data-id="${type.id}"
                        value="${type.price}"
                    >
                </td>
            </tr>
        `;
    });
}

async function saveChanges() {
    const inputs = document.querySelectorAll(".price-input");

    try {

        for (const input of inputs) {

            const id = input.dataset.id;
            const price = Number(input.value);

            const response = await fetch(
                `${API_BASE}/loai-phong/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        price: price
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Cập nhật thất bại");
            }
        }

        alert("Cập nhật giá thành công!");

        // xóa popup
        const overlay =
            window.parent.document.getElementById("changePriceOverlay");

        if (overlay) {
            overlay.remove();
        }

        // reload rooms.html bên ngoài
        window.parent.location.reload();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

function closeModal() {

    const overlay =
        window.parent.document.getElementById("changePriceOverlay");

    if (overlay) {
        overlay.remove();
    }
}
window.saveChanges = saveChanges;
window.closeModal = closeModal;
