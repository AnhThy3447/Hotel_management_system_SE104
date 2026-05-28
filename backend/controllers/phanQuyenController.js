const bcrypt = require('bcrypt');
const db = require('../db');

// ====================
// TÀI KHOẢN NGƯỜI DÙNG
// ====================

// Đăng nhập tài khoản
exports.dangNhap = async (req, res) => {
    try {
        const { TenDangNhap, MatKhau } = req.body;

        // Tìm tài khoản theo Tên đăng nhập và phải đang hoạt động (TrangThai = TRUE)
        const truyVanNguoiDung = await db.query(
            'SELECT * FROM PHANQUYEN WHERE TenDangNhap = $1 AND TrangThai = TRUE', 
            [TenDangNhap]
        );

        if (truyVanNguoiDung.rows.length === 0) {
            return res.status(401).json({ message: 'Tài khoản không tồn tại hoặc bị khóa!' });
        }

        const nguoiDung = truyVanNguoiDung.rows[0];
        
        // So sánh mật khẩu thô từ Frontend gửi lên với mật khẩu đã mã hóa trong DB
        const laChinhXac = await bcrypt.compare(MatKhau, nguoiDung.matkhau); 
        
        if (!laChinhXac) {
            return res.status(401).json({ message: 'Mật khẩu không chính xác!' });
        }

        // Đăng nhập thành công
        return res.status(200).json({
            message: 'Đăng nhập thành công!',
            nhanVien: {
                MaNhanVien: nguoiDung.manhanvien,
                TenDangNhap: nguoiDung.tendangnhap,
                NhomNguoiDung: nguoiDung.nhomnguoidung
            }
        });
    } catch (loi) {
        console.error(loi);
        return res.status(500).json({ message: 'Lỗi máy chủ rồi bạn ơi!' });
    }
};

// Danh sách nhân viên
exports.layDanhSachNhanVien = async (req, res) => {
    try {
        const ketQua = await db.query(
            'SELECT MaNhanVien, TenDangNhap, NhomNguoiDung FROM PHANQUYEN WHERE TrangThai = TRUE ORDER BY MaNhanVien DESC'
        );
        
        // Trả về danh sách
        return res.status(200).json(ketQua.rows);
    } catch (loi) {
        console.error(loi);
        return res.status(500).json({ message: 'Lỗi lấy danh sách nhân viên!' });
    }
};

// Tạo tài khoản mới
exports.themNhanVien = async (req, res) => {
    try {
        const { TenDangNhap, MatKhau, NhomNguoiDung } = req.body;
        
        // Kiểm tra xem tên đăng nhập này đã bị trùng chưa
        const kiemTraTrung = await db.query(
            'SELECT * FROM PHANQUYEN WHERE TenDangNhap = $1', 
            [TenDangNhap]
        );
        
        if (kiemTraTrung.rows.length > 0) {
            return res.status(400).json({ message: 'Tên đăng nhập này đã tồn tại!' });
        }

        // Tiến hành băm mã hóa mật khẩu trước khi lưu
        const matKhauMaHoa = await bcrypt.hash(MatKhau, 10);
        
        await db.query(
            'INSERT INTO PHANQUYEN (TenDangNhap, MatKhau, NhomNguoiDung) VALUES ($1, $2, $3)',
            [TenDangNhap, matKhauMaHoa, NhomNguoiDung]
        );
        
        return res.status(201).json({ message: 'Thêm nhân viên mới thành công!' });
    } catch (loi) {
        console.error(loi);
        return res.status(500).json({ message: 'Lỗi khi thêm nhân viên mới!' });
    }
};

// Cập nhật vai trò
exports.capNhatQuyenNhanVien = async (req, res) => {
    try {
        const { id } = req.params; // MaNhanVien
        const { NhomNguoiDung } = req.body;

        await db.query(
            'UPDATE PHANQUYEN SET NhomNguoiDung = $1 WHERE MaNhanVien = $2', 
            [NhomNguoiDung, id]
        );
        
        return res.status(200).json({ message: 'Cập nhật nhóm người dùng thành công!' });
    } catch (loi) {
        console.error(loi);
        return res.status(500).json({ message: 'Lỗi khi cập nhật quyền!' });
    }
};

// Xóa tài khoản
exports.xoaNhanVien = async (req, res) => {
    try {
        const { id } = req.params;

        // Chuyển trạng thái sang FALSE để ẩn đi
        await db.query(
            'UPDATE PHANQUYEN SET TrangThai = FALSE WHERE MaNhanVien = $1', 
            [id]
        );
        
        return res.status(200).json({ message: 'Đã xóa nhân viên thành công!' });
    } catch (loi) {
        console.error(loi);
        return res.status(500).json({ message: 'Lỗi khi xóa nhân viên!' });
    }
};

// Nhân viên thay đổi mật khẩu
exports.doiMatKhau = async (req, res) => {
    try {
        const { MaNhanVien, MatKhauCu, MatKhauMoi } = req.body;

        // Lấy thông tin tài khoản hiện tại để kiểm tra mật khẩu cũ
        const truyVan = await db.query('SELECT * FROM PHANQUYEN WHERE MaNhanVien = $1', [MaNhanVien]);
        if (truyVan.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy nhân viên!' });
        }

        const nguoiDung = truyVan.rows[0];

        // Kiểm tra mật khẩu cũ có đúng không
        const laChinhXac = await bcrypt.compare(MatKhauCu, nguoiDung.matkhau);
        if (!laChinhXac) {
            return res.status(400).json({ message: 'Mật khẩu cũ không chính xác!' });
        }

        // Mã hóa mật khẩu mới và cập nhật vào DB
        const matKhauMoiMaHoa = await bcrypt.hash(MatKhauMoi, 10);
        await db.query(
            'UPDATE PHANQUYEN SET MatKhau = $1 WHERE MaNhanVien = $2',
            [matKhauMoiMaHoa, MaNhanVien]
        );

        return res.status(200).json({ message: 'Đổi mật khẩu thành công!' });
    } catch (loi) {
        console.error(loi);
        return res.status(500).json({ message: 'Lỗi khi đổi mật khẩu!' });
    }
};

// ====================
// NHÓM NGƯỜI DÙNG
// ====================

// Danh sách nhóm + chức năng
exports.layDanhSachNhomQuyen = async (req, res) => {
    try {
        const SQL = `
            SELECT 
                n.TenNhom,
                COALESCE(
                    json_agg(
                        json_build_object('MaChucNang', c.MaChucNang, 'TenChucNang', c.TenChucNang)
                    ) FILTER (WHERE c.MaChucNang IS NOT NULL), '[]'
                ) AS DanhSachChucNang
            FROM NHOMNGUOIDUNG n
            LEFT JOIN CHI_TIET_QUYEN ctq ON n.TenNhom = ctq.TenNhom
            LEFT JOIN CHUCNANG c ON ctq.MaChucNang = c.MaChucNang
            GROUP BY n.TenNhom
            ORDER BY n.TenNhom ASC;
        `;
        const ketQua = await db.query(SQL);
        return res.status(200).json(ketQua.rows);
    } catch (loi) {
        console.error(loi);
        return res.status(500).json({ message: 'Lỗi lấy danh sách nhóm người dùng!' });
    }
};

// Thêm mới nhóm người dùng
// { "TenNhom": "Lễ Tân", "DanhSachMaChucNang": [1, 3, 4] }
exports.themNhomQuyen = async (req, res) => {
    const client = await db.connect(); // Dùng client để chạy Transaction bọc dữ liệu
    try {
        const { TenNhom, DanhSachMaChucNang } = req.body;

        if (!TenNhom) {
            return res.status(400).json({ message: 'Tên nhóm không được để trống!' });
        }

        // Kiểm tra xem tên nhóm đã tồn tại chưa
        const kiemTra = await client.query('SELECT * FROM NHOMNGUOIDUNG WHERE TenNhom = $1', [TenNhom]);
        if (kiemTra.rows.length > 0) {
            return res.status(400).json({ message: 'Tên nhóm này đã tồn tại rồi!' });
        }

        // BẮT ĐẦU TRANSACTION
        await client.query('BEGIN');

        // Thêm tên nhóm vào bảng gốc
        await client.query('INSERT INTO NHOMNGUOIDUNG (TenNhom) VALUES ($1)', [TenNhom]);

        // Nếu có chọn sẵn chức năng, tiến hành vòng lặp chèn vào bảng CHI_TIET_QUYEN
        if (DanhSachMaChucNang && DanhSachMaChucNang.length > 0) {
            for (let ma of DanhSachMaChucNang) {
                await client.query(
                    'INSERT INTO CHI_TIET_QUYEN (TenNhom, MaChucNang) VALUES ($1, $2)',
                    [TenNhom, ma]
                );
            }
        }

        // Hoàn tất lưu vào DB
        await client.query('COMMIT');
        return res.status(201).json({ message: `Đã tạo nhóm ${TenNhom} cùng các chức năng đi kèm!` });

    } catch (loi) {
        await client.query('ROLLBACK');
        console.error(loi);
        return res.status(500).json({ message: 'Lỗi khi tạo nhóm quyền và gán chức năng!' });
    } finally {
        client.release();
    }
};

// Đổi tên nhóm
exports.capNhatNhomQuyen = async (req, res) => {
    try {
        const { TenNhomCu, TenNhomMoi } = req.body;
        
        if (TenNhomMoi && TenNhomMoi !== TenNhomCu) {
            await db.query('UPDATE NHOMNGUOIDUNG SET TenNhom = $1 WHERE TenNhom = $2', [TenNhomMoi, TenNhomCu]);
            return res.status(200).json({ message: 'Đã đổi tên nhóm thành công!' });
        }
        return res.status(400).json({ message: 'Không có thông tin thay đổi!' });
    } catch (loi) {
        console.error(loi);
        return res.status(500).json({ message: 'Lỗi khi cập nhật nhóm!' });
    }
};

// Thêm chức năng vào nhóm
exports.themChucNangVaoNhom = async (req, res) => {
    try {
        const { TenNhom, MaChucNang } = req.body;
        await db.query(
            'INSERT INTO CHI_TIET_QUYEN (TenNhom, MaChucNang) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [TenNhom, MaChucNang]
        );
        return res.status(200).json({ message: 'Đã bổ sung chức năng vào nhóm!' });
    } catch (loi) {
        console.error(loi);
        return res.status(500).json({ message: 'Lỗi khi bổ sung chức năng!' });
    }
};

// Xóa chức năng khỏi nhóm
exports.xoaChucNangKhoiNhom = async (req, res) => {
    try {
        const { TenNhom, MaChucNang } = req.body;
        await db.query(
            'DELETE FROM CHI_TIET_QUYEN WHERE TenNhom = $1 AND MaChucNang = $2',
            [TenNhom, MaChucNang]
        );
        return res.status(200).json({ message: 'Đã gỡ chức năng này khỏi nhóm!' });
    } catch (loi) {
        console.error(loi);
        return res.status(500).json({ message: 'Lỗi khi xóa chức năng khỏi nhóm!' });
    }
};

// Xóa nhóm người dùng
exports.xoaNhomQuyen = async (req, res) => {
    try {
        const { tenNhom } = req.params;
        await db.query('DELETE FROM NHOMNGUOIDUNG WHERE TenNhom = $1', [tenNhom]);
        return res.status(200).json({ message: `Đã xóa hoàn toàn nhóm ${tenNhom}!` });
    } catch (loi) {
        console.error(loi);
        return res.status(500).json({ message: 'Lỗi khi xóa nhóm quyền!' });
    }
};