const router = require('express').Router();
const ctrl = require('../controllers/quyDinhController');

router.get('/thamso', ctrl.xemThamSo);
router.put('/thamso', ctrl.capNhatThamSo);
router.get('/phu-thu', ctrl.xemPhuThu);
router.put('/phu-thu/:thuTuKhach', ctrl.capNhatPhuThu);

module.exports = router;
