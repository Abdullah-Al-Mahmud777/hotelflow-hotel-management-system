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

// GET room by ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await RoomView.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST new room
exports.createRoom = async (req, res) => {
  try {
    const newRoom = new RoomView(req.body);
    const savedRoom = await newRoom.save();
    res.status(201).json(savedRoom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
