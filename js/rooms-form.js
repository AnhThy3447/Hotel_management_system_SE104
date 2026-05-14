let rooms = JSON.parse(localStorage.getItem("rooms")) || [];

function saveRooms() {
    localStorage.setItem("rooms", JSON.stringify(rooms));
}

function handleSubmit(event) {
    event.preventDefault();

    const select = document.getElementById("roomType");
    const selectedOption = select.options[select.selectedIndex];

    const data = {
        id: document.getElementById("roomCode").value.trim(),
        name: document.getElementById("roomName").value.trim(),

        type: select.value,
        typeName: selectedOption.text,

        price: Number(document.getElementById("price").value),
        status: document.getElementById("status").value,
        notes: document.getElementById("notes").value.trim()
    };

    if (!data.id || !data.name || !data.type) {
        alert("Thiếu dữ liệu!");
        return;
    }

    if (rooms.some(r => r.id === data.id)) {
        alert("Trùng mã phòng!");
        return;
    }

    rooms.push(data);
    saveRooms();

    alert("Thêm phòng thành công!");
    window.location.href = "rooms.html";
}

function cancelForm() {
    if (confirm("Hủy?")) {
        window.location.href = "rooms.html";
    }
}
