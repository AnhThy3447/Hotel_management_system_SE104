const db = require('../db');

exports.them = async (req, res) => {
  try {
    const { TenCoQuan, DiaChi, MaSoThue, NguoiDaiDien, SoDienThoai } = req.body;
    const result = await db.query(
      `INSERT INTO COQUAN (TenCoQuan, DiaChi, MaSoThue, NguoiDaiDien, SoDienThoai) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [TenCoQuan, DiaChi, MaSoThue, NguoiDaiDien, SoDienThoai]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.xemDanhSach = async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM COQUAN`);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.xemChiTiet = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`SELECT * FROM COQUAN WHERE MaCoQuan = $1`, [id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.capNhat = async (req, res) => {
  try {
    const { id } = req.params;
    const { TenCoQuan, DiaChi, MaSoThue, NguoiDaiDien, SoDienThoai } = req.body;
    const result = await db.query(
      `UPDATE COQUAN SET TenCoQuan=$1, DiaChi=$2, MaSoThue=$3, NguoiDaiDien=$4, SoDienThoai=$5
       WHERE MaCoQuan=$6 RETURNING *`,
      [TenCoQuan, DiaChi, MaSoThue, NguoiDaiDien, SoDienThoai, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
