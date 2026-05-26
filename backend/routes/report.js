const router = require('express').Router();

const ctrl = require('../controllers/reportController');


router.get('/', ctrl.testAPI);

router.get('/doanh-thu', ctrl.xemBaoCaoDoanhThu);

router.get('/khach', ctrl.xemBaoCaoKhach);

module.exports = router;