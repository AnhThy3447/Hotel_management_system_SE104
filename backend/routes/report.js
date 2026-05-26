const express = require('express');

const router = express.Router();

const reportController = require('../controllers/reportController');

console.log('📊 Report Route Loaded');


router.get('/', (req, res) => {

    res.json({
        success: true,
        message: 'Report API working'
    });

});

router.get(
    '/doanh-thu',
    reportController.getRevenueReport
);


router.get(
    '/khach',
    reportController.getGuestReport
);

module.exports = router;