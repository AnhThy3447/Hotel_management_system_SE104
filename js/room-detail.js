// ============================================================
// js/room-detail.js  –  tên cột DB chữ thường
// ============================================================

const API = 'https://hotel-management-system-se104.onrender.com/api/phong';

document.addEventListener('DOMContentLoaded', async () => {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) { setText('roomTitle', 'Không tìm thấy phòng'); return; }

  try {
    const rooms = await fetch(API).then(r => r.json());
    const room  = (rooms || []).find(r => r.sophong === id);

    if (!room) { setText('roomTitle', 'Không tìm thấy phòng'); return; }

    setText('roomTitle', `Phòng ${room.sophong}`);
    setText('id',    room.sophong);
    setText('type',  room.tenloaiphong || '');
    setText('price', Number(room.dongia || 0).toLocaleString('vi-VN') + ' VNĐ');
    setText('notes', room.ghichu || 'Không có ghi chú');

    // badge trạng thái
    const map = {
      available:   ['Trống',    'badge-available'],
      occupied:    ['Đang thuê','badge-occupied'],
      maintenance: ['Dọn dẹp', 'badge-maintenance'],
    };
    const [label, cls] = map[(room.tinhtrang || '').toLowerCase()] || [room.tinhtrang, 'badge-maintenance'];
    const badge = document.getElementById('roomStatus');
    if (badge) { badge.textContent = label; badge.className = `badge ${cls}`; }

    // nút cập nhật
    const btn = document.getElementById('editBtn');
    if (btn) btn.onclick = () => {
      location.href = `edit-room.html?id=${encodeURIComponent(room.sophong)}`;
    };

  } catch (e) {
    setText('roomTitle', 'Lỗi tải dữ liệu');
    console.error(e);
  }
});

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}