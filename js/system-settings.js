const API_BASE = "http://localhost:3000/api/phan-quyen";

// Danh sách cố định 7 chức năng gốc dưới Database để gán vào dropdown
const DANH_SACH_CHU_NANG_GOC = [
    { id: 1, name: 'Trang chủ' },
    { id: 2, name: 'Quản lý phòng' },
    { id: 3, name: 'Thuê phòng' },
    { id: 4, name: 'Khách hàng' },
    { id: 5, name: 'Hóa đơn' },
    { id: 6, name: 'Báo cáo' },
    { id: 7, name: 'Quản lý' }
];

document.addEventListener("DOMContentLoaded", () => {
    taiDuLieuTabTaiKhoan();
    taiDuLieuTabNhomQuyen();
});

// Hàm đổi tab cơ bản
function switchSettingsTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    
    event.currentTarget.classList.add('active');
    document.getElementById(`panel-${tabName}`).classList.add('active');
}

// ==========================================
// LOGIC TAB 1: QUẢN LÝ TÀI KHOẢN
// ==========================================
async function taiDuLieuTabTaiKhoan() {
    try {
        // 1. Lấy danh sách nhân viên về đổ vào bảng
        const resUser = await fetch(`${API_BASE}/taikhoan/nhanvien`);
        const users = await resUser.json();
        
        const tbody = document.getElementById("user-table-body");
        tbody.innerHTML = "";
        
        users.forEach((user, index) => {
            tbody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${user.tendangnhap}</strong></td>
                    <td><span class="badge-local">${user.nhomnguoidung || 'Chưa phân quyền'}</span></td>
                    <td>
                        <button class="btn-secondary" onclick="openEditUserModal(${user.manhanvien}, '${user.tendangnhap}', '${user.nhomnguoidung}')">Sửa vai trò</button>
                        <button class="btn-secondary" style="color: red; border-color: #fca5a5;" onclick="xuLyXoaNhanVien(${user.manhanvien})">Xóa</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Lỗi tải danh sách tài khoản:", err);
    }
}

// Đổ danh sách nhóm quyền vào thẻ select của form thêm tài khoản
function dongBoDropdownNhomQuyen(danhSachNhom) {
    const select = document.getElementById("select-group");
    const modalSelect = document.getElementById("edit-user-role-select");
    
    const htmlOptions = danhSachNhom.map(n => `<option value="${n.tennhom}">${n.tennhom}</option>`).join("");
    select.innerHTML = htmlOptions;
    modalSelect.innerHTML = htmlOptions;
}

// Bắt sự kiện submit form Thêm nhân viên mới
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
        alert(data.message);
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


// ==========================================
// LOGIC TAB 2: NHÓM QUYỀN VÀ CÁC TAG CHỨC NĂNG
// ==========================================
async function taiDuLieuTabNhomQuyen() {
    try {
        const res = await fetch(`${API_BASE}/nhomquyen`);
        const rolesData = await res.json();
        
        dongBoDropdownNhomQuyen(rolesData);
        
        const tbody = document.getElementById("role-table-body");
        tbody.innerHTML = "";
        
        rolesData.forEach(role => {
            // Render mảng tag quyền màu vàng có dấu X
            let tagsHtml = role.danhsachchucnang.map(c => `
                <span class="permission-tag">
                    ${c.TenChucNang}
                    <button class="btn-delete-tag" onclick="xuLyXoaChucNangLe('${role.tennhom}', ${c.MaChucNang})">&times;</button>
                </span>
            `).join("");
            
            if (role.danhsachchucnang.length === 0) {
                tagsHtml = `<em style="color:#9ca3af; font-size:13px;">Chưa gán chức năng nào</em>`;
            }

            // Dựng thẻ select dropdown chứa các quyền chưa được gán để quản lý chọn nhanh
            let optionsSelect = DANH_SACH_CHU_NANG_GOC
                .filter(goc => !role.danhsachchucnang.some(daCo => daCo.MaChucNang === goc.id))
                .map(goc => `<option value="${goc.id}">${goc.name}</option>`).join("");

            let actionCellHtml = optionsSelect 
                ? `<select class="form-input" onchange="xuLyThemChucNangLe('${role.tennhom}', this)" style="padding:4px 8px; font-size:12px;">
                        <option value="">+ Thêm chức năng</option>
                        ${optionsSelect}
                   </select>`
                : `<span style="font-size:12px; color:green;">Full chức năng</span>`;

            tbody.innerHTML += `
                <tr>
                    <td><strong>${role.tennhom}</strong></td>
                    <td><div class="tag-container">${tagsHtml}</div></td>
                    <td>
                        ${actionCellHtml}
                        <button class="btn-secondary" style="color:red; border:none; padding:4px; margin-left:8px;" onclick="xuLyXoaNhomQuyen('${role.tennhom}')">Xóa nhóm</button>
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
        body: JSON.stringify({ TenNhom, DanhSachMaChucNang: [1] }) // Mặc định cấp quyền Trang chủ khi tạo mới
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

// ==========================================
// LOGIC TAB 3: QUY ĐỊNH KHÁCH SẠN
// ==========================================
function openRuleModal(ruleId, currentValue) {
    document.getElementById("edit-rule-id").value = ruleId;
    document.getElementById("input-rule-value").value = currentValue;
    document.getElementById("label-rule-name").innerText = ruleId === 'max-guests' ? "Số khách tối đa trong phòng:" : "Tỷ lệ phụ thu (%):";
    document.getElementById("edit-rule-modal").classList.add("open");
}

function xuLyLuuQuyDinh() {
    const ruleId = document.getElementById("edit-rule-id").value;
    const value = document.getElementById("input-rule-value").value;
    
    // Đổ ngược giá trị ra UI sau khi lưu thành công
    if (ruleId === 'max-guests') {
        document.getElementById("val-max-guests").innerText = `${value} người`;
    } else {
        document.getElementById("val-surcharge").innerText = `${value}%`;
    }
    // Ở đây bạn có thể gọi thêm fetch() đến đường dẫn /api/quy-dinh của bạn để đồng bộ DB
    closeModal('edit-rule-modal');
    alert("Cập nhật tham số quy định thành công!");
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove("open");
}