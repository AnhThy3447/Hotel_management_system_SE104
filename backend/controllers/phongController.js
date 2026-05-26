const db = require('../db'); // pool hoặc client từ neon/postgres
 
// ================================================================
// PHONG
// ================================================================
 
// GET /api/phong  → danh sách phòng kèm tên loại phòng
const getDanhSachPhong = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        p.SOPHONG,
        p.MALOAIPHONG,
        lp.TENLOAIPHONG,
        p.DONGIA,
        p.TINHTRANG,
        p.GHICHU
      FROM PHONG p
      LEFT JOIN LOAIPHONG lp ON p.MALOAIPHONG = lp.MALOAIPHONG
      ORDER BY p.SOPHONG
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('getDanhSachPhong:', err.message);
    res.status(500).json({ message: 'Lỗi server: ' + err.message });
  }
};
 
// POST /api/phong  → thêm phòng mới
const themPhong = async (req, res) => {
  const { SOPHONG, MALOAIPHONG, DONGIA, TINHTRANG, GHICHU } = req.body;
 
  if (!SOPHONG || !MALOAIPHONG) {
    return res.status(400).json({ message: 'Thiếu SOPHONG hoặc MALOAIPHONG' });
  }
 
  try {
    // Kiểm tra trùng mã phòng
    const check = await db.query(
      'SELECT SOPHONG FROM PHONG WHERE SOPHONG = $1',
      [SOPHONG]
    );
    if (check.rows.length > 0) {
      return res.status(409).json({ message: 'Mã phòng đã tồn tại' });
    }
 
    await db.query(
      `INSERT INTO PHONG (SOPHONG, MALOAIPHONG, DONGIA, TINHTRANG, GHICHU)
       VALUES ($1, $2, $3, $4, $5)`,
      [SOPHONG, MALOAIPHONG, DONGIA || 0, TINHTRANG || 'available', GHICHU || '']
    );
 
    res.status(201).json({ message: 'Thêm phòng thành công', SOPHONG });
  } catch (err) {
    console.error('themPhong:', err.message);
    res.status(500).json({ message: 'Lỗi server: ' + err.message });
  }
};
 
// PUT /api/phong/:id  → cập nhật thông tin phòng
const capNhatPhong = async (req, res) => {
  const { id } = req.params;
  const { MALOAIPHONG, DONGIA, TINHTRANG, GHICHU } = req.body;
 
  try {
    const result = await db.query(
      `UPDATE PHONG
       SET MALOAIPHONG = COALESCE($1, MALOAIPHONG),
           DONGIA      = COALESCE($2, DONGIA),
           TINHTRANG   = COALESCE($3, TINHTRANG),
           GHICHU      = COALESCE($4, GHICHU)
       WHERE SOPHONG = $5
       RETURNING *`,
      [MALOAIPHONG, DONGIA, TINHTRANG, GHICHU, id]
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
 
// DELETE /api/phong/:id  → xóa phòng
const xoaPhong = async (req, res) => {
  const { id } = req.params;
 
  try {
    const result = await db.query(
      'DELETE FROM PHONG WHERE SOPHONG = $1 RETURNING SOPHONG',
      [id]
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
 
// GET /api/phong/loai-phong  → danh sách loại phòng
const getDanhSachLoaiPhong = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT MALOAIPHONG, TENLOAIPHONG, DONGIA FROM LOAIPHONG ORDER BY MALOAIPHONG'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getDanhSachLoaiPhong:', err.message);
    res.status(500).json({ message: 'Lỗi server: ' + err.message });
  }
};
 
// POST /api/phong/loai-phong  → thêm loại phòng mới
const themLoaiPhong = async (req, res) => {
  const { MALOAIPHONG, TENLOAIPHONG, DONGIA } = req.body;
 
  if (!MALOAIPHONG || !TENLOAIPHONG) {
    return res.status(400).json({ message: 'Thiếu MALOAIPHONG hoặc TENLOAIPHONG' });
  }
 
  try {
    const check = await db.query(
      'SELECT MALOAIPHONG FROM LOAIPHONG WHERE MALOAIPHONG = $1',
      [MALOAIPHONG]
    );
    if (check.rows.length > 0) {
      return res.status(409).json({ message: 'Mã loại phòng đã tồn tại' });
    }
 
    await db.query(
      'INSERT INTO LOAIPHONG (MALOAIPHONG, TENLOAIPHONG, DONGIA) VALUES ($1, $2, $3)',
      [MALOAIPHONG, TENLOAIPHONG, DONGIA || 0]
    );
 
    res.status(201).json({ message: 'Thêm loại phòng thành công', MALOAIPHONG });
  } catch (err) {
    console.error('themLoaiPhong:', err.message);
    res.status(500).json({ message: 'Lỗi server: ' + err.message });
  }
};
 
// PUT /api/phong/loai-phong/:id  → chỉnh sửa đơn giá loại phòng
const capNhatDonGiaLoaiPhong = async (req, res) => {
  const { id } = req.params;
  const { DONGIA, TENLOAIPHONG } = req.body;
 
  try {
    const result = await db.query(
      `UPDATE LOAIPHONG
       SET DONGIA      = COALESCE($1, DONGIA),
           TENLOAIPHONG= COALESCE($2, TENLOAIPHONG)
       WHERE MALOAIPHONG = $3
       RETURNING *`,
      [DONGIA, TENLOAIPHONG, id]
    );
 
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy loại phòng' });
    }
 
    // Đồng bộ đơn giá các phòng thuộc loại này
    if (DONGIA) {
      await db.query(
        'UPDATE PHONG SET DONGIA = $1 WHERE MALOAIPHONG = $2',
        [DONGIA, id]
      );
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
