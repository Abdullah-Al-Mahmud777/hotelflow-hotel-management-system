const RoomView = require("../models/roomview");

// GET all rooms
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await RoomView.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET single room by ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await RoomView.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
