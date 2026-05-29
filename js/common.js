const API_PHANQUYEN = 'https://hotel-management-system-se104-g0le.onrender.com/api/phan-quyen';

/**
 * 1. Hàm tạo mã HTML cho Sidebar
 * CẬP NHẬT: Thêm style="display: none;" cho tất cả các tab cần bảo mật để ẩn mặc định ngay từ đầu.
 */
function createSidebar() {
    // Lấy thông tin user đăng nhập để hiển thị động dưới footer sidebar
    const currentUser = getStorageData('currentUser') || { TenDangNhap: 'Guest', NhomNguoiDung: 'Khách' };
    const shortName = currentUser.TenDangNhap ? currentUser.TenDangNhap.charAt(0).toUpperCase() : 'G';

    return `
        <aside class="sidebar">
            <div class="sidebar-header">
                <h1>Quản lý khách sạn</h1>
                <p>Khách sạn Paradise</p>
            </div>

            <nav class="sidebar-nav">
                <a href="dashboard.html" class="nav-item" data-page="dashboard" data-chucnang="1">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <span>Trang chủ</span>
                </a>
                
                <a href="rooms.html" class="nav-item" data-page="rooms" data-chucnang="2" style="display: none;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M2 4v16"></path>
                        <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                        <path d="M2 17h20"></path>
                        <path d="M6 8v9"></path>
                    </svg>
                    <span>Quản lý phòng</span>
                </a>

                <a href="booking-list.html" class="nav-item" data-page="bookings" data-chucnang="3" style="display: none;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>Thuê phòng</span>
                </a>

                <a href="customer-list.html" class="nav-item" data-page="customers" data-chucnang="4" style="display: none;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span>Khách hàng</span>
                </a>

                <a href="invoice-list.html" class="nav-item" data-page="invoices" data-chucnang="5" style="display: none;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                    <span>Hóa đơn</span>
                </a>

                <a href="report.html" class="nav-item" data-page="reports" data-chucnang="6" style="display: none;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="20" x2="12" y2="10"></line>
                        <line x1="18" y1="20" x2="18" y2="4"></line>
                        <line x1="6" y1="20" x2="6" y2="16"></line>
                    </svg>
                    <span>Báo cáo</span>
                </a>

                <a href="system-settings.html" class="nav-item" data-page="system-settings" data-chucnang="7" style="display: none;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    <span>Quản lý</span>
                </a>
            </nav>

            <div class="sidebar-footer">
                <div class="user-profile">
                    <div class="user-avatar" id="btn-logout" title="Nhấn để Đăng xuất" style="cursor: pointer;">${shortName}</div>
                    <div class="user-info">
                        <p>${currentUser.TenDangNhap || 'Guest'}</p>
                        <small>${currentUser.NhomNguoiDung || 'Khách'}</small>
                    </div>
                </div>
            </div>
        </aside>
    `;
}

/**
 * 2. Hàm kiểm tra bảo mật đăng nhập & kích hoạt phân quyền giao diện
 */
async function loadSidebar() {
    const container = document.getElementById('sidebar-container');
    if (!container) return;

    // --- KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP ---
    const currentUser = getStorageData('currentUser');
    if (!currentUser) {
        alert("Hết phiên làm việc hoặc chưa đăng nhập. Hệ thống sẽ điều hướng về trang đăng nhập!");
        window.location.href = 'index.html';
        return;
    }

    // Đổ mã HTML sidebar thô (đã ẩn sạch các tab nhạy cảm) vào vùng chứa trước
    container.innerHTML = createSidebar();
    setActiveMenu();
    addLogoutEvent(); 

    // --- TIẾN HÀNH PHÂN QUYỀN ĐỘNG ---
    const userRole = currentUser.NhomNguoiDung; 
    await apDungPhanQuyen(userRole);
}

/**
 * 3. Hàm xử lý ẩn/hiện dựa trên bộ nhớ Cache hoặc gọi API dự phòng
 * CẬP NHẬT: Ưu tiên lấy quyền từ localStorage, chỉ gọi API khi chưa có dữ liệu để chống giật UI.
 */
async function apDungPhanQuyen(userRole) {
    try {
        let cacChucNangDuocPhep = getStorageData('myPermissions');

        // Nếu trong máy chưa lưu danh sách quyền (Lần đầu đăng nhập hoặc bị xóa cache)
        if (!cacChucNangDuocPhep) {
            console.log("Chưa có cache local, tiến hành gọi API mạng...");
            const response = await fetch(`${API_PHANQUYEN}/nhomquyen`);
            if (!response.ok) throw new Error("Không thể tải cấu hình quyền từ Backend");

            const dsNhomQuyen = await response.json();
            
            const quyenCuaToi = dsNhomQuyen.find(item => 
                item.groupname && item.groupname.trim().toLowerCase() === userRole.trim().toLowerCase()
            );

            if (!quyenCuaToi || !quyenCuaToi.functions || quyenCuaToi.functions.length === 0) {
                anTatCaTabsMoRong();
                return;
            }

            cacChucNangDuocPhep = quyenCuaToi.functions.map(f => parseInt(f.MaChucNang));
            // Lưu lại vào localStorage để trang sau xài ngay lập tức
            setStorageData('myPermissions', cacChucNangDuocPhep);
        } else {
            console.log("Đã tìm thấy mảng quyền trong Cache máy, kích hoạt ngay lập tức!");
        }

        console.log("Các ID chức năng được hiển thị:", cacChucNangDuocPhep);

        // 4. KÍCH HOẠT HIỂN THỊ: Tab nào nằm trong danh sách được duyệt thì đổi style để hiện lên
        const tatCaTabs = document.querySelectorAll('[data-chucnang]');
        tatCaTabs.forEach(tab => {
            const maChucNangCuaTab = parseInt(tab.getAttribute('data-chucnang'));

            if (cacChucNangDuocPhep.includes(maChucNangCuaTab)) {
                // Đổi display về chuỗi rỗng để CSS mặc định của thẻ <a> (như flex hoặc block) tự hoạt động
                tab.style.display = ''; 
            } else {
                tab.style.display = 'none'; // Giữ ẩn nếu không có quyền
            }
        });

    } catch (error) {
        console.error("Lỗi hệ thống khi áp dụng phân quyền:", error);
        anTatCaTabsMoRong(); 
    }
}

/**
 * 4. Hàm phụ trợ ẩn menu khi gặp lỗi hệ thống
 */
function anTatCaTabsMoRong() {
    const tatCaTabs = document.querySelectorAll('[data-chucnang]');
    tatCaTabs.forEach(tab => tab.style.display = 'none');
}

/**
 * 5. Chức năng Đăng xuất ở Client
 * CẬP NHẬT: Xóa luôn cả key 'myPermissions' khi logout để người sau đăng nhập không bị dính quyền người trước.
 */
function addLogoutEvent() {
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống Khách sạn Paradise?")) {
                localStorage.removeItem('currentUser');
                localStorage.removeItem('myPermissions'); // Xóa sạch bộ nhớ quyền
                window.location.href = 'index.html';
            }
        });
    }
}

function setActiveMenu() {
    const currentPage = document.body.getAttribute('data-page');
    if (!currentPage) return;

    const menuItems = document.querySelectorAll('.nav-item');
    menuItems.forEach(item => {
        if (item.getAttribute('data-page') === currentPage) {
            item.classList.add('active');
        }
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function getStorageData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function setStorageData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

document.addEventListener('DOMContentLoaded', () => {
    loadSidebar();
});