const db = require('../db');

exports.taoHoaDon = async (req, res) => {
  try {
    const { MaKhachHangThanhToan, MaCoQuan, NgayThanhToan, TongTien, DanhSachPhieu } = req.body;
    const hd = await db.query(
      `INSERT INTO HOADON (MaKhachHangThanhToan, MaCoQuan, NgayThanhToan, TongTien)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [MaKhachHangThanhToan, MaCoQuan, NgayThanhToan, TongTien]
    );
    const MaHoaDon = hd.rows[0].mahoadon;
    for (const ct of (DanhSachPhieu || [])) {
      await db.query(
        `INSERT INTO CTHOADON (MaHoaDon, MaThuePhong, TriGia) VALUES ($1, $2, $3)`,
        [MaHoaDon, ct.MaThuePhong, ct.TriGia]
      );
    }
    res.status(201).json({ success: true, data: hd.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.xemTatCa = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT hd.*, kh.TenKhachHang, cq.TenCoQuan,
             ct.MaThuePhong
      FROM HOADON hd
      LEFT JOIN KHACHHANG kh ON hd.MaKhachHangThanhToan = kh.MaKhachHang
      LEFT JOIN COQUAN cq ON hd.MaCoQuan = cq.MaCoQuan
      LEFT JOIN CTHOADON ct ON hd.MaHoaDon = ct.MaHoaDon
      ORDER BY hd.NgayThanhToan DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.xemChiTiet = async (req, res) => {
  try {
    const { id } = req.params;
    const hd = await db.query(`
      SELECT hd.*, kh.TenKhachHang, cq.TenCoQuan
      FROM HOADON hd
      LEFT JOIN KHACHHANG kh ON hd.MaKhachHangThanhToan = kh.MaKhachHang
      LEFT JOIN COQUAN cq ON hd.MaCoQuan = cq.MaCoQuan
      WHERE hd.MaHoaDon = $1
    `, [id]);
    const ct = await db.query(`
      SELECT ct.*, tp.SoPhong, tp.SoNgayThue,
             lp.LoaiPhong, lp.DonGia
      FROM CTHOADON ct
      LEFT JOIN THUEPHONG tp ON ct.MaThuePhong = tp.MaThuePhong
      LEFT JOIN PHONG p ON tp.SoPhong = p.SoPhong
      LEFT JOIN LOAIPHONG lp ON p.MaLoaiPhong = lp.MaLoaiPhong
      WHERE ct.MaHoaDon = $1
    `, [id]);
    res.json({ success: true, data: { hoaDon: hd.rows[0], chiTiet: ct.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.xemTheoPhieuThue = async (req, res) => {
  try {
    const { id } = req.params;
    const ct = await db.query(`SELECT * FROM CTHOADON WHERE MaThuePhong = $1`, [id]);
    res.json({ success: true, data: ct.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.xoaHoaDon = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM CTHOADON WHERE MaHoaDon = $1`, [id]);
    await db.query(`DELETE FROM HOADON WHERE MaHoaDon = $1`, [id]);
    res.json({ success: true, message: 'Đã xóa hóa đơn!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
