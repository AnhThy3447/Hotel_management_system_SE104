const db = require('../db');

// ==========================================
// 1. QUẢN LÝ THAM SỐ (CÓ TỰ ĐỘNG SINH DÒNG PHỤ THU)
// ==========================================

// Xem danh sách tham số
exports.xemThamSo = async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM THAMSO ORDER BY TenThamSo`);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Cập nhật tham số (Tích hợp logic tự động đồng bộ số lượng dòng bảng TILEPHUTHU)
exports.capNhatThamSo = async (req, res) => {
  try {
    const { TenThamSo, GiaTri } = req.body;
    
    // Cập nhật tham số gốc trước
    const result = await db.query(
      `UPDATE THAMSO SET GiaTri=$1 WHERE TenThamSo=$2 RETURNING *`,
      [GiaTri, TenThamSo]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tham số cần cập nhật!" });
    }

    // LOGIC TỰ ĐỘNG ĐỒNG BỘ: Nếu cập nhật "Số khách tối đa trong phòng" (SoKhachToiDa)
    if (TenThamSo === 'SoKhachToiDa' || TenThamSo === 'Số khách tối đa trong phòng') {
      const soKhachToiDaMoi = parseInt(GiaTri);
      
      // Lấy Số khách không tính phí phụ thu (Ví dụ: 2) để biết từ khách thứ mấy thì bắt đầu tính phụ thu
      const resKhachMienPhi = await db.query(
        `SELECT GiaTri FROM THAMSO WHERE TenThamSo = 'SoKhachKhongTinhPhi' OR TenThamSo = 'Số khách không tính phí phụ thu' LIMIT 1`
      );
      const mocBatDauPhuThu = resKhachMienPhi.rows.length > 0 ? parseInt(resKhachMienPhi.rows[0].giatri) : 2;

      // Đếm xem hiện tại bảng TILEPHUTHU đang có bao nhiêu dòng dữ liệu
      const resDongHienTai = await db.query(`SELECT ThuTuKhach FROM TILEPHUTHU ORDER BY ThuTuKhach DESC`);
      const thutuKhachLonNhatHienTai = resDongHienTai.rows.length > 0 ? parseInt(resDongHienTai.rows[0].thutukhach) : 0;

      // Trường hợp 1: Số khách tối đa tăng lên (Ví dụ từ 3 lên 5) -> Cần chèn thêm dòng phụ thu 4 và 5
      if (soKhachToiDaMoi > thutuKhachLonNhatHienTai) {
        for (let i = thutuKhachLonNhatHienTai + 1; i <= soKhachToiDaMoi; i++) {
          if (i > mocBatDauPhuThu) { // Chỉ chèn nếu vượt quá mốc miễn phí
            await db.query(
              `INSERT INTO TILEPHUTHU (ThuTuKhach, HeSoPhuThu) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
              [i, 25] // Mặc định phụ thu 25% cho các dòng tự sinh mới
            );
          }
        }
      } 
      // Trường hợp 2: Số khách tối đa giảm xuống (Ví dụ từ 4 xuống 3) -> Xóa phăng dòng 4 thừa thãi
      else if (soKhachToiDaMoi < thutuKhachLonNhatHienTai) {
        await db.query(`DELETE FROM TILEPHUTHU WHERE ThuTuKhach > $1`, [soKhachToiDaMoi]);
      }
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// 2. QUẢN LÝ TỶ LỆ PHỤ THU THEO THỨ TỰ KHÁCH
// ==========================================

// Xem danh sách tỷ lệ phụ thu
exports.xemPhuThu = async (req, res) => {
  try {
    const result = await db.query(`SELECT ThuTuKhach as "ThuTuKhach", HeSoPhuThu as "HeSoPhuThu" FROM TILEPHUTHU ORDER BY ThuTuKhach`);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Cập nhật hệ số phụ thu
exports.capNhatPhuThu = async (req, res) => {
  try {
    const { thuTuKhach } = req.params;
    const { HeSoPhuThu } = req.body;
    const result = await db.query(
      `UPDATE TILEPHUTHU SET HeSoPhuThu=$1 WHERE ThuTuKhach=$2 RETURNING *`,
      [HeSoPhuThu, thuTuKhach]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// 3. QUẢN LÝ DANH MỤC LOẠI KHÁCH 
// ==========================================

// Xem danh sách loại khách
exports.xemLoaiKhach = async (req, res) => {
  try {
    const result = await db.query(`SELECT MaLoaiKhach as "id", LoaiKhach as "name", HeSoPhuThu as "surcharge" FROM LOAIKHACH ORDER BY MaLoaiKhach ASC`);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Thêm loại khách mới
exports.themLoaiKhach = async (req, res) => {
  try {
    const { LoaiKhach, HeSoPhuThu } = req.body;
    if (!LoaiKhach) {
      return res.status(400).json({ success: false, message: "Tên loại khách không được để trống!" });
    }
    const result = await db.query(
      `INSERT INTO LOAIKHACH (LoaiKhach, HeSoPhuThu) VALUES ($1, $2) RETURNING MaLoaiKhach as id, LoaiKhach as name, HeSoPhuThu as surcharge`,
      [LoaiKhach, HeSoPhuThu || 1.0]
    );
    res.status(201).json({ success: true, message: "Thêm loại khách thành công!", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Chỉnh sửa loại khách
exports.suaLoaiKhach = async (req, res) => {
  try {
    const { id } = req.params;
    const { LoaiKhach, HeSoPhuThu } = req.body;
    const result = await db.query(
      `UPDATE LOAIKHACH SET LoaiKhach=$1, HeSoPhuThu=$2 WHERE MaLoaiKhach=$3 RETURNING MaLoaiKhach as id, LoaiKhach as name, HeSoPhuThu as surcharge`,
      [LoaiKhach, HeSoPhuThu, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy loại khách cần sửa!" });
    }
    res.json({ success: true, message: "Cập nhật loại khách thành công!", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Xóa loại khách khỏi hệ thống
exports.xoaLoaiKhach = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`DELETE FROM LOAIKHACH WHERE MaLoaiKhach=$1`, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy loại khách cần xóa!" });
    }
    res.json({ success: true, message: "Đã xóa loại khách thành công!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Không thể xóa (Loại khách này đang liên kết với hồ sơ thuê phòng)." });
  }
};