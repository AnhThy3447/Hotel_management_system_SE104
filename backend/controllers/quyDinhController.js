const db = require('../db');

exports.xemThamSo = async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM THAMSO LIMIT 1`);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.capNhatThamSo = async (req, res) => {
  try {
    const { SoKhachToiDa, SoKhachKhongTinhPhuThu } = req.body;
    const result = await db.query(
      `UPDATE THAMSO SET SoKhachToiDa=$1, SoKhachKhongTinhPhuThu=$2 RETURNING *`,
      [SoKhachToiDa, SoKhachKhongTinhPhuThu]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.xemPhuThu = async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM TILEPHUTHU ORDER BY ThuTuKhach`);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.capNhatPhuThu = async (req, res) => {
  try {
    const { thuTuKhach } = req.params;
    const { TiLe } = req.body;
    const result = await db.query(
      `UPDATE TILEPHUTHU SET TiLe=$1 WHERE ThuTuKhach=$2 RETURNING *`,
      [TiLe, thuTuKhach]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
