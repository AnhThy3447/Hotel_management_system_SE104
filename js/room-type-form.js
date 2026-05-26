const API_LOAI = 'https://hotel-management-system-se104.onrender.com/api/phong/loai-phong';

document.addEventListener('DOMContentLoaded', () => {
  // Ẩn ô nhập mã loại phòng (typeCode) vì DB tự tăng bằng SERIAL số nguyên
  const codeGroup = document.getElementById('typeCode')?.closest('.form-group');
  if (codeGroup) codeGroup.style.display = 'none';
});

async function handleSubmit(e) {
  e.preventDefault();

  // Chỉ gửi tên loại phòng và đơn giá
  const payload = {
    tenloaiphong: document.getElementById('typeName').value.trim(),
    dongia:       Number(document.getElementById('price').value) || 0,
  };

  if (!payload.tenloaiphong || !payload.dongia) {
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

    toast(`Thêm loại phòng thành công! Mã số: ${data.maloaiphong}`, 'success');
    setTimeout(() => { location.href = 'rooms.html'; }, 2000);
  } catch (err) {
    toast('Thêm thất bại: ' + err.message, 'error');
    if (btn) { btn.disabled = false; btn.textContent = 'Thêm loại phòng'; }
  }
}