const express = require('express');
const router = express.Router();
const phongController = require('../controllers/phongController');

// Routes cho Loại phòng (Nên đặt trước để tránh nhầm với /:id)
router.get('/loai-phong', phongController.getRoomTypes);
router.post('/loai-phong', phongController.createRoomType);
router.put('/loai-phong/:id', phongController.updateRoomTypePrice);
router.delete('/loai-phong/:id', phongController.deleteRoomType);

// Routes cho Phòng
router.get('/', phongController.getRooms);
router.post('/', phongController.createRoom);
router.put('/:id', phongController.updateRoom);
router.delete('/:id', phongController.deleteRoom);

module.exports = router;