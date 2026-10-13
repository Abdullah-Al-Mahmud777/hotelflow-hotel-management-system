const Room = require('../models/Room');
const Favorite = require('../models/Favorite');

// GET /api/favorites?page=&limit= — user's wishlist, populated rooms
exports.listFavorites = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const [items, total] = await Promise.all([
      Favorite.find({ user: req.user._id })
        .populate('room')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Favorite.countDocuments({ user: req.user._id }),
    ]);
    res.json({ success: true, count: items.length, total, page, pages: Math.ceil(total / limit), data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load wishlist', error: error.message });
  }
};

// POST /api/favorites — { roomId }
exports.addFavorite = async (req, res) => {
  try {
    const { roomId } = req.body;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    try {
      const fav = await Favorite.create({ user: req.user._id, room: roomId });
      await fav.populate('room');
      return res.status(201).json({ success: true, data: fav });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ success: false, message: 'Room already in wishlist' });
      }
      throw err;
    }
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to add favorite', error: error.message });
  }
};

// DELETE /api/favorites/:roomId
exports.removeFavorite = async (req, res) => {
  try {
    const deleted = await Favorite.findOneAndDelete({ user: req.user._id, room: req.params.roomId });
    if (!deleted) return res.status(404).json({ success: false, message: 'Favorite not found' });
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove favorite', error: error.message });
  }
};
