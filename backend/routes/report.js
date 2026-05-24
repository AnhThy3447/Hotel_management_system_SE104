const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/doanh-thu', reportController.getRevenueReport);
router.get('/khach', reportController.getGuestReport);

module.exports = router;