const db = require('../db');

exports.taoHoaDon = async (req, res) => {
  try {
    const { MaThuephong, MaNhanVien, MaCoQuan, DanhSachChiTiet } = req.body;
    const hd = await db.query(
      `INSERT INTO HOADON (MaThuephong, MaNhanVien, MaCoQuan, NgayLap) VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [MaThuephong, MaNhanVien, MaCoQuan]
    );
    const MaHoaDon = hd.rows[0].mahoadon;
    for (const ct of DanhSachChiTiet) {
      await db.query(
        `INSERT INTO CTHOADON (MaHoaDon, MaPhong, SoNgayThue, DonGia) VALUES ($1, $2, $3, $4)`,
        [MaHoaDon, ct.MaPhong, ct.SoNgayThue, ct.DonGia]
      );
    }
    res.status(201).json({ success: true, data: hd.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.xemTatCa = async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM HOADON ORDER BY NgayLap DESC`);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.xemChiTiet = async (req, res) => {
  try {
    const { id } = req.params;
    const hd = await db.query(`SELECT * FROM HOADON WHERE MaHoaDon = $1`, [id]);
    const ct = await db.query(`SELECT * FROM CTHOADON WHERE MaHoaDon = $1`, [id]);
    res.json({ success: true, data: { hoaDon: hd.rows[0], chiTiet: ct.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.xemTheoPhieuThue = async (req, res) => {
  try {
    const { id } = req.params;
    const hd = await db.query(`SELECT * FROM HOADON WHERE MaThuephong = $1`, [id]);
    const MaHoaDon = hd.rows[0]?.mahoadon;
    const ct = MaHoaDon
      ? await db.query(`SELECT * FROM CTHOADON WHERE MaHoaDon = $1`, [MaHoaDon])
      : { rows: [] };
    res.json({ success: true, data: { hoaDon: hd.rows[0], chiTiet: ct.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
