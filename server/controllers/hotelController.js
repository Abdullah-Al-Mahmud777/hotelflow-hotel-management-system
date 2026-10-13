const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const { bookedUnits } = require('./bookingController');

// GET /api/hotels — list with filters: search (name/city), stars,
// minStars, amenities (comma list, all must match), minPrice/maxPrice (by
// cheapest room), sort (price | rating | popularity). Each hotel carries
// roomCount + minPrice so cards render without extra requests.
exports.getHotels = async (req, res) => {
  try {
    const { search, stars, minStars, amenities, minPrice, maxPrice, sort } = req.query;

    const query = {};
    if (search) {
      const rx = new RegExp(search.trim(), 'i');
      query.$or = [{ name: rx }, { city: rx }, { address: rx }];
    }
    if (stars) query.stars = Number(stars);
    else if (minStars) query.stars = { $gte: Number(minStars) };
    if (amenities) {
      const list = String(amenities).split(',').map((a) => a.trim()).filter(Boolean);
      if (list.length) query.amenities = { $all: list };
    }

    const hotels = await Hotel.find(query).sort({ createdAt: -1 }).lean();
    const rooms = await Room.find({}).select('hotel price').lean();
    const byHotel = {};
    rooms.forEach((r) => {
      if (!r.hotel) return;
      const k = String(r.hotel);
      byHotel[k] = byHotel[k] || { count: 0, min: Infinity };
      byHotel[k].count += 1;
      if (typeof r.price === 'number') byHotel[k].min = Math.min(byHotel[k].min, r.price);
    });

    let data = hotels.map((h) => {
      const agg = byHotel[String(h._id)] || { count: 0, min: null };
      return {
        ...h,
        roomCount: agg.count,
        minPrice: agg.min === Infinity ? null : agg.min,
      };
    });

    if (minPrice || maxPrice) {
      const lo = minPrice ? Number(minPrice) : -Infinity;
      const hi = maxPrice ? Number(maxPrice) : Infinity;
      data = data.filter((h) => h.minPrice != null && h.minPrice >= lo && h.minPrice <= hi);
    }

    if (sort === 'price') data.sort((a, b) => (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity));
    else if (sort === 'rating') data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sort === 'popularity') data.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching hotels', error: error.message });
  }
};

// GET /api/hotels/:id — hotel + its rooms. With checkIn&checkOut every room
// is annotated with remainingRooms / availableForDates (inventory-aware).
exports.getHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).lean();
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }
    const { checkIn, checkOut } = req.query;
    const rooms = await Room.find({ hotel: hotel._id }).sort({ price: 1 }).lean();
    const annotated = await Promise.all(
      rooms.map(async (room) => {
        const total = room.totalRooms || 1;
        let remaining = total;
        if (checkIn && checkOut) {
          const used = await bookedUnits(room._id, checkIn, checkOut);
          remaining = Math.max(0, total - used);
        }
        return {
          ...room,
          remainingRooms: remaining,
          availableForDates: room.availability !== false && remaining > 0,
        };
      })
    );
    const priced = annotated.filter((r) => typeof r.price === 'number').map((r) => r.price);
    res.json({
      success: true,
      data: {
        ...hotel,
        rooms: annotated,
        roomCount: annotated.length,
        minPrice: priced.length ? Math.min(...priced) : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching hotel', error: error.message });
  }
};
