const router = require('express').Router();
const ctrl = require('../controllers/phongController');
router.get('/test', ctrl.testAPI);
router.get('/', ctrl.xemDanhSachPhong);

router.get('/chi-tiet/:id', ctrl.xemChiTietPhong);

router.post('/', ctrl.themPhong);

router.put('/:id', ctrl.capNhatPhong);

router.delete('/:id', ctrl.xoaPhong);

// URL: GET http://localhost:3000/api/phong/loai-phong
router.get('/loai-phong', ctrl.xemLoaiPhong);

router.post('/loai-phong', ctrl.themLoaiPhong);
router.put('/loai-phong/:id', ctrl.capNhatLoaiPhong);

module.exports = router;