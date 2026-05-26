const db = require('../db');

// ================================================================
// PHONG
// ================================================================

// GET /api/phong
const getDanhSachPhong = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        p.sophong,
        p.maloaiphong,
        lp.loaiphong   AS tenloaiphong,
        lp.dongia,
        p.tinhtrang,
        p.ghichu
      FROM phong p
      LEFT JOIN loaiphong lp ON p.maloaiphong = lp.maloaiphong
      ORDER BY p.sophong
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('getDanhSachPhong:', err.message);
    res.status(500).json({ message: 'Lỗi server: ' + err.message });
  }
};

// POST /api/phong
const themPhong = async (req, res) => {
  // Vì sophong là SERIAL nên không nhận từ req.body nữa
  const { maloaiphong, tinhtrang, ghichu } = req.body;

  if (!maloaiphong) {
    return res.status(400).json({ message: 'Thiếu maloaiphong (Mã loại phòng)' });
  }

  try {
    // Chuyển đổi maloaiphong sang kiểu số nguyên để khớp với DB
    const maLoaiInt = parseInt(maloaiphong, 10);

    const result = await db.query(
      `INSERT INTO phong (maloaiphong, tinhtrang, ghichu)
       VALUES ($1, $2, $3)
       RETURNING sophong`,
      [maLoaiInt, tinhtrang || 'Trống', ghichu || '']
    );

    res.status(201).json({ 
      message: 'Thêm phòng thành công', 
      sophong: result.rows[0].sophong 
    });
  } catch (err) {
    console.error('themPhong:', err.message);
    res.status(500).json({ message: 'Lỗi server: ' + err.message });
  }
};

// PUT /api/phong/:id
const capNhatPhong = async (req, res) => {
  const { id } = req.params; // id này là số phòng (sophong)
  const { maloaiphong, tinhtrang, ghichu } = req.body;

  try {
    const result = await db.query(
      `UPDATE phong
       SET maloaiphong = COALESCE($1, maloaiphong),
           tinhtrang   = COALESCE($2, tinhtrang),
           ghichu      = COALESCE($3, ghichu)
       WHERE sophong = $4
       RETURNING *`,
      [maloaiphong ? parseInt(maloaiphong, 10) : null, tinhtrang, ghichu, parseInt(id, 10)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }
    res.json({ message: 'Cập nhật thành công', phong: result.rows[0] });
  } catch (err) {
    console.error('capNhatPhong:', err.message);
    res.status(500).json({ message: 'Lỗi server: ' + err.message });
  }
};

// DELETE /api/phong/:id
const xoaPhong = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'DELETE FROM phong WHERE sophong = $1 RETURNING sophong',
      [parseInt(id, 10)]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }
    res.json({ message: `Đã xóa phòng ${id}` });
  } catch (err) {
    console.error('xoaPhong:', err.message);
    res.status(500).json({ message: 'Lỗi server: ' + err.message });
  }
};

// ================================================================
// LOAI PHONG
// ================================================================

// GET /api/phong/loai-phong
const getDanhSachLoaiPhong = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT maloaiphong, loaiphong AS tenloaiphong, dongia FROM loaiphong ORDER BY maloaiphong'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getDanhSachLoaiPhong:', err.message);
    res.status(500).json({ message: 'Lỗi server: ' + err.message });
  }
};

// POST /api/phong/loai-phong
const themLoaiPhong = async (req, res) => {
  // maloaiphong là SERIAL nên chỉ cần lấy tenloaiphong (loaiphong) và dongia
  const { tenloaiphong, dongia } = req.body;

  if (!tenloaiphong) {
    return res.status(400).json({ message: 'Thiếu tên loại phòng' });
  }

  try {
    const result = await db.query(
      'INSERT INTO loaiphong (loaiphong, dongia) VALUES ($1, $2) RETURNING maloaiphong',
      [tenloaiphong, parseInt(dongia, 10) || 0]
    );

    res.status(201).json({ 
      message: 'Thêm loại phòng thành công', 
      maloaiphong: result.rows[0].maloaiphong 
    });
  } catch (err) {
    console.error('themLoaiPhong:', err.message);
    res.status(500).json({ message: 'Lỗi server: ' + err.message });
  }
};

// PUT /api/phong/loai-phong/:id
const capNhatDonGiaLoaiPhong = async (req, res) => {
  const { id } = req.params;
  const { dongia, tenloaiphong } = req.body;

  try {
    const result = await db.query(
      `UPDATE loaiphong
       SET dongia    = COALESCE($1, dongia),
           loaiphong = COALESCE($2, loaiphong)
       WHERE maloaiphong = $3
       RETURNING *`,
      [dongia ? parseInt(dongia, 10) : null, tenloaiphong, parseInt(id, 10)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy loại phòng' });
    }

    res.json({ message: 'Cập nhật thành công', loaiPhong: result.rows[0] });
  } catch (err) {
    console.error('capNhatDonGiaLoaiPhong:', err.message);
    res.status(500).json({ message: 'Lỗi server: ' + err.message });
  }
};

module.exports = {
  getDanhSachPhong,
  themPhong,
  capNhatPhong,
  xoaPhong,
  getDanhSachLoaiPhong,
  themLoaiPhong,
  capNhatDonGiaLoaiPhong,
};