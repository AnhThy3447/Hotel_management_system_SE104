const db = require('../db');

exports.xemThamSo = async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM THAMSO`);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.capNhatThamSo = async (req, res) => {
  try {
    const { TenThamSo, GiaTri } = req.body;
    const result = await db.query(
      `UPDATE THAMSO SET GiaTri=$1 WHERE TenThamSo=$2 RETURNING *`,
      [GiaTri, TenThamSo]
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
