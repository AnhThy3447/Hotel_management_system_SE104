function createSidebar() {
    return `
        <aside class="sidebar">
            <div class="sidebar-header">
                <h1>Quản lý khách sạn</h1>
                <p>Khách sạn Paradise</p>
            </div>

            <nav class="sidebar-nav">
                <a href="dashboard.html" class="nav-item" data-page="dashboard">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <span>Trang chủ</span>
                </a>
                <a href="rooms.html" class="nav-item" data-page="rooms">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M2 4v16"></path>
                        <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                        <path d="M2 17h20"></path>
                        <path d="M6 8v9"></path>
                    </svg>
                    <span>Quản lý phòng</span>
                </a>
                <a href="booking-list.html" class="nav-item" data-page="bookings">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>Thuê phòng</span>
                </a>
                <a href="checkout-list.html" class="nav-item" data-page="checkout">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 11l3 3L22 4"></path>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                    <span>Trả phòng</span>
                </a>
                <a href="#" class="nav-item" data-page="customers">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span>Khách hàng</span>
                </a>
                <a href="invoice-list.html" class="nav-item" data-page="invoices">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                    <span>Hóa đơn</span>
                </a>
                <a href="report.html" class="nav-item" data-page="reports">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="20" x2="12" y2="10"></line>
                        <line x1="18" y1="20" x2="18" y2="4"></line>
                        <line x1="6" y1="20" x2="6" y2="16"></line>
                    </svg>
                    <span>Báo cáo</span>
                </a>
            </nav>

            <div class="sidebar-footer">
                <div class="user-profile">
                    <div class="user-avatar">A</div>
                    <div class="user-info">
                        <p>Admin</p>
                        <small>Quản trị viên</small>
                    </div>
                </div>
            </div>
        </aside>
    `;
}

function loadSidebar() {
    const container = document.getElementById('sidebar-container');
    if (container) {
        container.innerHTML = createSidebar();
        setActiveMenu();
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
