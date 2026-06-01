const API_BASE = 'https://hotel-management-system-se104-g0le.onrender.com/api/phan-quyen';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm'); // ID của thẻ <form> đăng nhập

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Tích hợp tính năng ẩn/hiện mật khẩu bằng nút con mắt
    initTogglePassword();
});

/**
 * Hàm xử lý ẩn / hiện mật khẩu
 */
function initTogglePassword() {
    const passwordInput = document.getElementById("password");
    const togglePasswordBtn = document.getElementById("togglePassword");

    // Chỉ chạy nếu trên giao diện có tồn tại ô password và nút con mắt
    if (!passwordInput || !togglePasswordBtn) return;

    // Định nghĩa sẵn 2 đoạn mã SVG cho icon mắt mở và mắt đóng (Dùng Feather Icons gọn đẹp)
    const eyeOpenSVG = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    `;
    
    const eyeCloseSVG = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
    `;

    togglePasswordBtn.addEventListener("click", function () {
        // Kiểm tra loại input hiện tại để chuyển đổi qua lại
        if (passwordInput.type === "password") {
            passwordInput.type = "text"; // Hiện mật khẩu thành văn bản thường
            togglePasswordBtn.innerHTML = eyeOpenSVG; // Đổi icon sang hình mắt mở
        } else {
            passwordInput.type = "password"; // Ẩn mật khẩu lại thành dấu chấm
            togglePasswordBtn.innerHTML = eyeCloseSVG; // Đổi icon sang hình mắt đóng kèm gạch chéo
        }
    });
}

/**
 * Hàm xử lý khi người dùng nhấn nút Đăng nhập
 */
async function handleLogin(event) {
    event.preventDefault(); // Ngăn chặn trang web bị reload lại

    // Lấy dữ liệu từ các ô input
    const tenDangNhapInput = document.getElementById('username');
    const matKhauInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage'); // Nơi hiển thị lỗi nếu có

    // Xóa thông báo lỗi cũ nếu có
    if (errorMessage) errorMessage.textContent = '';

    const TenDangNhap = tenDangNhapInput.value.trim();
    const MatKhau = matKhauInput.value.trim();

    // Kiểm tra dữ liệu nhanh ở phía Client
    if (!TenDangNhap || !MatKhau) {
        showError("Vui lòng điền đầy đủ tài khoản và mật khẩu!");
        return;
    }

    try {
        // Gọi API Đăng nhập
        const response = await fetch(`${API_BASE}/taikhoan/dangnhap`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ TenDangNhap, MatKhau })
        });

        const data = await response.json();

        if (!response.ok) {
            // Nếu API trả về lỗi (400, 401, 500...), hiển thị thông báo lỗi từ server
            showError(data.error || "Đăng nhập thất bại!");
            return;
        }

        // --- ĐĂNG NHẬP THÀNH CÔNG ---
        if (data.success) {

            // 1. Lưu thông tin nhân viên vào localStorage để dùng cho các trang sau
            localStorage.setItem('currentUser', JSON.stringify(data.nhanVien));
            
            // 2. Chuyển hướng người dùng vào trang quản lý chính
            window.location.href = 'dashboard.html'; 
        }

    } catch (error) {
        console.error("Lỗi kết nối API Đăng nhập:", error);
        showError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau!");
    }
}

// Hàm hiển thị thông báo lỗi lên giao diện
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.color = 'red';
    } else {
        alert(message);
    }
}