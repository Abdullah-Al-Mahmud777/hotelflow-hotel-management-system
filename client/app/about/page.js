"use client";

import Image from "next/image";
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
    { name: "John Smith", role: "General Manager", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400" },
    { name: "Sarah Johnson", role: "Head Chef", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400" },
    { name: "Michael Chen", role: "Guest Relations", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400" },
    { name: "Emily Davis", role: "Spa Director", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400" }
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-20">
        {/* Hero Section */}
        <section className="relative h-[60vh] bg-gray-900">
          <Image
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1600"
            alt="Hotel Lobby"
            fill
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-6xl font-bold mb-4">About HotelFlow</h1>
              <p className="text-2xl text-gray-200">Where Luxury Meets Comfort</p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
                <p className="text-gray-700 text-lg mb-4 leading-relaxed">
                  Founded in 2010, HotelFlow has been redefining hospitality with a perfect blend of modern luxury and timeless elegance. Our commitment to excellence has made us a preferred destination for travelers seeking unforgettable experiences.
                </p>
                <p className="text-gray-700 text-lg mb-4 leading-relaxed">
                  We believe that every guest deserves personalized attention and world-class service. From our meticulously designed rooms to our exceptional dining experiences, every detail is crafted to exceed your expectations.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Our team of dedicated professionals works tirelessly to ensure your stay is nothing short of perfect. Whether you're here for business or leisure, we're committed to making your experience memorable.
                </p>
              </div>
              <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800"
                  alt="Hotel Interior"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center text-white">
                  <div className="text-5xl font-bold mb-2">{stat.number}</div>
                  <div className="text-blue-100 text-lg">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Amenities</h2>
              <p className="text-xl text-gray-600">Everything you need for a perfect stay</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-200">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
              <p className="text-xl text-gray-600">Dedicated professionals at your service</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <div key={index} className="text-center group">
                  <div className="relative h-64 mb-4 rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              To provide exceptional hospitality experiences that create lasting memories for our guests. We strive to exceed expectations through personalized service, attention to detail, and a commitment to excellence in everything we do.
            </p>
            <div className="flex justify-center space-x-4">
              <a href="/rooms" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                Explore Rooms
              </a>
              <a href="/contact" className="bg-white text-gray-900 px-8 py-3 rounded-lg hover:bg-gray-100 transition font-semibold">
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
