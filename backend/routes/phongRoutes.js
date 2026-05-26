const router = require('express').Router();

const ctrl =
    require('../controllers/phongController');

router.get(
    '/',
    ctrl.testAPI
);


router.get(
    '/loai-phong',
    ctrl.xemLoaiPhong
);

router.post(
    '/loai-phong',
    ctrl.themLoaiPhong
);

router.put(
    '/loai-phong/:id',
    ctrl.capNhatLoaiPhong
);


router.get(
    '/danh-sach',
    ctrl.xemDanhSachPhong
);

router.get(
    '/chi-tiet/:id',
    ctrl.xemChiTietPhong
);

router.post(
    '/',
    ctrl.themPhong
);

router.put(
    '/:id',
    ctrl.capNhatPhong
);

router.delete(
    '/:id',
    ctrl.xoaPhong
);

module.exports = router;