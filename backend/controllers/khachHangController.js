const db = require('../db');

exports.themKhach = async (req, res) => {
  try {
    const { TenKhachHang, MaLoaiKhach, CMND, DiaChi } = req.body;
    const result = await db.query(
      `INSERT INTO KHACHHANG (TenKhachHang, MaLoaiKhach, CMND, DiaChi) VALUES ($1, $2, $3, $4) RETURNING *`,
      [TenKhachHang, MaLoaiKhach, CMND, DiaChi]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.xemDanhSach = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT kh.*, lk.LoaiKhach FROM KHACHHANG kh
       LEFT JOIN LOAIKHACH lk ON kh.MaLoaiKhach = lk.MaLoaiKhach`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.xemChiTiet = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT kh.*, lk.LoaiKhach FROM KHACHHANG kh
       LEFT JOIN LOAIKHACH lk ON kh.MaLoaiKhach = lk.MaLoaiKhach
       WHERE kh.MaKhachHang = $1`,
      [id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.capNhat = async (req, res) => {
  try {
    const { id } = req.params;
    const { TenKhachHang, MaLoaiKhach, CMND, DiaChi } = req.body;
    const result = await db.query(
      `UPDATE KHACHHANG SET TenKhachHang=$1, MaLoaiKhach=$2, CMND=$3, DiaChi=$4
       WHERE MaKhachHang=$5 RETURNING *`,
      [TenKhachHang, MaLoaiKhach, CMND, DiaChi, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
