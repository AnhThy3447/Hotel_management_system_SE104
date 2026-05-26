const express = require("express");
const router = express.Router();
const roomController = require("../controllers/phongController");

router.get("/", roomController.getRooms);

router.post("/", roomController.createRoom);

router.put("/:id", roomController.updateRoom);
router.delete("/:id", roomController.deleteRoom);
router.get("/loai-phong", roomController.getRoomTypes);

router.post("/loai-phong", roomController.createRoomType);

router.put("/loai-phong/:id", roomController.updateRoomType);
router.delete("/loai-phong/:id", roomController.deleteRoomType);
router.get("/:id", roomController.getRoomDetail);

module.exports = router;