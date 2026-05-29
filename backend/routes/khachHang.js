const router = require('express').Router();
const ctrl = require('../controllers/khachHangController');

router.post('/', ctrl.themKhach);
router.get('/', ctrl.xemDanhSach);
router.get('/:id', ctrl.xemChiTiet);
router.put('/:id', ctrl.capNhat);

module.exports = router;
