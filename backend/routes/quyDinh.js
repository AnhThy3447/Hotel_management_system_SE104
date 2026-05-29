const express = require('express');
const router = express.Router();
const quyDinhController = require('../controllers/quyDinhController');

// THAM SỐ hệ thống
router.get('/tham-so', quyDinhController.xemThamSo);
router.put('/tham-so/cap-nhat', quyDinhController.capNhatThamSo);

// TỶ LỆ PHỤ THU theo thứ tự khách
router.get('/phu-thu', quyDinhController.xemPhuThu);
router.put('/phu-thu/cap-nhat/:thuTuKhach', quyDinhController.capNhatPhuThu);

// CRUD LOẠI KHÁCH
router.get('/loai-khach', quyDinhController.xemLoaiKhach);
router.post('/loai-khach/them', quyDinhController.themLoaiKhach);
router.put('/loai-khach/sua/:id', quyDinhController.suaLoaiKhach);
router.delete('/loai-khach/xoa/:id', quyDinhController.xoaLoaiKhach);

module.exports = router;