const express = require("express");
const router = express.Router();

const phongController =
  require("../controllers/phongController");
router.get(
  "/loai-phong",
  phongController.getRoomTypes
);

router.post(
  "/loai-phong",
  phongController.createRoomType
);

router.put(
  "/loai-phong/:id",
  phongController.updateRoomType
);

router.delete(
  "/loai-phong/:id",
  phongController.deleteRoomType
);


router.get(
  "/",
  phongController.getRooms
);

router.get(
  "/:id",
  phongController.getRoomDetail
);

router.post(
  "/",
  phongController.createRoom
);

router.put(
  "/:id",
  phongController.updateRoom
);

router.delete(
  "/:id",
  phongController.deleteRoom
);

module.exports = router;