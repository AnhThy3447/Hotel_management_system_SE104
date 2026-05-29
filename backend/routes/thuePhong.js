const router = require('express').Router();
const ctrl = require('../controllers/thuePhongController');

router.post('/', ctrl.taoPhieuThue);
router.get('/', ctrl.xemTatCa);
router.get('/:id', ctrl.xemChiTiet);
router.put('/:id', ctrl.capNhat);
router.patch('/:id/tra-phong', ctrl.traPhong);
router.delete('/:id', ctrl.xoaPhieuThue);

module.exports = router;
