// ==========================
// LOAD STORAGE
// ==========================
let roomTypes = JSON.parse(localStorage.getItem("roomTypes")) || [];

// ==========================
// SUBMIT FORM
// ==========================
function handleSubmit(event) {
    event.preventDefault();

    const data = {
        id: document.getElementById("typeCode").value.trim(),
        name: document.getElementById("typeName").value.trim(),
        price: Number(document.getElementById("price").value),
        
    };

    // VALIDATE
    if (!data.id || !data.name || !data.price ) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    // CHECK TRÙNG
    const exists = roomTypes.some(t => t.id === data.id);
    if (exists) {
        alert("Mã loại phòng đã tồn tại!");
        return;
    }

    // THÊM MỚI
    roomTypes.push(data);

    // SAVE
    localStorage.setItem("roomTypes", JSON.stringify(roomTypes));

    // THÔNG BÁO
    alert("Thêm loại phòng thành công!");

    // QUAY LẠI
    window.location.href = "rooms.html";
}

// ==========================
// CANCEL
// ==========================
function cancelForm() {
    if (confirm("Bạn có chắc muốn hủy?")) {
        window.location.href = "rooms.html";
    }
}

// ==========================
// AUTO CODE
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    const nameInput = document.getElementById("typeName");
    const codeInput = document.getElementById("typeCode");

    nameInput.addEventListener("input", () => {
        const name = nameInput.value.trim();

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
