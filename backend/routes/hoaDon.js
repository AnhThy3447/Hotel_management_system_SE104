const router = require('express').Router();
const ctrl = require('../controllers/hoaDonController');

router.post('/', ctrl.taoHoaDon);
router.get('/', ctrl.xemTatCa);
router.get('/:id', ctrl.xemChiTiet);
router.get('/:id/chi-tiet', ctrl.xemTheoPhieuThue);
router.delete('/:id', ctrl.xoaHoaDon);

module.exports = router;
