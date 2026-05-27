const express = require('express');
const router = express.Router();
const phongController = require('../controllers/phongController');

// Tuyến đường cho loại phòng (Đặt phía trên các tuyến đường động cấu hình ':id')
router.get('/loai-phong', phongController.getRoomTypes);
router.post('/loai-phong', phongController.createRoomType);
router.put('/loai-phong/:id', phongController.updateRoomTypePrice);
router.delete('/loai-phong/:id', phongController.deleteRoomType);

// Tuyến đường cho phòng
router.get('/', phongController.getRooms);
router.post('/', phongController.createRoom);
router.put('/:id', phongController.updateRoom);
router.delete('/:id', phongController.deleteRoom);

module.exports = router;