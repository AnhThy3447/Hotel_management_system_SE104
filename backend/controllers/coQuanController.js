const db = require('../db');

exports.them = async (req, res) => {
  try {
    const { TenCoQuan, DiaChi } = req.body;
    const result = await db.query(
      `INSERT INTO COQUAN (TenCoQuan, DiaChi) VALUES ($1, $2) RETURNING *`,
      [TenCoQuan, DiaChi]
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
    const { TenCoQuan, DiaChi } = req.body;
    const result = await db.query(
      `UPDATE COQUAN SET TenCoQuan=$1, DiaChi=$2 WHERE MaCoQuan=$3 RETURNING *`,
      [TenCoQuan, DiaChi, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
