const API_BASE = 'https://hotel-management-system-se104-g0le.onrender.com/api/phan-quyen';
const API_QUYDINH = 'https://hotel-management-system-se104-g0le.onrender.com/api/quy-dinh';

// Biến toàn cục hứng danh mục chức năng load từ DB
let danhSachChucNangGocTuDB = [];

document.addEventListener("DOMContentLoaded", async () => {
    // Gọi nạp danh mục chức năng hệ thống trước
    await taiDanhMucChucNangGoc();
    
    // Đổ dữ liệu các phân hệ bảng
    taiDuLieuTabTaiKhoan();
    taiDuLieuTabNhomQuyen();
    taiDuLieuTabQuyDinhHethong(); // Kích hoạt luồng nạp 3 khung quy định mới
});

// Gọi API lấy dữ liệu thực tế từ bảng gốc dưới Database
async function taiDanhMucChucNangGoc() {
    try {
        const res = await fetch(`${API_BASE}/danh-muc-chuc-nang`);
        danhSachChucNangGocTuDB = await res.json();
    } catch (err) {
        console.error("Không thể tải danh mục chức năng từ DB, đang dùng dữ liệu dự phòng:", err);
        danhSachChucNangGocTuDB = [
            { id: 1, name: 'Trang chủ' }, { id: 2, name: 'Quản lý phòng' }, 
            { id: 3, name: 'Thuê phòng' }, { id: 4, name: 'Khách hàng' }, 
            { id: 5, name: 'Hóa đơn' }, { id: 6, name: 'Báo cáo' }, { id: 7, name: 'Quản lý' }
        ];
    }
}

// Hàm đổi tab cơ bản
function switchSettingsTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    
    event.currentTarget.classList.add('active');
    document.getElementById(`panel-${tabName}`).classList.add('active');
}

// ==========================================================================
// LOGIC TAB 1: QUẢN LÝ TÀI KHOẢN
// ==========================================================================
async function taiDuLieuTabTaiKhoan() {
    try {
        const resUser = await fetch(`${API_BASE}/taikhoan/nhanvien`);
        const users = await resUser.json();
        
        const tbody = document.getElementById("user-table-body");
        tbody.innerHTML = "";
        
        users.forEach((user, index) => {
            tbody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${user.username}</strong></td>
                    <td><span class="badge-local">${user.role || 'Chưa phân quyền'}</span></td>
                    <td>
                        <div class="actions">
                            <button class="btn-icon btn-edit" onclick="openEditUserModal(${user.id}, '${user.username}', '${user.role}')" title="Sửa vai trò">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button class="btn-icon btn-delete" onclick="xuLyXoaNhanVien(${user.id})" title="Xóa tài khoản">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Lỗi tải danh sách tài khoản:", err);
    }
}

function dongBoDropdownNhomQuyen(danhSachNhom) {
    const select = document.getElementById("select-group");
    const modalSelect = document.getElementById("edit-user-role-select");
    
    const htmlOptions = danhSachNhom.map(n => `<option value="${n.groupname}">${n.groupname}</option>`).join("");
    if (select) select.innerHTML = htmlOptions;
    if (modalSelect) modalSelect.innerHTML = htmlOptions;
}

document.getElementById("form-them-nhan-vien").addEventListener("submit", async (e) => {
    e.preventDefault();
    const TenDangNhap = document.getElementById("input-username").value;
    const MatKhau = document.getElementById("input-password").value;
    const NhomNguoiDung = document.getElementById("select-group").value;

    try {
        const res = await fetch(`${API_BASE}/taikhoan/nhanvien/them`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ TenDangNhap, MatKhau, NhomNguoiDung })
        });
        const data = await res.json();
        alert(data.message || data.error);
        if (res.ok) {
            document.getElementById("form-them-nhan-vien").reset();
            taiDuLieuTabTaiKhoan();
        }
    } catch (err) {
        alert("Không thể kết nối đến máy chủ Backend!");
    }
});

function openEditUserModal(id, name, currentRole) {
    document.getElementById("edit-user-id").value = id;
    document.getElementById("edit-user-name").value = name;
    document.getElementById("edit-user-role-select").value = currentRole;
    document.getElementById("edit-user-modal").classList.add("open");
}

async function xuLyLuuQuyenNhanVien() {
    const id = document.getElementById("edit-user-id").value;
    const NhomNguoiDung = document.getElementById("edit-user-role-select").value;

    const res = await fetch(`${API_BASE}/taikhoan/nhanvien/capnhat/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ NhomNguoiDung })
    });
    if (res.ok) {
        closeModal('edit-user-modal');
        taiDuLieuTabTaiKhoan();
    }
}

async function xuLyXoaNhanVien(id) {
    if (confirm("Bạn có chắc chắn muốn xóa (ẩn) tài khoản nhân viên này?")) {
        const res = await fetch(`${API_BASE}/taikhoan/nhanvien/xoa/${id}`, { method: "DELETE" });
        if (res.ok) taiDuLieuTabTaiKhoan();
    }
}

// ==========================================================================
// LOGIC TAB 2: NHÓM QUYỀN VÀ CÁC TAG CHỨC NĂNG
// ==========================================================================
async function taiDuLieuTabNhomQuyen() {
    try {
        const res = await fetch(`${API_BASE}/nhomquyen`);
        const rolesData = await res.json();
        
        dongBoDropdownNhomQuyen(rolesData);
        
        const tbody = document.getElementById("role-table-body");
        tbody.innerHTML = "";
        
        rolesData.forEach(role => {
            let tagsHtml = role.functions.map(c => `
                <span class="permission-tag">
                    ${c.TenChucNang}
                    <button class="btn-delete-tag" onclick="xuLyXoaChucNangLe('${role.groupname}', ${c.MaChucNang})">&times;</button>
                </span>
            `).join("");
            
            if (role.functions.length === 0) {
                tagsHtml = `<em style="color:#9ca3af; font-size:13px;">Chưa gán chức năng nào</em>`;
            }

            let optionsSelect = danhSachChucNangGocTuDB
                .filter(goc => !role.functions.some(daCo => daCo.MaChucNang === goc.id))
                .map(goc => `<option value="${goc.id}">${goc.name}</option>`).join("");

            let actionCellHtml = optionsSelect 
                ? `<select class="form-input" onchange="xuLyThemChucNangLe('${role.groupname}', this)" style="padding:4px 8px; font-size:12px;">
                        <option value=""> Thêm chức năng</option>
                        ${optionsSelect}
                   </select>`
                : `<span style="font-size:12px; color:green;">Full chức năng</span>`;

            tbody.innerHTML += `
                <tr>
                    <td><strong>${role.groupname}</strong></td>
                    <td><div class="tag-container">${tagsHtml}</div></td>
                    <td>
                        <div style="margin-bottom: 8px;">
                            ${actionCellHtml}
                        </div>
                        <div>
                            <button class="btn-delete-group" onclick="xuLyXoaNhomQuyen('${role.groupname}')">Xóa nhóm</button>
                        </div>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Lỗi tải danh sách cấu hình nhóm quyền:", err);
    }
}

async function xuLyThemNhomQuyen() {
    const TenNhom = document.getElementById("new-role-name").value;
    if (!TenNhom) return alert("Vui lòng điền tên nhóm!");
    
    const res = await fetch(`${API_BASE}/nhomquyen/them`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TenNhom, DanhSachMaChucNang: [1] })
    });
    if (res.ok) {
        document.getElementById("new-role-name").value = "";
        taiDuLieuTabNhomQuyen();
    }
}

async function xuLyThemChucNangLe(TenNhom, selectElement) {
    const MaChucNang = selectElement.value;
    if (!MaChucNang) return;

    const res = await fetch(`${API_BASE}/nhomquyen/chucnang/them`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TenNhom, MaChucNang: parseInt(MaChucNang) })
    });
    if (res.ok) taiDuLieuTabNhomQuyen();
}

async function xuLyXoaChucNangLe(TenNhom, MaChucNang) {
    const res = await fetch(`${API_BASE}/nhomquyen/chucnang/xoa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TenNhom, MaChucNang })
    });
    if (res.ok) taiDuLieuTabNhomQuyen();
}

async function xuLyXoaNhomQuyen(tenNhom) {
    if (confirm(`Xóa nhóm '${tenNhom}' sẽ làm ẩn toàn bộ nhân viên thuộc nhóm này. Xác nhận xóa?`)) {
        const res = await fetch(`${API_BASE}/nhomquyen/xoa/${tenNhom}`, { method: "DELETE" });
        if (res.ok) {
            taiDuLieuTabNhomQuyen();
            taiDuLieuTabTaiKhoan();
        }
    }
}

// ==========================================================================
// LOGIC TAB 3: QUY ĐỊNH KHÁCH SẠN (XỬ LÝ ĐỒNG BỘ 3 KHUNG ĐỘNG CHẠY TUẦN TỰ)
// ==========================================================================
let luuTruSoKhachKhongTinhPhi = 2; // Biến tạm lưu mốc phụ thu để lọc bảng TILEPHUTHU

async function taiDuLieuTabQuyDinhHethong() {
    try {
        // TẢI BẢNG THAM SỐ GỐC TRƯỚC ĐỂ LẤY MỐC
        const resTS = await fetch(`${API_QUYDINH}/tham-so`);
        const jsonTS = await resTS.json();
        const tbodyTS = document.getElementById("param-table-body");
        tbodyTS.innerHTML = "";

        if (jsonTS.success && jsonTS.data) {
            jsonTS.data.forEach(ts => {
                if (ts.tenthamso === 'Số khách không tính phí phụ thu') {
                    luuTruSoKhachKhongTinhPhi = parseInt(ts.giatri); 
                }
                
                tbodyTS.innerHTML += `
                    <tr>
                        <td><strong>${ts.tenthamso}</strong></td>
                        <td><strong>${ts.giatri} người</strong></td>
                        <td>
                            <div class="actions">
                                <button class="btn-icon btn-edit" onclick="openParamModal('${ts.tenthamso}', ${ts.giatri})" title="Chỉnh sửa tham số">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }

        // TẢI DANH MỤC LOẠI KHÁCH (Đã sửa đổi lk.name -> lk.name chuẩn khít Backend)
        const resLK = await fetch(`${API_QUYDINH}/loai-khach`);
        const jsonLK = await resLK.json();
        const tbodyLK = document.getElementById("guest-type-table-body");
        tbodyLK.innerHTML = "";

        if (jsonLK.success && jsonLK.data) {
            jsonLK.data.forEach((lk, idx) => {
                tbodyLK.innerHTML += `
                    <tr>
                        <td><strong>${lk.name}</strong></td>
                        <td><strong>${lk.surcharge}</strong></td>
                        <td>
                            <div class="actions">
                                <button class="btn-icon btn-edit" onclick="openEditGuestTypeModal(${lk.id}, '${lk.name}', ${lk.surcharge})" title="Sửa loại khách">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                                <button class="btn-icon btn-delete" onclick="xuLyXoaLoaiKhach(${lk.id})" title="Xóa loại khách">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }

        // TẢI BẢNG PHỤ THU THEO THỨ TỰ KHÁCH
        const resPT = await fetch(`${API_QUYDINH}/phu-thu`);
        const jsonPT = await resPT.json();
        const tbodyPT = document.getElementById("surcharge-table-body");
        tbodyPT.innerHTML = "";

        if (jsonPT.success && jsonPT.data) {
            // Lọc chính xác: Chỉ hiện các dòng có số thứ tự lớn hơn mốc miễn phí
            const danhSachLoc = jsonPT.data.filter(pt => pt.ThuTuKhach > luuTruSoKhachKhongTinhPhi);
            
            if (danhSachLoc.length === 0) {
                tbodyPT.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#9ca3af;">Không có dòng phụ thu nào (Số khách tối đa nhỏ hơn hoặc bằng mốc tính phí)</td></tr>`;
            } else {
                danhSachLoc.forEach(pt => {
                    tbodyPT.innerHTML += `
                        <tr>
                            <td><strong>Khách thứ ${pt.ThuTuKhach}</strong></td>
                            <td><strong>${pt.HeSoPhuThu}</strong></td>
                            <td>
                                <div class="actions">
                                    <button class="btn-icon btn-edit" onclick="openSurchargeModal(${pt.ThuTuKhach}, ${pt.HeSoPhuThu})" title="Chỉnh sửa mức phạt">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                });
            }
        }

    } catch (err) {
        console.error("Lỗi đồng bộ dữ liệu quy định hệ thống:", err);
    }
}

// ── CÁC HÀM XỬ LÝ ĐIỀU KHIỂN MODAL ──

function openParamModal(id, val) {
    document.getElementById("edit-param-id").value = id;
    document.getElementById("input-param-value").value = val;
    document.getElementById("label-param-title").innerText = id === 'Số khách tối đa trong phòng' ? "Số khách tối đa trong phòng:" : "Số khách không tính phí phụ thu:";
    document.getElementById("modal-edit-param").classList.add("open");
}

async function xuLyLuuThamSo() {
    const TenThamSo = document.getElementById("edit-param-id").value;
    const GiaTri = parseInt(document.getElementById("input-param-value").value);

    if (isNaN(GiaTri) || GiaTri < 1) return alert("Vui lòng nhập số nguyên lớn hơn 0!");

    // Kiểm tra ràng buộc: số khách tối đa >= số khách không tính phí
    if (TenThamSo === 'Số khách tối đa trong phòng' && GiaTri < luuTruSoKhachKhongTinhPhi) {
        return alert(`Số khách tối đa (${GiaTri}) không được nhỏ hơn số khách không tính phí (${luuTruSoKhachKhongTinhPhi})!`);
    }
    if (TenThamSo === 'Số khách không tính phí phụ thu') {
        // Đọc số khách tối đa hiện tại để kiểm tra
        try {
            const resTS = await fetch(`${API_QUYDINH}/tham-so`);
            const jsonTS = await resTS.json();
            const soMax = (jsonTS.data || []).find(t =>
                t.tenthamso === 'Số khách tối đa trong phòng' || t.tenthamso === 'Số khách tối đa'
            );
            if (soMax && GiaTri > parseInt(soMax.giatri)) {
                return alert(`Số khách không tính phí (${GiaTri}) không được lớn hơn số khách tối đa (${soMax.giatri})!`);
            }
        } catch (e) { /* bỏ qua nếu không lấy được */ }
    }

    const res = await fetch(`${API_QUYDINH}/tham-so/cap-nhat`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TenThamSo, GiaTri })
    });
    if (res.ok) {
        if (TenThamSo === 'Số khách không tính phí phụ thu') {
            luuTruSoKhachKhongTinhPhi = GiaTri;
        }
        closeModal('modal-edit-param');
        taiDuLieuTabQuyDinhHethong();
    } else {
        const errJson = await res.json().catch(() => ({}));
        alert("Lỗi lưu tham số: " + (errJson.message || res.status));
    }
}

function openSurchargeModal(thuTu, heSo) {
    document.getElementById("edit-surcharge-thutu").value = thuTu;
    document.getElementById("input-surcharge-value").value = heSo;
    document.getElementById("modal-edit-surcharge").classList.add("open");
}

async function xuLyLuuPhuThu() {
    const thuTu = document.getElementById("edit-surcharge-thutu").value;
    const HeSoPhuThu = parseFloat(document.getElementById("input-surcharge-value").value);

    if (isNaN(HeSoPhuThu) || HeSoPhuThu <= 0) return alert("Hệ số phụ thu phải là số dương!");

    const res = await fetch(`${API_QUYDINH}/phu-thu/cap-nhat/${thuTu}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ HeSoPhuThu })
    });
    if (res.ok) {
        closeModal('modal-edit-surcharge');
        taiDuLieuTabQuyDinhHethong();
    } else {
        const errJson = await res.json().catch(() => ({}));
        alert("Lỗi lưu phụ thu: " + (errJson.message || res.status));
    }
}

// ── THAO TÁC CRUD LOẠI KHÁCH ──

function openAddGuestTypeModal() {
    document.getElementById("form-loai-khach").reset();
    document.getElementById("edit-guest-id").value = "";
    document.getElementById("modal-guest-title").innerText = "Thêm loại khách mới";
    document.getElementById("modal-guest-type").classList.add("open");
}

function openEditGuestTypeModal(id, name, surcharge) {
    document.getElementById("edit-guest-id").value = id;
    document.getElementById("input-guest-name").value = name;
    document.getElementById("input-guest-surcharge").value = surcharge;
    document.getElementById("modal-guest-title").innerText = "Chỉnh sửa loại khách";
    document.getElementById("modal-guest-type").classList.add("open");
}

async function xuLyLuuLoaiKhach() {
    const id = document.getElementById("edit-guest-id").value;
    const LoaiKhach = document.getElementById("input-guest-name").value.trim();
    const HeSoPhuThu = parseFloat(document.getElementById("input-guest-surcharge").value);

    if (!LoaiKhach) return alert("Vui lòng không để trống tên loại khách!");
    if (isNaN(HeSoPhuThu) || HeSoPhuThu < 1.0) {
        return alert("Hệ số phụ thu phải >= 1.0 (1.0 = không phụ thu, 1.5 = +50%)");
    }

    let url = `${API_QUYDINH}/loai-khach/them`;
    let method = "POST";

    if (id) { 
        url = `${API_QUYDINH}/loai-khach/sua/${id}`;
        method = "PUT";
    }

    const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ LoaiKhach, HeSoPhuThu })
    });
    
    if (res.ok) {
        closeModal('modal-guest-type');
        taiDuLieuTabQuyDinhHethong();
    } else {
        const errJson = await res.json().catch(() => ({}));
        alert("Lỗi lưu loại khách: " + (errJson.message || res.status));
    }
}

async function xuLyXoaLoaiKhach(id) {
    if (confirm("Xác nhận xóa loại khách này ra khỏi hệ thống vận hành?\n\nLưu ý: Các phiếu thuê cũ có loại khách này vẫn giữ nguyên dữ liệu.")) {
        const res = await fetch(`${API_QUYDINH}/loai-khach/xoa/${id}`, { method: "DELETE" });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
            taiDuLieuTabQuyDinhHethong();
        } else {
            alert("Không thể xóa: " + (data.message || res.status));
        }
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove("open");
}