const express = require("express");
const router = express.Router();

const phongController = require("../controllers/phongController");

// ================= ROOMS =================
router.get("/", phongController.getRooms);

router.post("/", phongController.addRoom);

router.put("/:id", phongController.updateRoom);

router.delete("/:id", phongController.deleteRoom);

// ================= ROOM TYPES =================
router.get("/loai-phong", phongController.getRoomTypes);

router.post("/loai-phong", phongController.addRoomType);

router.put("/loai-phong/:id", phongController.updateRoomType);

router.delete("/loai-phong/:id", phongController.deleteRoomType);

module.exports = router;