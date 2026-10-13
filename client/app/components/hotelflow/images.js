// ---------------------------------------------------------------------------
// HotelFlow image registry — EVERY image path in ONE place.
// All photos are real, CC-licensed pictures of places in Bangladesh,
// downloaded from Wikimedia Commons into client/public/images/bd/:
//   hero/         1920px wide  (homepage hero slider)
//   destinations/  800px wide  (destination cards)
//   hotels/        800px wide  (hotel exteriors / place context)
// Room cards reuse these by theme (beach rooms -> beach photos, …) because
// no verifiable Bangladeshi hotel-room interiors exist on Commons.
// Change any photo here and the whole site follows.
// ---------------------------------------------------------------------------

const BD = "/images/bd";

export const HERO_IMAGES = [
  {
    src: `${BD}/hero/hero-coxsbazar-beach.jpg`,
    alt: "Long sandy sea beach with waves at Cox's Bazar, Bangladesh at sunset",
  },
  {
    src: `${BD}/hero/hero-sylhet-tea-garden.jpg`,
    alt: "Green tea garden rows in Sylhet division, Bangladesh",
  },
  {
    src: `${BD}/hero/hero-sajek-clouds.jpg`,
    alt: "Sea of clouds over the hills of Sajek Valley at sunrise, Bangladesh",
  },
];

// Keyed by destination name for easy lookup in data files.
export const DESTINATION_IMAGES = {
  "Cox's Bazar": {
    src: `${BD}/destinations/dest-coxsbazar.jpg`,
    alt: "Long sandy sea beach with umbrellas and waves at Cox's Bazar, Bangladesh",
  },
  Sylhet: {
    src: `${BD}/destinations/dest-sylhet-tea-garden.jpg`,
    alt: "Ratargul freshwater swamp forest in Sylhet, Bangladesh",
  },
  "Sajek Valley": {
    src: `${BD}/destinations/dest-sajek-valley.jpg`,
    alt: "Hilltop with clouds over Sajek Valley, Rangamati, Bangladesh",
  },
  "Saint Martin's Island": {
    src: `${BD}/destinations/dest-saint-martin.jpg`,
    alt: "Clear blue sea and coral beach on Saint Martin's Island, Bangladesh",
  },
  Bandarban: {
    src: `${BD}/destinations/dest-bandarban.jpg`,
    alt: "Mountain view from Nilgiri hills in Bandarban, Bangladesh",
  },
  Kuakata: {
    src: `${BD}/destinations/dest-kuakata.jpg`,
    alt: "Sunset over the sea seen from Kuakata beach, Bangladesh",
  },
  Sundarbans: {
    src: `${BD}/destinations/dest-sundarbans.jpg`,
    alt: "Mangrove forest and river inside the Sundarbans, Bangladesh",
  },
  Srimangal: {
    src: `${BD}/destinations/dest-srimangal.jpg`,
    alt: "Green tea gardens of Srimangal, Moulvibazar, Bangladesh",
  },
  Dhaka: {
    src: `${BD}/destinations/dest-dhaka.jpg`,
    alt: "Historic Ahsan Manzil palace on the Buriganga river in Dhaka, Bangladesh",
  },
  Rangamati: {
    src: `${BD}/destinations/dest-rangamati.jpg`,
    alt: "Kaptai Lake surrounded by green hills in Rangamati, Bangladesh",
  },
};

// Keyed by hotel id (matches HOTELS in data.js).
export const HOTEL_IMAGES = {
  h1: {
    src: `${BD}/hotels/hotel-sea-pearl.jpg`,
    alt: "Sandy beach at Kolatoli near Sea Pearl Beach Resort, Cox's Bazar, Bangladesh",
  },
  h2: {
    src: `${BD}/hotels/hotel-gulshan.jpg`,
    alt: "Historic Lalbagh Fort in Dhaka, near Gulshan Grand Hotel, Bangladesh",
  },
  h3: {
    src: `${BD}/hotels/hotel-sajek.jpg`,
    alt: "Cloudy hills of Sajek Valley around Hill View Resort, Bangladesh",
  },
  h4: {
    src: `${BD}/hotels/hotel-sylhet.jpg`,
    alt: "Jaflong river and hills near Green Valley Hotel, Sylhet, Bangladesh",
  },
  h5: {
    src: `${BD}/hotels/hotel-rajshahi.jpg`,
    alt: "Padma river bank near Padma Riverside Hotel, Rajshahi, Bangladesh",
  },
  h6: {
    src: `${BD}/hotels/hotel-chattogram.jpg`,
    alt: "Patenga sea beach near Bay Breeze Hotel, Chattogram, Bangladesh",
  },
  h7: {
    src: `${BD}/hotels/hotel-khulna.jpg`,
    alt: "Sixty Dome Mosque in Bagerhat, near Sundarban Eco Lodge, Khulna, Bangladesh",
  },
  h8: {
    src: `${BD}/hotels/hotel-srimangal.jpg`,
    alt: "Tea estate around Tea Garden Resort, Srimangal, Bangladesh",
  },
  h9: {
    src: `${BD}/hotels/hotel-kuakata.jpg`,
    alt: "Sandy beach at Kuakata near Sunset Inn, Patuakhali, Bangladesh",
  },
  bandarban: {
    src: `${BD}/hotels/hotel-bandarban.jpg`,
    alt: "Nilgiri Hill Resort in the hills of Bandarban, Bangladesh",
  },
};

// Keyed by room id (matches DUMMY_ROOMS in roomsData.js). Each room gets a
// themed triplet: primary place photo + two supporting Bangladesh scenes.
export const ROOM_IMAGES = {
  r1: [
    { src: `${BD}/hotels/hotel-sea-pearl.jpg`, alt: "Beach at Kolatoli, Cox's Bazar near the Deluxe Sea View room, Bangladesh" },
    { src: `${BD}/destinations/dest-coxsbazar.jpg`, alt: "Long sandy sea beach at Cox's Bazar, Bangladesh" },
    { src: `${BD}/hero/hero-coxsbazar-beach.jpg`, alt: "Sunset waves at Cox's Bazar sea beach, Bangladesh" },
  ],
  r2: [
    { src: `${BD}/hotels/hotel-gulshan.jpg`, alt: "Lalbagh Fort area of Dhaka near the Executive Double room, Bangladesh" },
    { src: `${BD}/destinations/dest-dhaka.jpg`, alt: "Ahsan Manzil palace in Dhaka, Bangladesh" },
    { src: `${BD}/destinations/dest-rangamati.jpg`, alt: "Kaptai Lake and green hills in Rangamati, Bangladesh" },
  ],
  r3: [
    { src: `${BD}/hotels/hotel-sajek.jpg`, alt: "Sajek Valley hills around the Hill View Cottage, Bangladesh" },
    { src: `${BD}/hero/hero-sajek-clouds.jpg`, alt: "Sunrise clouds over Sajek Valley, Bangladesh" },
    { src: `${BD}/destinations/dest-sajek-valley.jpg`, alt: "Hilltop view of Sajek Valley, Rangamati, Bangladesh" },
  ],
  r4: [
    { src: `${BD}/hotels/hotel-srimangal.jpg`, alt: "Tea estate around the Family Retreat room, Srimangal, Bangladesh" },
    { src: `${BD}/hero/hero-sylhet-tea-garden.jpg`, alt: "Green tea garden rows in Sylhet division, Bangladesh" },
    { src: `${BD}/destinations/dest-srimangal.jpg`, alt: "Tea gardens of Srimangal, Bangladesh" },
  ],
  r5: [
    { src: `${BD}/hotels/hotel-rajshahi.jpg`, alt: "Padma river near the Riverside Suite, Rajshahi, Bangladesh" },
    { src: `${BD}/destinations/dest-rangamati.jpg`, alt: "River and hills at Kaptai Lake, Rangamati, Bangladesh" },
    { src: `${BD}/hero/hero-coxsbazar-beach.jpg`, alt: "Sunset over the water in Bangladesh" },
  ],
  r6: [
    { src: `${BD}/hotels/hotel-chattogram.jpg`, alt: "Patenga sea beach near the Standard room, Chattogram, Bangladesh" },
    { src: `${BD}/destinations/dest-kuakata.jpg`, alt: "Sunset over the sea at Kuakata beach, Bangladesh" },
    { src: `${BD}/hero/hero-coxsbazar-beach.jpg`, alt: "Waves at Cox's Bazar sea beach, Bangladesh" },
  ],
  r7: [
    { src: `${BD}/destinations/dest-sundarbans.jpg`, alt: "Mangrove river near the Eco Twin room, Sundarbans, Bangladesh" },
    { src: `${BD}/hotels/hotel-khulna.jpg`, alt: "Sixty Dome Mosque, Bagerhat, near the eco lodge, Bangladesh" },
    { src: `${BD}/destinations/dest-rangamati.jpg`, alt: "Green hills and lake in Rangamati, Bangladesh" },
  ],
  r8: [
    { src: `${BD}/destinations/dest-dhaka.jpg`, alt: "Ahsan Manzil in Dhaka near the Lake View Deluxe room, Bangladesh" },
    { src: `${BD}/hotels/hotel-gulshan.jpg`, alt: "Historic Lalbagh Fort in Dhaka, Bangladesh" },
    { src: `${BD}/destinations/dest-rangamati.jpg`, alt: "Lake surrounded by hills at Kaptai, Rangamati, Bangladesh" },
  ],
  r9: [
    { src: `${BD}/hotels/hotel-kuakata.jpg`, alt: "Kuakata beach near the Sunset Family room, Bangladesh" },
    { src: `${BD}/destinations/dest-kuakata.jpg`, alt: "Sunset over the sea at Kuakata, Bangladesh" },
    { src: `${BD}/hero/hero-coxsbazar-beach.jpg`, alt: "Sunset waves on a Bangladesh sea beach" },
  ],
  r10: [
    { src: `${BD}/destinations/dest-saint-martin.jpg`, alt: "Clear blue sea at Saint Martin's Island near the Coral Single room, Bangladesh" },
    { src: `${BD}/hero/hero-coxsbazar-beach.jpg`, alt: "Sunset over the Bay of Bengal, Bangladesh" },
    { src: `${BD}/destinations/dest-kuakata.jpg`, alt: "Sea beach sunset in Bangladesh" },
  ],
  r11: [
    { src: `${BD}/hotels/hotel-bandarban.jpg`, alt: "Nilgiri Hill Resort around the Hillside Suite, Bandarban, Bangladesh" },
    { src: `${BD}/destinations/dest-bandarban.jpg`, alt: "Mountain view from Nilgiri, Bandarban, Bangladesh" },
    { src: `${BD}/hero/hero-sajek-clouds.jpg`, alt: "Clouds over Bangladesh hill tracts at sunrise" },
  ],
  r12: [
    { src: `${BD}/destinations/dest-rangamati.jpg`, alt: "Green countryside lake near the Budget Double room, Bangladesh" },
    { src: `${BD}/destinations/dest-srimangal.jpg`, alt: "Green fields of Srimangal, Bangladesh" },
    { src: `${BD}/destinations/dest-dhaka.jpg`, alt: "Historic riverside palace in Dhaka, Bangladesh" },
  ],
};

// Social/OG image.
export const OG_IMAGE = {
  src: `${BD}/hero/hero-coxsbazar-beach.jpg`,
  alt: "Sunset over Cox's Bazar sea beach, Bangladesh — HotelFlow",
};
