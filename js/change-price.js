let roomTypes = JSON.parse(localStorage.getItem("roomTypes")) || [];
let rooms = JSON.parse(localStorage.getItem("rooms")) || [];

document.addEventListener("DOMContentLoaded", render);

function render() {
    const tbody = document.getElementById("priceBody");
    tbody.innerHTML = "";

    roomTypes.forEach((type) => {
        tbody.innerHTML += `
            <tr>
                <td>${type.id}</td>
                <td>${type.name}</td>
                <td>
                    <input type="number"
                        class="price-input"
                        data-id="${type.id}"
                        value="${type.price}">
                </td>
            </tr>
        `;
    });
}

function saveChanges() {
    const inputs = document.querySelectorAll(".price-input");

    inputs.forEach(input => {
        const id = input.dataset.id;
        const type = roomTypes.find(t => t.id === id);

        if (type) {
            type.price = Number(input.value);
        }
    });

    localStorage.setItem("roomTypes", JSON.stringify(roomTypes));

    // sync rooms
    rooms.forEach(r => {
        const match = roomTypes.find(t => t.name === r.typeName);
        if (match) {
            r.price = match.price;
        }
    });

    localStorage.setItem("rooms", JSON.stringify(rooms));

    alert("Cập nhật giá thành công!");

    // đóng modal
    window.parent.document.getElementById("changePriceFrame").style.display = "none";

    window.parent.location.reload();
}

function closeModal() {
    window.parent.document.getElementById("changePriceFrame").style.display = "none";
}