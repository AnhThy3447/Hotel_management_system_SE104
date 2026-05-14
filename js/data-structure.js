// data-structure.js - Khởi tạo cấu trúc dữ liệu theo DB schema

// Khởi tạo dữ liệu mẫu nếu chưa có
function initializeDatabase() {
    // THAMSO - Tham số hệ thống
    if (!localStorage.getItem('THAMSO')) {
        const thamSo = {
            SoKhachToiDa: 3,
            SoKhachKhongTinhPhuThu: 2
        };
        localStorage.setItem('THAMSO', JSON.stringify(thamSo));
    }

    // LOAIPHONG - Loại phòng
    if (!localStorage.getItem('LOAIPHONG')) {
        const loaiPhong = [
            { MaLoaiPhong: 1, LoaiPhong: 'Standard', DonGia: 300000 },
            { MaLoaiPhong: 2, LoaiPhong: 'Superior', DonGia: 500000 },
            { MaLoaiPhong: 3, LoaiPhong: 'Deluxe', DonGia: 800000 },
            { MaLoaiPhong: 4, LoaiPhong: 'Suite', DonGia: 1200000 }
        ];
        localStorage.setItem('LOAIPHONG', JSON.stringify(loaiPhong));
    }

    // PHONG - Danh sách phòng
    if (!localStorage.getItem('PHONG')) {
        const phong = [];
        // Tầng 1: Standard (101-108)
        for (let i = 101; i <= 108; i++) {
            phong.push({
                SoPhong: i,
                MaLoaiPhong: 1,
                TinhTrang: 'Trống',
                GhiChu: ''
            });
        }
        // Tầng 2: Superior (201-208)
        for (let i = 201; i <= 208; i++) {
            phong.push({
                SoPhong: i,
                MaLoaiPhong: 2,
                TinhTrang: 'Trống',
                GhiChu: ''
            });
        }
        // Tầng 3: Deluxe (301-308)
        for (let i = 301; i <= 308; i++) {
            phong.push({
                SoPhong: i,
                MaLoaiPhong: 3,
                TinhTrang: 'Trống',
                GhiChu: ''
            });
        }
        // Tầng 4: Suite (401-404)
        for (let i = 401; i <= 404; i++) {
            phong.push({
                SoPhong: i,
                MaLoaiPhong: 4,
                TinhTrang: 'Trống',
                GhiChu: ''
            });
        }
        localStorage.setItem('PHONG', JSON.stringify(phong));
    }

    // LOAIKHACH - Loại khách
    if (!localStorage.getItem('LOAIKHACH')) {
        const loaiKhach = [
            { MaLoaiKhach: 1, LoaiKhach: 'Nội địa', HeSoPhuThu: 1.0 },
            { MaLoaiKhach: 2, LoaiKhach: 'Nước ngoài', HeSoPhuThu: 1.5 }
        ];
        localStorage.setItem('LOAIKHACH', JSON.stringify(loaiKhach));
    }

    // TILEPHUTHU - Tỷ lệ phụ thu theo thứ tự khách
    if (!localStorage.getItem('TILEPHUTHU')) {
        const tiLePhuThu = [
            { ThuTuKhach: 1, HeSoPhuThu: 1.0 },
            { ThuTuKhach: 2, HeSoPhuThu: 1.0 },
            { ThuTuKhach: 3, HeSoPhuThu: 1.25 }
        ];
        localStorage.setItem('TILEPHUTHU', JSON.stringify(tiLePhuThu));
    }

    // KHACHHANG - Danh sách khách hàng
    if (!localStorage.getItem('KHACHHANG')) {
        localStorage.setItem('KHACHHANG', JSON.stringify([]));
    }

    // THUEPHONG - Phiếu thuê phòng
    if (!localStorage.getItem('THUEPHONG')) {
        localStorage.setItem('THUEPHONG', JSON.stringify([]));
    }

    // CTTHUEPHONG - Chi tiết thuê phòng
    if (!localStorage.getItem('CTTHUEPHONG')) {
        localStorage.setItem('CTTHUEPHONG', JSON.stringify([]));
    }

    // COQUAN - Cơ quan
    if (!localStorage.getItem('COQUAN')) {
        localStorage.setItem('COQUAN', JSON.stringify([]));
    }

    // HOADON - Hóa đơn
    if (!localStorage.getItem('HOADON')) {
        localStorage.setItem('HOADON', JSON.stringify([]));
    }

    // CTHOADON - Chi tiết hóa đơn
    if (!localStorage.getItem('CTHOADON')) {
        localStorage.setItem('CTHOADON', JSON.stringify([]));
    }

    // BAOCAODOANHTHU
    if (!localStorage.getItem('BAOCAODOANHTHU')) {
        localStorage.setItem('BAOCAODOANHTHU', JSON.stringify([]));
    }

    // CTBAOCAODOANHTHU
    if (!localStorage.getItem('CTBAOCAODOANHTHU')) {
        localStorage.setItem('CTBAOCAODOANHTHU', JSON.stringify([]));
    }

    // BAOCAOKHACH
    if (!localStorage.getItem('BAOCAOKHACH')) {
        localStorage.setItem('BAOCAOKHACH', JSON.stringify([]));
    }

    // CTBAOCAOKHACH
    if (!localStorage.getItem('CTBAOCAOKHACH')) {
        localStorage.setItem('CTBAOCAOKHACH', JSON.stringify([]));
    }
}

// Helper functions để lấy dữ liệu
function getThamSo() {
    return JSON.parse(localStorage.getItem('THAMSO') || '{}');
}

function getLoaiPhong() {
    return JSON.parse(localStorage.getItem('LOAIPHONG') || '[]');
}

function getPhong() {
    return JSON.parse(localStorage.getItem('PHONG') || '[]');
}

function getLoaiKhach() {
    return JSON.parse(localStorage.getItem('LOAIKHACH') || '[]');
}

function getTiLePhuThu() {
    return JSON.parse(localStorage.getItem('TILEPHUTHU') || '[]');
}

function getKhachHang() {
    return JSON.parse(localStorage.getItem('KHACHHANG') || '[]');
}

function getThuePhong() {
    return JSON.parse(localStorage.getItem('THUEPHONG') || '[]');
}

function getCTThuePhong() {
    return JSON.parse(localStorage.getItem('CTTHUEPHONG') || '[]');
}

function getHoaDon() {
    return JSON.parse(localStorage.getItem('HOADON') || '[]');
}

function getCTHoaDon() {
    return JSON.parse(localStorage.getItem('CTHOADON') || '[]');
}

// Helper functions để lưu dữ liệu
function saveThamSo(data) {
    localStorage.setItem('THAMSO', JSON.stringify(data));
}

function saveLoaiPhong(data) {
    localStorage.setItem('LOAIPHONG', JSON.stringify(data));
}

function savePhong(data) {
    localStorage.setItem('PHONG', JSON.stringify(data));
}

function saveKhachHang(data) {
    localStorage.setItem('KHACHHANG', JSON.stringify(data));
}

function saveThuePhong(data) {
    localStorage.setItem('THUEPHONG', JSON.stringify(data));
}

function saveCTThuePhong(data) {
    localStorage.setItem('CTTHUEPHONG', JSON.stringify(data));
}

function saveHoaDon(data) {
    localStorage.setItem('HOADON', JSON.stringify(data));
}

function saveCTHoaDon(data) {
    localStorage.setItem('CTHOADON', JSON.stringify(data));
}

// Tạo ID tự động
function getNextId(tableName) {
    const data = JSON.parse(localStorage.getItem(tableName) || '[]');
    if (data.length === 0) return 1;

    // Tìm key ID dựa trên tên bảng
    const idKey = tableName === 'PHONG' ? 'SoPhong' :
                  tableName === 'LOAIPHONG' ? 'MaLoaiPhong' :
                  tableName === 'KHACHHANG' ? 'MaKhachHang' :
                  tableName === 'THUEPHONG' ? 'MaThuePhong' :
                  tableName === 'CTTHUEPHONG' ? 'MaChiTiet' :
                  tableName === 'HOADON' ? 'MaHoaDon' :
                  tableName === 'CTHOADON' ? 'MaCTHoaDon' :
                  'id';

    const maxId = Math.max(...data.map(item => item[idKey] || 0));
    return maxId + 1;
}

// Lấy thông tin phòng theo số phòng
function getPhongBySoPhong(soPhong) {
    const phong = getPhong();
    return phong.find(p => p.SoPhong === parseInt(soPhong));
}

// Lấy loại phòng theo mã
function getLoaiPhongByMa(maLoaiPhong) {
    const loaiPhong = getLoaiPhong();
    return loaiPhong.find(lp => lp.MaLoaiPhong === maLoaiPhong);
}

// Cập nhật tình trạng phòng
function updateTinhTrangPhong(soPhong, tinhTrang) {
    const phong = getPhong();
    const index = phong.findIndex(p => p.SoPhong === parseInt(soPhong));
    if (index !== -1) {
        phong[index].TinhTrang = tinhTrang;
        savePhong(phong);
    }
}

// Khởi tạo khi load trang
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeDatabase();
    });
}
