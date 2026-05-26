const router = require('express').Router();

const ctrl = require('../controllers/phongController');
router.get('/', ctrl.testAPI);
router.get('/danh-sach', ctrl.xemDanhSachPhong);
router.post('/them', ctrl.themPhong);
router.put('/:id', ctrl.capNhatPhong);
router.delete('/:id', ctrl.xoaPhong);
router.get('/loai-phong', ctrl.xemLoaiPhong);
router.post('/loai-phong', ctrl.themLoaiPhong);
router.put('/loai-phong/:id', ctrl.capNhatLoaiPhong);

module.exports = router;