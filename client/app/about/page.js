"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default function AboutPage() {
  const features = [
    {
      icon: "🏨",
      title: "Luxury Accommodation",
      description: "Experience world-class comfort in our premium rooms and suites"
    },
    {
      icon: "🍽️",
      title: "Fine Dining",
      description: "Savor exquisite cuisine at our award-winning restaurants"
    },
    {
      icon: "💆",
      title: "Spa & Wellness",
      description: "Rejuvenate your body and mind at our luxury spa"
    },
    {
      icon: "🏊",
      title: "Pool & Fitness",
      description: "Stay active with our state-of-the-art facilities"
    },
    {
      icon: "🎯",
      title: "Event Spaces",
      description: "Host memorable events in our elegant venues"
    },
    {
      icon: "🚗",
      title: "Concierge Service",
      description: "24/7 assistance for all your needs"
    }
  ];

  const stats = [
    { number: "500+", label: "Happy Guests" },
    { number: "50+", label: "Luxury Rooms" },
    { number: "15+", label: "Years Experience" },
    { number: "24/7", label: "Customer Support" }
  ];

  const team = [
    { name: "Rahim Uddin", role: "General Manager" },
    { name: "Nusrat Jahan", role: "Head Chef" },
    { name: "Tanvir Ahmed", role: "Guest Relations" },
    { name: "Farhana Akter", role: "Reservations Lead" }
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-16 sm:pt-20">
        {/* Hero Section */}
        <section className="relative h-[40vh] xs:h-[50vh] sm:h-[60vh] bg-gray-900">
          <Image
            src="/images/bd/hero/hero-sajek-clouds.jpg"
            alt="Sea of clouds over Sajek Valley hills, Bangladesh"
            fill
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-3xl xs:text-4xl sm:text-6xl font-bold mb-2 sm:mb-4">About HotelFlow</h1>
              <p className="text-lg xs:text-xl sm:text-2xl text-gray-200">Where Luxury Meets Comfort</p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-10 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-2 sm:px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div>
                <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Our Story</h2>
                <p className="text-gray-700 text-base xs:text-lg mb-3 sm:mb-4 leading-relaxed">
                  Founded in 2026, HotelFlow has been redefining hospitality with a perfect blend of modern luxury and timeless elegance. Our commitment to excellence has made us a preferred destination for travelers seeking unforgettable experiences.
                </p>
                <p className="text-gray-700 text-base xs:text-lg mb-3 sm:mb-4 leading-relaxed">
                  We believe that every guest deserves personalized attention and world-class service. From our meticulously designed rooms to our exceptional dining experiences, every detail is crafted to exceed your expectations.
                </p>
                <p className="text-gray-700 text-base xs:text-lg leading-relaxed">
                  Our team of dedicated professionals works tirelessly to ensure your stay is nothing short of perfect. Whether you&apos;re here for business or leisure, we&apos;re committed to making your experience memorable.
                </p>
              </div>
              <div className="relative h-56 xs:h-72 sm:h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/bd/hotels/hotel-srimangal.jpg"
                  alt="Tea estate around Tea Garden Resort, Srimangal, Bangladesh"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-8 sm:py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="max-w-7xl mx-auto px-2 sm:px-4">
            <div className="grid grid-cols-2 xs:grid-cols-4 gap-4 sm:gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center text-white">
                  <div className="text-2xl xs:text-4xl sm:text-5xl font-bold mb-1 sm:mb-2">{stat.number}</div>
                  <div className="text-blue-100 text-xs xs:text-base sm:text-lg">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-10 sm:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-2 sm:px-4">
            <div className="text-center mb-8 sm:mb-16">
              <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Our Amenities</h2>
              <p className="text-base xs:text-lg sm:text-xl text-gray-600">Everything you need for a perfect stay</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-200">
                  <div className="text-3xl xs:text-4xl sm:text-5xl mb-2 sm:mb-4">{feature.icon}</div>
                  <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-sm xs:text-base leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-10 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-2 sm:px-4">
            <div className="text-center mb-8 sm:mb-16">
              <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Meet Our Team</h2>
              <p className="text-base xs:text-lg sm:text-xl text-gray-600">Dedicated professionals at your service</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {team.map((member, index) => (
                <div key={index} className="text-center group">
                  <div className="relative h-40 xs:h-56 sm:h-64 mb-2 sm:mb-4 rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 grid place-items-center">
                    <span aria-label={member.name} className="grid h-20 w-20 place-items-center rounded-full bg-white/20 text-3xl font-black text-white">
                      {member.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </span>
                  </div>
                  <h3 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900 mb-0.5 sm:mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium text-xs xs:text-sm sm:text-base">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-10 sm:py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="max-w-4xl mx-auto px-2 sm:px-4 text-center">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold mb-3 sm:mb-6">Our Mission</h2>
            <p className="text-base xs:text-lg sm:text-xl text-gray-300 leading-relaxed mb-4 sm:mb-8">
              To provide exceptional hospitality experiences that create lasting memories for our guests. We strive to exceed expectations through personalized service, attention to detail, and a commitment to excellence in everything we do.
            </p>
            <div className="flex flex-col xs:flex-row justify-center items-center xs:space-x-4 space-y-2 xs:space-y-0">
              <Link href="/rooms" className="bg-blue-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                Explore Rooms
              </Link>
              <Link href="/contact" className="bg-white text-gray-900 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-gray-100 transition font-semibold">
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
