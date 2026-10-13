// Seed 20 Bangladesh hotels + their rooms (idempotent — reruns skip names
// that already exist, so no duplicates are ever created).
// Usage: npm run seed:hotels   (uses MONGO_URI from server/.env)
// Every row is a clearly-labeled demo listing (demo: true) with BDT prices
// and local /images/bd photos, matching the frontend gallery.
const mongoose = require('mongoose');
require('dotenv').config();

const Hotel = require('../models/Hotel');
const Room = require('../models/Room');

const IMG = '/images/bd';

// Room templates: [type, price, capacity, beds, bedType, size, view, totalRooms]
const R = {
  singleStd: ['Single', 1800, 1, '1 Single bed', 'Single', 220, 'City view', 10],
  doubleStd: ['Double', 3200, 2, '1 Queen bed', 'Queen', 300, 'City view', 8],
  doubleSea: ['Double', 5500, 2, '1 Queen bed', 'Queen', 320, 'Sea view', 8],
  twinStd: ['Double', 3800, 2, '2 Twin beds', 'Twin', 310, 'City view', 6],
  deluxeKing: ['Deluxe', 7500, 2, '1 King bed', 'King', 380, 'City view', 6],
  deluxeSea: ['Deluxe', 12000, 2, '1 King bed', 'King', 390, 'Sea view', 6],
  deluxeHill: ['Deluxe', 6500, 2, '1 Queen bed', 'Queen', 350, 'Hill view', 6],
  deluxeRiver: ['Deluxe', 6800, 2, '1 King bed', 'King', 360, 'River view', 6],
  deluxeLake: ['Deluxe', 7200, 2, '1 King bed', 'King', 370, 'Lake view', 6],
  familyStd: ['Family', 5500, 4, '1 Queen + 2 Twin beds', 'Twin', 430, 'City view', 5],
  familySea: ['Family', 9500, 5, '1 King + 2 Twin beds', 'Twin', 480, 'Sea view', 4],
  suiteExec: ['Suite', 15000, 3, '1 King bed + sofa bed', 'King', 520, 'City view', 3],
  suiteSea: ['Suite', 18500, 3, '1 King bed + sofa bed', 'King', 540, 'Sea view', 3],
  suiteHill: ['Suite', 9200, 3, '1 King bed + sofa bed', 'King', 500, 'Hill view', 2],
};

const AMEN = {
  wifi: 'Free Wi-Fi',
  ac: 'A/C',
  breakfast: 'Free breakfast',
  parking: 'Parking',
  generator: 'Generator backup',
  halal: 'Halal food',
  prayer: 'Prayer room nearby',
  airport: 'Airport pickup',
  pool: 'Swimming pool',
  gym: 'Gym',
  garden: 'Garden',
  roomService: 'Room service',
  tv: 'TV',
  balcony: 'Balcony',
};
const BASE = [AMEN.wifi, AMEN.ac, AMEN.breakfast, AMEN.parking, AMEN.generator, AMEN.halal, AMEN.prayer];
const FULL = [...BASE, AMEN.airport, AMEN.pool, AMEN.gym, AMEN.roomService, AMEN.tv, AMEN.balcony];

const HOTELS = [
  {
    name: 'Gulshan Grand Hotel', city: 'Dhaka',
    address: 'House 8, Road 11, Banani, Dhaka 1213, Bangladesh',
    description: 'Business hotel in the Banani commercial hub with skyline-view rooms and conference halls.',
    images: [`${IMG}/hotels/hotel-gulshan.jpg`, `${IMG}/destinations/dest-dhaka.jpg`],
    stars: 4, rating: 8.8, reviewsCount: 1932, amenities: [...FULL], checkInTime: '2:00 PM', checkOutTime: '12:00 PM',
    contact: { phone: '+880 1712-000001', email: 'info@gulshangrand.com.bd' },
    rooms: ['doubleStd', 'deluxeKing', 'suiteExec'],
  },
  {
    name: "Sea Pearl Beach Resort", city: "Cox's Bazar",
    address: "Plot 12, Kolatoli Road, Cox's Bazar 4700, Bangladesh",
    description: 'Beachfront resort on Kolatoli beach with private beach access and seafood restaurants.',
    images: [`${IMG}/hotels/hotel-sea-pearl.jpg`, `${IMG}/destinations/dest-coxsbazar.jpg`, `${IMG}/hero/hero-coxsbazar-beach.jpg`],
    stars: 5, rating: 9.2, reviewsCount: 2140, amenities: [...FULL, 'Sea view'], checkInTime: '2:00 PM', checkOutTime: '12:00 PM',
    contact: { phone: '+880 1712-000002', email: 'info@seapearlresort.com.bd' },
    rooms: ['doubleSea', 'deluxeSea', 'familySea', 'suiteSea'],
  },
  {
    name: 'Green Valley Hotel', city: 'Sylhet',
    address: 'East Zindabazar, Sylhet 3100, Bangladesh',
    description: 'Comfortable city hotel minutes from Jaflong and Ratargul day-trip routes.',
    images: [`${IMG}/hotels/hotel-sylhet.jpg`, `${IMG}/destinations/dest-sylhet-tea-garden.jpg`],
    stars: 3, rating: 8.2, reviewsCount: 754, amenities: [...BASE, AMEN.tv], checkInTime: '2:00 PM', checkOutTime: '12:00 PM',
    contact: { phone: '+880 1712-000003', email: 'info@greenvalleysylhet.com.bd' },
    rooms: ['singleStd', 'doubleStd', 'deluxeKing'],
  },
  {
    name: 'Bay Breeze Hotel', city: 'Chattogram',
    address: 'Sheikh Mujib Road, Agrabad, Chattogram 4100, Bangladesh',
    description: 'Business hotel in Agrabad with Patenga beach shuttles and generator backup.',
    images: [`${IMG}/hotels/hotel-chattogram.jpg`, `${IMG}/hero/hero-coxsbazar-beach.jpg`],
    stars: 3, rating: 8.1, reviewsCount: 689, amenities: [...BASE, AMEN.airport, AMEN.tv], checkInTime: '2:00 PM', checkOutTime: '12:00 PM',
    contact: { phone: '+880 1712-000004', email: 'info@baybreezectg.com.bd' },
    rooms: ['singleStd', 'doubleStd', 'twinStd'],
  },
  {
    name: 'Nilgiri Hills Resort', city: 'Bandarban',
    address: 'Nilgiri Road, Bandarban 4600, Bangladesh',
    description: 'Hilltop resort with cloud-level sunrise views and bonfire decks.',
    images: [`${IMG}/hotels/hotel-bandarban.jpg`, `${IMG}/destinations/dest-bandarban.jpg`, `${IMG}/hero/hero-sajek-clouds.jpg`],
    stars: 4, rating: 9.0, reviewsCount: 587, amenities: [...BASE, AMEN.garden, AMEN.balcony], checkInTime: '1:00 PM', checkOutTime: '12:00 PM',
    contact: { phone: '+880 1712-000005', email: 'info@nilgirihills.com.bd' },
    rooms: ['deluxeHill', 'suiteHill', 'familyStd'],
  },
  {
    name: 'Kaptai Lake View Hotel', city: 'Rangamati',
    address: 'Reserve Bazar, Rangamati 4500, Bangladesh',
    description: 'Lakeside hotel facing Kaptai Lake with boat trips and tribal handicraft shops.',
    images: [`${IMG}/destinations/dest-rangamati.jpg`, `${IMG}/hero/hero-sylhet-tea-garden.jpg`],
    stars: 3, rating: 8.3, reviewsCount: 412, amenities: [...BASE, AMEN.balcony, AMEN.tv], checkInTime: '2:00 PM', checkOutTime: '12:00 PM',
    contact: { phone: '+880 1712-000006', email: 'info@kaptailake.com.bd' },
    rooms: ['doubleStd', 'deluxeLake', 'familyStd'],
  },
  {
    name: 'Kuakata Sunset Inn', city: 'Kuakata',
    address: 'Sea Beach Road, Kuakata, Patuakhali 8600, Bangladesh',
    description: 'Family inn famous for sunrise-and-sunset views over the Bay of Bengal.',
    images: [`${IMG}/hotels/hotel-kuakata.jpg`, `${IMG}/destinations/dest-kuakata.jpg`],
    stars: 2, rating: 7.4, reviewsCount: 418, amenities: [...BASE], checkInTime: '3:00 PM', checkOutTime: '11:00 AM',
    contact: { phone: '+880 1712-000007', email: 'info@kuakatasunset.com.bd' },
    rooms: ['singleStd', 'familyStd'],
  },
  {
    name: 'Hill View Resort', city: 'Sajek Valley',
    address: 'Ruilui Para, Sajek, Rangamati 4500, Bangladesh',
    description: 'Wooden cottages above the clouds with Chander Gari tour arrangements.',
    images: [`${IMG}/hotels/hotel-sajek.jpg`, `${IMG}/destinations/dest-sajek-valley.jpg`, `${IMG}/hero/hero-sajek-clouds.jpg`],
    stars: 3, rating: 8.7, reviewsCount: 1243, amenities: [...BASE, AMEN.balcony, AMEN.garden], checkInTime: '2:00 PM', checkOutTime: '12:00 PM',
    contact: { phone: '+880 1712-000008', email: 'info@hillviewsajek.com.bd' },
    rooms: ['deluxeHill', 'familyStd', 'twinStd'],
  },
  {
    name: 'Padma Riverside Hotel', city: 'Rajshahi',
    address: 'Shaheb Bazar, Rajshahi 6000, Bangladesh',
    description: 'Riverside hotel overlooking the Padma with mango-orchard breakfasts in season.',
    images: [`${IMG}/hotels/hotel-rajshahi.jpg`, `${IMG}/destinations/dest-rangamati.jpg`],
    stars: 4, rating: 8.7, reviewsCount: 1086, amenities: [...FULL], checkInTime: '2:00 PM', checkOutTime: '12:00 PM',
    contact: { phone: '+880 1712-000009', email: 'info@padmariverside.com.bd' },
    rooms: ['doubleStd', 'deluxeRiver', 'suiteExec'],
  },
  {
    name: 'Sundarban Eco Lodge', city: 'Khulna',
    address: 'Khan Jahan Ali Road, Khulna 9100, Bangladesh',
    description: 'Eco lodge base for Sundarbans day trips with packed breakfasts and guides.',
    images: [`${IMG}/hotels/hotel-khulna.jpg`, `${IMG}/destinations/dest-sundarbans.jpg`],
    stars: 2, rating: 7.6, reviewsCount: 342, amenities: [...BASE, AMEN.garden], checkInTime: '2:00 PM', checkOutTime: '12:00 PM',
    contact: { phone: '+880 1712-000010', email: 'info@sundarbaneco.com.bd' },
    rooms: ['singleStd', 'twinStd'],
  },
  {
    name: 'Bhawal Forest Resort', city: 'Gazipur',
    address: 'Rajendrapur, Gazipur 1700, Bangladesh',
    description: 'Forest resort beside Bhawal National Park with picnic grounds and pools.',
    images: [`${IMG}/destinations/dest-srimangal.jpg`, `${IMG}/hero/hero-sylhet-tea-garden.jpg`],
    stars: 4, rating: 8.5, reviewsCount: 764, amenities: [...FULL, AMEN.garden], checkInTime: '1:00 PM', checkOutTime: '12:00 PM',
    contact: { phone: '+880 1712-000011', email: 'info@bhawalforest.com.bd' },
    rooms: ['deluxeKing', 'familyStd', 'suiteExec'],
  },
  {
    name: 'Tea Garden Resort', city: 'Sreemangal',
    address: 'Radhanagar, Srimangal, Moulvibazar 3210, Bangladesh',
    description: 'Colonial-style bungalows inside working tea estates with garden walks.',
    images: [`${IMG}/hotels/hotel-srimangal.jpg`, `${IMG}/destinations/dest-srimangal.jpg`, `${IMG}/hero/hero-sylhet-tea-garden.jpg`],
    stars: 4, rating: 9.0, reviewsCount: 1578, amenities: [...FULL, AMEN.garden], checkInTime: '2:00 PM', checkOutTime: '12:00 PM',
    contact: { phone: '+880 1712-000012', email: 'info@teagardenresort.com.bd' },
    rooms: ['deluxeKing', 'familyStd', 'suiteExec'],
  },
  {
    name: 'Mainamati Heritage Hotel', city: 'Cumilla',
    address: 'Mainamati, Cumilla 3500, Bangladesh',
    description: 'Heritage-themed hotel near Mainamati Buddhist ruins and the war cemetery.',
    images: [`${IMG}/destinations/dest-dhaka.jpg`, `${IMG}/hotels/hotel-gulshan.jpg`],
    stars: 3, rating: 8.0, reviewsCount: 356, amenities: [...BASE, AMEN.tv], checkInTime: '2:00 PM', checkOutTime: '12:00 PM',
    contact: { phone: '+880 1712-000013', email: 'info@mainamatiheritage.com.bd' },
    rooms: ['singleStd', 'doubleStd', 'deluxeKing'],
  },
  {
    name: 'Momo Inn', city: 'Bogura',
    address: 'Sherpur Road, Bogura 5800, Bangladesh',
    description: 'Highway stopover hotel on the Dhaka–Rangpur route with 24-hour restaurant.',
    images: [`${IMG}/hotels/hotel-gulshan.jpg`, `${IMG}/destinations/dest-rangamati.jpg`],
    stars: 3, rating: 7.8, reviewsCount: 289, amenities: [...BASE, AMEN.parking, AMEN.tv], checkInTime: '2:00 PM', checkOutTime: '12:00 PM',
    contact: { phone: '+880 1712-000014', email: 'info@momoinnbogura.com.bd' },
    rooms: ['singleStd', 'doubleStd'],
  },
  {
    name: 'Brahmaputra View Hotel', city: 'Mymensingh',
    address: 'Ganginar Par, Mymensingh 2200, Bangladesh',
    description: 'River-view hotel near Bangladesh Agricultural University and Zainul Abedin museum.',
    images: [`${IMG}/hotels/hotel-rajshahi.jpg`, `${IMG}/destinations/dest-rangamati.jpg`],
    stars: 3, rating: 7.9, reviewsCount: 198, amenities: [...BASE, AMEN.balcony], checkInTime: '2:00 PM', checkOutTime: '12:00 PM',
    contact: { phone: '+880 1712-000015', email: 'info@brahmaputraview.com.bd' },
    rooms: ['doubleStd', 'deluxeRiver'],
  },
  {
    name: 'Kirtonkhola River Hotel', city: 'Barishal',
    address: 'Sadar Road, Barishal 8200, Bangladesh',
    description: 'Launch-terminal hotel for southern river routes with rooftop dining.',
    images: [`${IMG}/destinations/dest-sundarbans.jpg`, `${IMG}/hotels/hotel-rajshahi.jpg`],
    stars: 3, rating: 7.7, reviewsCount: 176, amenities: [...BASE, AMEN.tv], checkInTime: '2:00 PM', checkOutTime: '12:00 PM',
    contact: { phone: '+880 1712-000016', email: 'info@kirtonkhola.com.bd' },
    rooms: ['singleStd', 'doubleStd', 'familyStd'],
  },
  {
    name: 'Kantajew Heritage Inn', city: 'Dinajpur',
    address: 'Station Road, Dinajpur 5200, Bangladesh',
    description: 'Terracotta-themed inn near Kantajew Temple with Dinajpuri rice specials.',
    images: [`${IMG}/hotels/hotel-khulna.jpg`, `${IMG}/destinations/dest-dhaka.jpg`],
    stars: 2, rating: 7.5, reviewsCount: 143, amenities: [...BASE], checkInTime: '3:00 PM', checkOutTime: '11:00 AM',
    contact: { phone: '+880 1712-000017', email: 'info@kantajewinn.com.bd' },
    rooms: ['singleStd', 'doubleStd'],
  },
  {
    name: 'Jess Tower Hotel', city: 'Jashore',
    address: 'Mujib Road, Jashore 7400, Bangladesh',
    description: 'City hotel near Jessore Airport with flower-market morning tours.',
    images: [`${IMG}/hotels/hotel-gulshan.jpg`, `${IMG}/destinations/dest-srimangal.jpg`],
    stars: 3, rating: 7.9, reviewsCount: 231, amenities: [...BASE, AMEN.airport], checkInTime: '2:00 PM', checkOutTime: '12:00 PM',
    contact: { phone: '+880 1712-000018', email: 'info@jesstower.com.bd' },
    rooms: ['doubleStd', 'deluxeKing'],
  },
  {
    name: 'Coral Island Resort', city: "Saint Martin's Island",
    address: "Dakshin Para, Saint Martin's Island, Teknaf 4760, Bangladesh",
    description: 'Coral-beach resort with snorkeling boats and fresh seafood barbecues.',
    images: [`${IMG}/destinations/dest-saint-martin.jpg`, `${IMG}/hero/hero-coxsbazar-beach.jpg`, `${IMG}/destinations/dest-kuakata.jpg`],
    stars: 3, rating: 8.4, reviewsCount: 689, amenities: [...BASE, 'Sea view', AMEN.balcony], checkInTime: '3:00 PM', checkOutTime: '11:00 AM',
    contact: { phone: '+880 1712-000019', email: 'info@coralislandresort.com.bd' },
    rooms: ['singleStd', 'doubleSea', 'familySea'],
  },
  {
    name: 'Shitalakshya Riverside Hotel', city: 'Narayanganj',
    address: 'Chashara, Narayanganj 1400, Bangladesh',
    description: 'Riverside business hotel near Panam City with muslin-heritage decor.',
    images: [`${IMG}/destinations/dest-dhaka.jpg`, `${IMG}/hotels/hotel-gulshan.jpg`],
    stars: 3, rating: 8.0, reviewsCount: 264, amenities: [...BASE, AMEN.tv], checkInTime: '2:00 PM', checkOutTime: '12:00 PM',
    contact: { phone: '+880 1712-000020', email: 'info@shitalakshya.com.bd' },
    rooms: ['doubleStd', 'deluxeRiver'],
  },
];

const ROOM_BLURB = {
  Single: 'Smart room for solo travelers.',
  Double: 'Comfortable room for two guests.',
  Deluxe: 'Spacious room with premium fittings.',
  Suite: 'Separate living area with premium service.',
  Family: 'Room for the whole family.',
};

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
  let created = 0;
  let skipped = 0;
  for (const h of HOTELS) {
    const exists = await Hotel.findOne({ name: h.name });
    if (exists) {
      skipped += 1;
      continue;
    }
    const { rooms: roomKeys, ...hotelData } = h;
    const hotel = await Hotel.create({ ...hotelData, demo: true });
    for (const key of roomKeys) {
      const [type, price, capacity, beds, bedType, size, view, totalRooms] = R[key];
      await Room.create({
        name: `${h.name.split(',')[0]} ${type}`,
        type: type === 'Single' || type === 'Double' ? type : type === 'Twin' ? 'Double' : type,
        price,
        description: `${ROOM_BLURB[type] || ROOM_BLURB.Double} At ${h.name}, ${h.city}.`,
        capacity,
        beds,
        bedType,
        size,
        view,
        amenities: ['Free Wi-Fi', 'A/C', 'TV', 'Free breakfast'],
        totalRooms,
        availability: true,
        hotel: hotel._id,
        images: h.images.slice(0, 2),
        image: h.images[0],
      });
    }
    created += 1;
    console.log(`+ ${h.name} (${h.rooms.length} rooms)`);
  }
  console.log(`Done. created=${created} skipped=${skipped}`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error('Seed failed:', e.message);
  process.exit(1);
});
