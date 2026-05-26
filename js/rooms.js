// ============================================================
// js/rooms.js  –  tên cột DB: sophong, maloaiphong, tenloaiphong,
//                              dongia, tinhtrang, ghichu (chữ thường)
// ============================================================

const API = 'https://hotel-management-system-se104.onrender.com/api/phong';

let rooms     = [];
let roomTypes = [];

async function http(url, opts = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message || `HTTP ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  showLoading(true);
  try {
    await Promise.all([loadRooms(), loadRoomTypes()]);
  } catch (e) {
    toast('Không tải được dữ liệu: ' + e.message, 'error');
  } finally {
    showLoading(false);
  }
  setupSearch();
});

async function loadRooms() {
  rooms = await http(API);
  renderRooms();
}

async function loadRoomTypes() {
  roomTypes = await http(`${API}/loai-phong`);
  renderRoomTypes();
  fillTypeFilter();
}

// ── RENDER ROOMS ─────────────────────────────────────────────
function renderRooms(list = rooms) {
  const tbody = document.getElementById('roomTableBody');
  const total = document.getElementById('totalRooms');
  if (!tbody) return;

  if (total) total.textContent = list.length;
  tbody.innerHTML = '';

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:#888">Không có phòng nào</td></tr>`;
    return;
  }

  list.forEach((r, i) => {
    // DB trả về chữ thường
    const id       = r.sophong      || '';
    const typeName = r.tenloaiphong || '';
    const price    = r.dongia       || 0;
    const status   = r.tinhtrang    || '';
    const notes    = r.ghichu       || '';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td><strong>${id}</strong></td>
      <td>${typeName}</td>
      <td>${fmtPrice(price)}</td>
      <td>${badge(status)}</td>
      <td>${notes}</td>
      <td class="action-cell">
        <button class="btn-action btn-edit" title="Cập nhật" onclick="editRoom('${id}')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="btn-action btn-delete" title="Xóa" onclick="deleteRoom('${id}')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
            <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
        </button>
      </td>`;

    tr.style.cursor = 'pointer';
    tr.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      location.href = `room-detail.html?id=${encodeURIComponent(id)}`;
    });
    tbody.appendChild(tr);
  });
}

// ── RENDER ROOM TYPES ────────────────────────────────────────
function renderRoomTypes(list = roomTypes) {
  const tbody = document.getElementById('room-types-table');
  const total = document.getElementById('total-types');
  if (!tbody) return;

  if (total) total.textContent = list.length;
  tbody.innerHTML = '';

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:#888">Không có loại phòng nào</td></tr>`;
    return;
  }

  list.forEach((t, i) => {
    const id    = t.maloaiphong  || '';
    const name  = t.tenloaiphong || '';   // controller đã alias loaiphong → tenloaiphong
    const price = t.dongia       || 0;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td><strong>${id}</strong></td>
      <td>${name}</td>
      <td>${fmtPrice(price)}</td>
      <td class="action-cell">
        <button class="btn-action btn-edit" title="Chỉnh đơn giá" onclick="editRoomType('${id}')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="btn-action btn-delete" title="Xóa" onclick="deleteRoomType('${id}')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
            <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
        </button>
      </td>`;
    tbody.appendChild(tr);
  });
}

// ── FILTER SELECT ────────────────────────────────────────────
function fillTypeFilter() {
  const sel = document.getElementById('filterType');
  if (!sel) return;
  while (sel.options.length > 1) sel.remove(1);
  roomTypes.forEach(t => {
    const o = document.createElement('option');
    o.value       = t.maloaiphong  || '';
    o.textContent = t.tenloaiphong || '';
    sel.appendChild(o);
  });
}

// ── DELETE ───────────────────────────────────────────────────
async function deleteRoom(id) {
  if (!confirm(`Xóa phòng ${id}?`)) return;
  try {
    await http(`${API}/${encodeURIComponent(id)}`, { method: 'DELETE' });
    toast(`Đã xóa phòng ${id}`, 'success');
    await loadRooms();
  } catch (e) {
    toast('Xóa thất bại: ' + e.message, 'error');
  }
}

async function deleteRoomType(id) {
  toast('Chức năng xóa loại phòng chưa được hỗ trợ.', 'error');
}

// ── EDIT ─────────────────────────────────────────────────────
function editRoom(id) {
  location.href = `edit-room.html?id=${encodeURIComponent(id)}`;
}

function editRoomType(id) {
  const modal = document.getElementById('changePriceFrame');
  if (modal) {
    window.openChangePrice = id;
    modal.style.display = 'flex';
  } else {
    location.href = `change-price.html?id=${encodeURIComponent(id)}`;
  }
}

// ── SEARCH & FILTER ──────────────────────────────────────────
function setupSearch() {
  ['searchInput', 'filterStatus', 'filterType'].forEach(elId => {
    document.getElementById(elId)?.addEventListener('input',  applyFilter);
    document.getElementById(elId)?.addEventListener('change', applyFilter);
  });
}

function applyFilter() {
  const kw     = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const status = document.getElementById('filterStatus')?.value || '';
  const typeId = document.getElementById('filterType')?.value   || '';

  renderRooms(rooms.filter(r =>
    (!kw     || (r.sophong || '').toLowerCase().includes(kw)) &&
    (!status || (r.tinhtrang || '').toLowerCase() === status) &&
    (!typeId || (r.maloaiphong || '') === typeId)
  ));
}

// ── TAB ──────────────────────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tab + '-tab').classList.add('active');
  event.target.classList.add('active');
}

// ── HELPERS ──────────────────────────────────────────────────
function fmtPrice(n) {
  return Number(n || 0).toLocaleString('vi-VN') + ' VNĐ';
}

function badge(status) {
  const map = {
    available:   ['Trống',    'badge-available'],
    occupied:    ['Đang thuê','badge-occupied'],
    maintenance: ['Dọn dẹp', 'badge-maintenance'],
  };
  const [label, cls] = map[(status || '').toLowerCase()] || [status, 'badge-maintenance'];
  return `<span class="badge ${cls}">${label}</span>`;
}

function showLoading(show) {
  let el = document.getElementById('_loading');
  if (!el) {
    el = document.createElement('div');
    el.id = '_loading';
    el.style.cssText = 'position:fixed;inset:0;background:rgba(255,255,255,.75);display:flex;align-items:center;justify-content:center;font-size:17px;color:#555;z-index:9999';
    el.innerHTML = '<span>⏳ Đang tải...</span>';
    document.body.appendChild(el);
  }
  el.style.display = show ? 'flex' : 'none';
}

function toast(msg, type = 'success') {
  let el = document.getElementById('_toast');
  if (!el) {
    el = document.createElement('div');
    el.id = '_toast';
    el.style.cssText = 'position:fixed;bottom:24px;right:24px;padding:12px 20px;border-radius:8px;color:#fff;font-size:14px;z-index:9999;opacity:0;transition:opacity .3s;max-width:320px;box-shadow:0 4px 12px rgba(0,0,0,.2)';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.background = type === 'success' ? '#22c55e' : '#ef4444';
  el.style.opacity = '1';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.opacity = '0'; }, 3200);
}

window.switchTab      = switchTab;
window.editRoom       = editRoom;
window.deleteRoom     = deleteRoom;
window.editRoomType   = editRoomType;
window.deleteRoomType = deleteRoomType;