const API_BASE = 'https://hotel-management-system-se104-g0le.onrender.com/api/phan-quyen';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm'); // ID của thẻ <form> đăng nhập

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

/**
 * Hàm xử lý khi người dùng nhấn nút Đăng nhập
 */
async function handleLogin(event) {
    event.preventDefault(); // Ngăn chặn trang web bị reload lại

    // Lấy dữ liệu từ các ô input (Bạn nhớ đổi ID đúng với file HTML của bạn nhé)
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
            alert('Đăng nhập thành công!');

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