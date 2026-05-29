const bcrypt = require('bcrypt');
const pool = require('../db'); 

// ====================
// TÀI KHOẢN NGƯỜI DÙNG
// ====================

// Đăng nhập tài khoản
exports.dangNhap = async (req, res) => {
    try {
        const { TenDangNhap, MatKhau } = req.body;

        if (!TenDangNhap || !MatKhau) {
            return res.status(400).json({ error: "Vui lòng nhập đầy đủ tài khoản và mật khẩu!" });
        }

        // Bắt buộc bọc nháy kép tên bảng và tên cột khớp 100% với Schema DB Neon của bạn
        const truyVanNguoiDung = await pool.query(
            'SELECT * FROM PHANQUYEN WHERE TenDangNhap = $1 AND TrangThai = TRUE', 
            [TenDangNhap]
        );

        if (truyVanNguoiDung.rows.length === 0) {
            return res.status(401).json({ error: 'Tài khoản không tồn tại hoặc bị khóa!' });
        }

        const nguoiDung = truyVanNguoiDung.rows[0];
        
        // PostgreSQL tự chuyển key kết quả trả về từ SELECT * thành chữ viết thường hoàn toàn
        const laChinhXac = await bcrypt.compare(MatKhau, nguoiDung.matkhau); 
        
        if (!laChinhXac) {
            return res.status(401).json({ error: 'Mật khẩu không chính xác!' });
        }

        return res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công!',
            nhanVien: {
                MaNhanVien: nguoiDung.manhanvien,
                TenDangNhap: nguoiDung.tendangnhap,
                NhomNguoiDung: nguoiDung.nhomnguoidung
            }
        });
    } catch (loi) {
        console.error("Lỗi đăng nhập:", loi);
        return res.status(500).json({ error: 'Lỗi máy chủ khi đăng nhập!' });
    }
};

// Danh sách nhân viên
exports.layDanhSachNhanVien = async (req, res) => {
    try {
        const ketQua = await pool.query(
            'SELECT MaNhanVien as id, TenDangNhap as username, NhomNguoiDung as role FROM PHANQUYEN WHERE TrangThai = TRUE ORDER BY MaNhanVien DESC'
        );
        return res.status(200).json(ketQua.rows);
    } catch (loi) {
        console.error("Lỗi lấy danh sách nhân viên:", loi);
        return res.status(500).json({ error: 'Lỗi hệ thống khi lấy danh sách nhân viên!' });
    }
};

// Tạo tài khoản mới
exports.themNhanVien = async (req, res) => {
    try {
        const { TenDangNhap, MatKhau, NhomNguoiDung } = req.body;
        
        if (!TenDangNhap || !MatKhau) {
            return res.status(400).json({ error: "Vui lòng nhập đầy đủ Tài khoản và Mật khẩu!" });
        }

        const kiemTraTrung = await pool.query(
            'SELECT * FROM PHANQUYEN WHERE TenDangNhap = $1', 
            [TenDangNhap]
        );
        
        if (kiemTraTrung.rows.length > 0) {
            return res.status(400).json({ error: 'Tên đăng nhập này đã tồn tại!' });
        }

        const matKhauMaHoa = await bcrypt.hash(MatKhau, 10);
        
        await pool.query(
            'INSERT INTO PHANQUYEN (TenDangNhap, MatKhau, NhomNguoiDung) VALUES ($1, $2, $3)',
            [TenDangNhap, matKhauMaHoa, NhomNguoiDung]
        );
        
        return res.status(201).json({ success: true, message: 'Thêm nhân viên mới thành công!' });
    } catch (loi) {
        console.error("Lỗi thêm nhân viên mới:", loi);
        return res.status(500).json({ error: 'Lỗi hệ thống khi thêm nhân viên mới!' });
    }
};

// Cập nhật vai trò
exports.capNhatQuyenNhanVien = async (req, res) => {
    try {
        const { id } = req.params; 
        const { NhomNguoiDung } = req.body;

        const result = await pool.query(
            'UPDATE PHANQUYEN SET NhomNguoiDung = $1 WHERE MaNhanVien = $2', 
            [NhomNguoiDung, id]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Không tìm thấy nhân viên cần cập nhật" });
        }

        return res.status(200).json({ success: true, message: 'Cập nhật nhóm người dùng thành công!' });
    } catch (loi) {
        console.error("Lỗi khi cập nhật quyền:", loi);
        return res.status(500).json({ error: 'Lỗi hệ thống khi cập nhật quyền nhân viên!' });
    }
};

// Xóa tài khoản (Chuyển trạng thái hoạt động)
exports.xoaNhanVien = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'UPDATE PHANQUYEN SET TrangThai = FALSE WHERE MaNhanVien = $1', 
            [id]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Không tìm thấy nhân viên để xóa" });
        }

        return res.status(200).json({ success: true, message: 'Đã xóa nhân viên thành công!' });
    } catch (loi) {
        console.error("Lỗi khi xóa nhân viên:", loi);
        return res.status(500).json({ error: 'Lỗi hệ thống khi xóa nhân viên!' });
    }
};

// Nhân viên thay đổi mật khẩu
exports.doiMatKhau = async (req, res) => {
    try {
        const { MaNhanVien, MatKhauCu, MatKhauMoi } = req.body;

        const truyVan = await pool.query('SELECT * FROM PHANQUYEN WHERE MaNhanVien = $1', [MaNhanVien]);
        if (truyVan.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy thông tin nhân viên!' });
        }

        const nguoiDung = truyVan.rows[0];

        const laChinhXac = await bcrypt.compare(MatKhauCu, nguoiDung.matkhau);
        if (!laChinhXac) {
            return res.status(400).json({ error: 'Mật khẩu cũ không chính xác!' });
        }

        const matKhauMoiMaHoa = await bcrypt.hash(MatKhauMoi, 10);
        await pool.query(
            'UPDATE PHANQUYEN SET MatKhau = $1 WHERE MaNhanVien = $2',
            [matKhauMoiMaHoa, MaNhanVien]
        );

        return res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công!' });
    } catch (loi) {
        console.error("Lỗi khi đổi mật khẩu:", loi);
        return res.status(500).json({ error: 'Lỗi hệ thống khi đổi mật khẩu!' });
    }
};

// ====================
// NHÓM NGƯỜI DÙNG & PHÂN QUYỀN
// ====================

// Danh sách chức năng
exports.layTatCaChucNangHeThong = async (req, res) => {
    try {
        const ketQua = await pool.query('SELECT MaChucNang as id, TenChucNang as name FROM CHUCNANG ORDER BY MaChucNang ASC');
        return res.status(200).json(ketQua.rows);
    } catch (loi) {
        console.error("Lỗi lấy danh mục chức năng:", loi);
        return res.status(500).json({ error: 'Lỗi hệ thống khi lấy danh mục chức năng!' });
    }
};


// Danh sách nhóm + chức năng đi kèm
exports.layDanhSachNhomQuyen = async (req, res) => {
    try {
        const SQL = `
            SELECT 
                n.TenNhom as groupName,
                COALESCE(
                    json_agg(
                        json_build_object('MaChucNang', c.MaChucNang, 'TenChucNang', c.TenChucNang)
                    ) FILTER (WHERE c.MaChucNang IS NOT NULL), '[]'
                ) AS functions
            FROM NhomNguoiDung n
            LEFT JOIN CHI_TIET_QUYEN ctq ON n.TenNhom = ctq.TenNhom
            LEFT JOIN CHUCNANG c ON ctq.MaChucNang = c.MaChucNang
            GROUP BY n.TenNhom
            ORDER BY n.TenNhom ASC;
        `;
        const ketQua = await pool.query(SQL);
        return res.status(200).json(ketQua.rows);
    } catch (loi) {
        console.error("Lỗi lấy danh sách nhóm quyền:", loi);
        return res.status(500).json({ error: 'Lỗi hệ thống khi lấy danh sách nhóm người dùng!' });
    }
};

// Thêm mới nhóm người dùng
exports.themNhomQuyen = async (req, res) => {
    const client = await pool.connect(); 
    try {
        const { TenNhom, DanhSachMaChucNang } = req.body;

        if (!TenNhom) {
            return res.status(400).json({ error: 'Tên nhóm không được để trống!' });
        }

        const kiemTra = await client.query('SELECT * FROM NhomNguoiDung WHERE TenNhom = $1', [TenNhom]);
        if (kiemTra.rows.length > 0) {
            return res.status(400).json({ error: 'Tên nhóm này đã tồn tại rồi!' });
        }

        await client.query('BEGIN');

        await client.query('INSERT INTO NhomNguoiDung (TenNhom) VALUES ($1)', [TenNhom]);

        if (DanhSachMaChucNang && DanhSachMaChucNang.length > 0) {
            for (let ma of DanhSachMaChucNang) {
                await client.query(
                    'INSERT INTO CHI_TIET_QUYEN (TenNhom, MaChucNang) VALUES ($1, $2)',
                    [TenNhom, ma]
                );
            }
        }

        await client.query('COMMIT');
        return res.status(201).json({ success: true, message: `Đã tạo nhóm ${TenNhom} thành công!` });

    } catch (loi) {
        await client.query('ROLLBACK');
        console.error("Lỗi khi tạo nhóm quyền:", loi);
        return res.status(500).json({ error: 'Lỗi hệ thống khi tạo nhóm quyền và gán chức năng!' });
    } finally {
        client.release();
    }
};

// Đổi tên nhóm người dùng
exports.capNhatNhomQuyen = async (req, res) => {
    try {
        const { TenNhomCu, TenNhomMoi } = req.body;
        
        if (TenNhomMoi && TenNhomMoi !== TenNhomCu) {
            const result = await pool.query('UPDATE NhomNguoiDung SET TenNhom = $1 WHERE TenNhom = $2', [TenNhomMoi, TenNhomCu]);
            if (result.rowCount === 0) {
                return res.status(404).json({ error: "Không tìm thấy nhóm quyền cần cập nhật" });
            }
            return res.status(200).json({ success: true, message: 'Đã đổi tên nhóm thành công!' });
        }
        return res.status(400).json({ error: 'Không có thông tin thay đổi!' });
    } catch (loi) {
        console.error("Lỗi cập nhật tên nhóm:", loi);
        return res.status(500).json({ error: 'Lỗi hệ thống khi cập nhật nhóm!' });
    }
};

// Thêm chức năng đơn lẻ vào nhóm
exports.themChucNangVaoNhom = async (req, res) => {
    try {
        const { TenNhom, MaChucNang } = req.body;
        await pool.query(
            'INSERT INTO CHI_TIET_QUYEN (TenNhom, MaChucNang) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [TenNhom, MaChucNang]
        );
        return res.status(200).json({ success: true, message: 'Đã bổ sung chức năng vào nhóm!' });
    } catch (loi) {
        console.error("Lỗi bổ sung chức năng:", loi);
        return res.status(500).json({ error: 'Lỗi hệ thống khi bổ sung chức năng!' });
    }
};

// Gỡ chức năng khỏi nhóm
exports.xoaChucNangKhoiNhom = async (req, res) => {
    try {
        const { TenNhom, MaChucNang } = req.body;
        const result = await pool.query(
            'DELETE FROM CHI_TIET_QUYEN WHERE TenNhom = $1 AND MaChucNang = $2',
            [TenNhom, MaChucNang]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Không tìm thấy liên kết quyền để gỡ bỏ" });
        }
        return res.status(200).json({ success: true, message: 'Đã gỡ chức năng này khỏi nhóm!' });
    } catch (loi) {
        console.error("Lỗi xóa chức năng khỏi nhóm:", loi);
        return res.status(500).json({ error: 'Lỗi hệ thống khi gỡ chức năng khỏi nhóm!' });
    }
};

// Xóa hoàn toàn nhóm người dùng
exports.xoaNhomQuyen = async (req, res) => {
    try {
        const { tenNhom } = req.params;
        const result = await pool.query('DELETE FROM NhomNguoiDung WHERE TenNhom = $1', [tenNhom]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Không tìm thấy nhóm quyền cần xóa" });
        }
        return res.status(200).json({ success: true, message: `Đã xóa hoàn toàn nhóm ${tenNhom}!` });
    } catch (loi) {
        console.error("Lỗi khi xóa nhóm quyền:", loi);
        return res.status(500).json({ error: 'Không thể xóa nhóm quyền này (Có thể có nhân viên đang thuộc nhóm này).' });
    }
};