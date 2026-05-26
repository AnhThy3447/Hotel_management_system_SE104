const API = 'https://hotel-management-system-se104.onrender.com/api/phong';
// Mẹo: Nếu đang test ở máy cá nhân (Local), hãy đổi link trên thành 'http://localhost:3000/api/phong'

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const types = await fetch(`${API}/loai-phong`).then(r => r.json());
    const sel   = document.getElementById('roomType');
    if (sel) {
      sel.innerHTML = `<option value="">-- Chọn loại phòng --</option>`;
      (types || []).forEach(t => {
        const o = document.createElement('option');
        o.value           = t.maloaiphong;  // Bản chất là ID Số (Ví dụ: 1, 2, 3)
        o.textContent     = t.tenloaiphong; 
        o.dataset.price   = t.dongia        || 0;
        sel.appendChild(o);
      });
    }

    // Ẩn input giá vì bảng phong không có cột dongia riêng
    const priceGroup = document.getElementById('price')?.closest('.form-group');
    if (priceGroup) priceGroup.style.display = 'none';

    // Ẩn luôn ô nhập Số Phòng vì DB tự tăng (SERIAL)
    const roomCodeGroup = document.getElementById('roomCode')?.closest('.form-group');
    if (roomCodeGroup) roomCodeGroup.style.display = 'none';

  } catch (e) {
    toast('Không tải được danh sách loại phòng', 'error');
  }
});

function updatePrice() {
  const sel = document.getElementById('roomType');
  const opt = sel?.options[sel.selectedIndex];
  const inp = document.getElementById('price');
  if (opt && inp) inp.value = opt.dataset.price || '';
}
window.updatePrice = updatePrice;

async function handleSubmit(e) {
  e.preventDefault();

  const sel = document.getElementById('roomType');
  
  // KHÔNG gửi sophong lên nữa vì Database tự sinh
  const payload = {
    maloaiphong: parseInt(sel?.value, 10) || '',
    tinhtrang:   document.getElementById('status').value || 'Trống',
    ghichu:      document.getElementById('notes').value.trim(),
  };

  if (!payload.maloaiphong) {
    toast('Vui lòng chọn loại phòng!', 'error');
    return;
  }

  const btn = e.submitter || document.querySelector('.btn-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Đang lưu...'; }

  try {
    const res  = await fetch(API, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

    toast(`Thêm phòng thành công! Số phòng hệ thống cấp là: ${data.sophong}`, 'success');
    setTimeout(() => { location.href = 'rooms.html'; }, 2000);
  } catch (err) {
    toast('Thêm thất bại: ' + err.message, 'error');
    if (btn) { btn.disabled = false; btn.textContent = 'Thêm phòng'; }
  }
}