const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomviewController");
const validateId = require("../middlewares/validateId");

// Get all rooms
router.get("/", roomController.getAllRooms);

// Get single room by ID
router.get("/:id", validateId, roomController.getRoomById);

module.exports = router;
