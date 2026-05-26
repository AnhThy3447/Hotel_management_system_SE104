const express = require('express');
const router  = express.Router();

const {
  getDanhSachPhong,
  themPhong,
  capNhatPhong,
  xoaPhong,
  getDanhSachLoaiPhong,
  themLoaiPhong,
  capNhatDonGiaLoaiPhong,
} = require('../controllers/phongController');

// ── Loại phòng (khai báo TRƯỚC /api/phong/:id để tránh conflict) ──
router.get   ('/loai-phong',     getDanhSachLoaiPhong);
router.post  ('/loai-phong',     themLoaiPhong);
router.put   ('/loai-phong/:id', capNhatDonGiaLoaiPhong);

// ── Phòng ──
router.get   ('/',    getDanhSachPhong);
router.post  ('/',    themPhong);
router.put   ('/:id', capNhatPhong);
router.delete('/:id', xoaPhong);

module.exports = router;
module.exports = router;