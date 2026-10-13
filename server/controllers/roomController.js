const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { bookedUnits } = require('./bookingController');

// Get all rooms with filters
exports.getRooms = async (req, res) => {
  try {
    const { type, minPrice, maxPrice, checkIn, checkOut, hotel } = req.query;

    let query = {};

    if (type && type !== 'all') {
      query.type = type;
    }

    if (hotel) {
      query.hotel = hotel;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    let rooms = await Room.find(query).sort({ featured: -1, createdAt: -1 });
    
    // Inventory-aware availability: annotate every room with remaining
    // units for the dates and drop fully-booked ones (same visible result
    // as before for single-unit rooms, plus exact counts for inventory).
    if (checkIn && checkOut) {
      const annotated = await Promise.all(
        rooms.map(async (room) => {
          const total = room.totalRooms || 1;
          const used = await bookedUnits(room._id, checkIn, checkOut);
          const remaining = Math.max(0, total - used);
          const obj = room.toObject();
          obj.remainingRooms = remaining;
          obj.availableForDates = room.availability !== false && remaining > 0;
          return obj;
        })
      );
      rooms = annotated.filter((room) => room.remainingRooms > 0);
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

// Availability of one room for dates: { available, remaining, totalRooms }.
exports.getRoomAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut, rooms } = req.query;
    if (!checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: 'checkIn and checkOut are required' });
    }
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    const total = room.totalRooms || 1;
    const used = await bookedUnits(room._id, checkIn, checkOut);
    const remaining = Math.max(0, total - used);
    const need = Math.max(1, Number(rooms) || 1);
    res.json({
      success: true,
      data: {
        available: room.availability !== false && remaining >= need,
        remainingRooms: remaining,
        totalRooms: total,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error checking availability', error: error.message });
  }
};

// Get featured rooms
exports.getFeaturedRooms = async (req, res) => {
  try {
    // Try to get featured rooms first
    let rooms = await Room.find({ featured: true }).limit(6);
    
    // If no featured rooms exist, get all rooms
    if (rooms.length === 0) {
      rooms = await Room.find().limit(6);
    }
    
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

// Update room (admin)
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
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
    res.status(400).json({
      success: false,
      message: 'Error updating room',
      error: error.message
    });
  }
};

// Delete room (admin)
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting room',
      error: error.message
    });
  }
};
