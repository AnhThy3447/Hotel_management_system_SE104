const API_URL =
  'https://hotel-management-system-se104.onrender.com/api/phong';

document.addEventListener('DOMContentLoaded', () => {
    loadRoomDetail();
});

// ======================================================
// LOAD ROOM DETAIL
// ======================================================
async function loadRoomDetail() {

    const params =
        new URLSearchParams(window.location.search);

    const id = params.get('id');

    const title =
        document.getElementById('roomTitle');

    const statusEl =
        document.getElementById('roomStatus');

    const idEl =
        document.getElementById('id');

    const typeEl =
        document.getElementById('type');

    const priceEl =
        document.getElementById('price');

    const notesEl =
        document.getElementById('notes');

    if (!id) {

        if (title) {
            title.textContent =
                'Không tìm thấy phòng';
        }

        return;
    }

    try {

        if (title) {
            title.textContent =
                'Đang tải dữ liệu...';
        }

        const response =
            await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const room =
            await response.json();

        if (!room) {

            if (title) {
                title.textContent =
                    'Không tìm thấy phòng';
            }

            return;
        }

        // ================= TITLE =================

        if (title) {
            title.textContent =
                `Phòng ${room.sophong}`;
        }

        // ================= DATA =================

        if (idEl) {
            idEl.textContent =
                room.sophong || '';
        }

        if (typeEl) {
            typeEl.textContent =
                room.loaiphong || '';
        }

        if (priceEl) {
            priceEl.textContent =
                formatCurrency(room.dongia) +
                ' VNĐ';
        }

        if (notesEl) {
            notesEl.textContent =
                room.ghichu ||
                'Không có ghi chú';
        }

        // ================= STATUS =================

        renderStatus(
            room.tinhtrang,
            statusEl
        );

        // ================= EDIT BUTTON =================

        const editBtn =
            document.getElementById('editBtn');

        if (editBtn) {

            editBtn.onclick = () => {

                window.location.href =
                    `edit-room.html?id=${room.sophong}`;
            };
        }

    } catch (err) {

        console.error(
            'Lỗi load chi tiết phòng:',
            err
        );

        if (title) {
            title.textContent =
                'Lỗi tải dữ liệu';
        }

        if (notesEl) {
            notesEl.textContent =
                err.message;
        }
    }
}

// ======================================================
// RENDER STATUS
// ======================================================
function renderStatus(status, el) {

    if (!el) return;

    if (status === 'Trống') {

        el.textContent =
            'Trống';

        el.className =
            'badge badge-available';

        return;
    }

    if (status === 'Đang thuê') {

        el.textContent =
            'Đang thuê';

        el.className =
            'badge badge-occupied';

        return;
    }

    el.textContent =
        'Dọn dẹp';

    el.className =
        'badge badge-maintenance';
}

// ======================================================
// FORMAT PRICE
// ======================================================
function formatCurrency(amount) {

    return new Intl
        .NumberFormat('vi-VN')
        .format(amount || 0);
}