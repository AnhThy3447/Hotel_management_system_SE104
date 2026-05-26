const API = 'https://hotel-management-system-se104.onrender.com/api/phong';
 
document.addEventListener('DOMContentLoaded', async () => {
  // Nạp danh sách loại phòng vào <select>
  try {
    const types = await fetch(`${API}/loai-phong`).then(r => r.json());
    const sel   = document.getElementById('roomType');
    if (sel) {
      sel.innerHTML = `<option value="">-- Chọn loại phòng --</option>`;
      types.forEach(t => {
        const o = document.createElement('option');
        o.value           = t.MALOAIPHONG  || '';
        o.textContent     = t.TENLOAIPHONG || '';
        o.dataset.price   = t.DONGIA       || 0;
        sel.appendChild(o);
      });
    }
  } catch (e) {
    toast('Không tải được danh sách loại phòng', 'error');
  }
});
 
// Tự điền giá khi chọn loại phòng
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
  const payload = {
    SOPHONG:     document.getElementById('roomCode').value.trim(),
    MALOAIPHONG: sel?.value || '',
    DONGIA:      Number(document.getElementById('price').value) || 0,
    TINHTRANG:   document.getElementById('status').value,
    GHICHU:      document.getElementById('notes').value.trim(),
  };
 
  if (!payload.SOPHONG || !payload.MALOAIPHONG) {
    toast('Vui lòng nhập đầy đủ thông tin bắt buộc!', 'error');
    return;
  }
 
  const btn = e.submitter || document.querySelector('.btn-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Đang lưu...'; }
 
  try {
    const res = await fetch(API, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
 
    toast('Thêm phòng thành công!', 'success');
    setTimeout(() => { location.href = 'rooms.html'; }, 1200);
  } catch (err) {
    toast('Thêm thất bại: ' + err.message, 'error');
    if (btn) { btn.disabled = false; btn.textContent = 'Thêm phòng'; }
  }
}
 
function cancelForm() {
  if (confirm('Hủy bỏ thao tác?')) location.href = 'rooms.html';
}
 
function toast(msg, type = 'success') {
  let el = document.getElementById('_toast');
  if (!el) {
    el = Object.assign(document.createElement('div'), { id: '_toast' });
    el.style.cssText = 'position:fixed;bottom:24px;right:24px;padding:12px 20px;border-radius:8px;color:#fff;font-size:14px;z-index:9999;opacity:0;transition:opacity .3s;max-width:320px;box-shadow:0 4px 12px rgba(0,0,0,.2)';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.background = type === 'success' ? '#22c55e' : '#ef4444';
  el.style.opacity = '1';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.opacity = '0'; }, 3200);
}