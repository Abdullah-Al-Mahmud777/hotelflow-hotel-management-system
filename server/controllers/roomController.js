const Room = require('../models/Room');
const Booking = require('../models/Booking');

// Get all rooms with filters
exports.getRooms = async (req, res) => {
  try {
    const { type, minPrice, maxPrice, checkIn, checkOut } = req.query;
    
    let query = {};
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    let rooms = await Room.find(query).sort({ featured: -1, createdAt: -1 });
    
    // Filter by availability if dates provided
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      
      const bookedRoomIds = await Booking.find({
        status: { $ne: 'cancelled' },
        $or: [
          { checkIn: { $lte: checkOutDate }, checkOut: { $gte: checkInDate } }
        ]
      }).distinct('room');
      
      rooms = rooms.filter(room => !bookedRoomIds.some(id => id.equals(room._id)));
    }
    
    res.json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching rooms',
      error: error.message
    });
  }
};

// Get featured rooms
exports.getFeaturedRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ featured: true }).limit(6);
    
    res.json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching featured rooms',
      error: error.message
    });
  }
};

// Get single room
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching room',
      error: error.message
    });
  }
};

// Create room (admin)
exports.createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    
    res.status(201).json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating room',
      error: error.message
    });
  }
};
