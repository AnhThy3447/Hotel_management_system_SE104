const db = require('../db');

exports.taoHoaDon = async (req, res) => {
  const { MaKhachHangThanhToan, MaCoQuan, NgayThanhToan, TongTien, DanhSachPhieu } = req.body;
  const phieuList = DanhSachPhieu || [];

  if (phieuList.length === 0) {
    return res.status(400).json({ success: false, message: 'Danh sách phiếu thuê không được rỗng!' });
  }

  let client;
  try {
    client = await db.connect();
    await client.query('BEGIN');

    for (const ct of phieuList) {
      const existing = await client.query(
        `SELECT 1 FROM CTHOADON WHERE MaThuePhong = $1 LIMIT 1`,
        [ct.MaThuePhong]
      );
      if (existing.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Phiếu thuê #${ct.MaThuePhong} đã có hóa đơn!`
        });
      }
    }

    const hd = await client.query(
      `INSERT INTO HOADON (MaKhachHangThanhToan, MaCoQuan, NgayThanhToan, TongTien)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [MaKhachHangThanhToan, MaCoQuan, NgayThanhToan, TongTien]
    );
    const MaHoaDon = hd.rows[0].mahoadon;

    for (const ct of phieuList) {
      await client.query(
        `INSERT INTO CTHOADON (MaHoaDon, MaThuePhong, TriGia) VALUES ($1, $2, $3)`,
        [MaHoaDon, ct.MaThuePhong, ct.TriGia]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: hd.rows[0] });
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (client) client.release();
  }
};

exports.xemTatCa = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT hd.*, kh.TenKhachHang, cq.TenCoQuan,
             CASE WHEN hd.MaCoQuan IS NOT NULL THEN cq.TenCoQuan ELSE kh.TenKhachHang END AS NguoiThanhToan,
             CASE WHEN hd.MaCoQuan IS NOT NULL THEN 'coquan' ELSE 'khach' END AS LoaiNguoiThanhToan,
             (SELECT COUNT(*)::int FROM CTHOADON ct WHERE ct.MaHoaDon = hd.MaHoaDon) AS SoPhieuThue,
             (SELECT STRING_AGG(ct.MaThuePhong::text, ', ' ORDER BY ct.MaThuePhong)
              FROM CTHOADON ct WHERE ct.MaHoaDon = hd.MaHoaDon) AS DanhSachMaThuePhong
      FROM HOADON hd
      LEFT JOIN KHACHHANG kh ON hd.MaKhachHangThanhToan = kh.MaKhachHang
      LEFT JOIN COQUAN cq ON hd.MaCoQuan = cq.MaCoQuan
      ORDER BY hd.MaHoaDon ASC
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
      SELECT hd.*, kh.TenKhachHang, cq.TenCoQuan,
             CASE WHEN hd.MaCoQuan IS NOT NULL THEN cq.TenCoQuan ELSE kh.TenKhachHang END AS NguoiThanhToan,
             CASE WHEN hd.MaCoQuan IS NOT NULL THEN 'coquan' ELSE 'khach' END AS LoaiNguoiThanhToan
      FROM HOADON hd
      LEFT JOIN KHACHHANG kh ON hd.MaKhachHangThanhToan = kh.MaKhachHang
      LEFT JOIN COQUAN cq ON hd.MaCoQuan = cq.MaCoQuan
      WHERE hd.MaHoaDon = $1
    `, [id]);
    const ct = await db.query(`
      SELECT ct.*, tp.SoPhong, tp.SoNgayThue, tp.NgayBatDauThue,
             lp.LoaiPhong, lp.DonGia,
             (SELECT STRING_AGG(kh.TenKhachHang, ', ' ORDER BY cttp.ThuTuKhach)
              FROM CTTHUEPHONG cttp
              LEFT JOIN KHACHHANG kh ON cttp.MaKhachHang = kh.MaKhachHang
              WHERE cttp.MaThuePhong = ct.MaThuePhong) AS TenKhachThue,
      FROM CTHOADON ct
      LEFT JOIN THUEPHONG tp ON ct.MaThuePhong = tp.MaThuePhong
      LEFT JOIN PHONG p ON tp.SoPhong = p.SoPhong
      LEFT JOIN LOAIPHONG lp ON p.MaLoaiPhong = lp.MaLoaiPhong
      WHERE ct.MaHoaDon = $1
      ORDER BY ct.MaThuePhong ASC
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
