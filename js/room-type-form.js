const API_LOAI = 'https://hotel-management-system-se104.onrender.com/api/phong/loai-phong';
 
document.addEventListener('DOMContentLoaded', () => {
  // Auto-generate mã từ tên
  const nameEl = document.getElementById('typeName');
  const codeEl = document.getElementById('typeCode');
 
  nameEl?.addEventListener('input', () => {
    if (codeEl && !codeEl.dataset.manual) {
      const initials = nameEl.value.trim().split(/\s+/).map(w => w[0]?.toUpperCase() || '').join('');
      codeEl.value = 'RT' + initials.substring(0, 3);
    }
  });
  codeEl?.addEventListener('input', () => { if (codeEl) codeEl.dataset.manual = '1'; });
});
 
async function handleSubmit(e) {
  e.preventDefault();
 
  const payload = {
    MALOAIPHONG:  document.getElementById('typeCode').value.trim().toUpperCase(),
    TENLOAIPHONG: document.getElementById('typeName').value.trim(),
    DONGIA:       Number(document.getElementById('price').value) || 0,
  };
 
  if (!payload.MALOAIPHONG || !payload.TENLOAIPHONG || !payload.DONGIA) {
    toast('Vui lòng nhập đầy đủ thông tin!', 'error');
    return;
  }
 
  const btn = e.submitter || document.querySelector('.btn-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Đang lưu...'; }
 
  try {
    const res  = await fetch(API_LOAI, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
 
    toast('Thêm loại phòng thành công!', 'success');
    setTimeout(() => { location.href = 'rooms.html'; }, 1200);
  } catch (err) {
    toast('Thêm thất bại: ' + err.message, 'error');
    if (btn) { btn.disabled = false; btn.textContent = 'Thêm loại phòng'; }
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
