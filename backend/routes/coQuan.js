const router = require('express').Router();
const ctrl = require('../controllers/coQuanController');

router.post('/', ctrl.them);
router.get('/', ctrl.xemDanhSach);
router.get('/:id', ctrl.xemChiTiet);
router.put('/:id', ctrl.capNhat);

module.exports = router;
