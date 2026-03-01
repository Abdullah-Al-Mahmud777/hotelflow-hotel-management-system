const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomviewController");
const validateId = require("../middlewares/validateId");
const validateRoom = require("../middlewares/validateRoom");

// GET all rooms
router.get("/", roomController.getAllRooms);

// GET room by ID
router.get("/:id", validateId, roomController.getRoomById);

// POST new room
router.post("/", validateRoom, roomController.createRoom);

module.exports = router;