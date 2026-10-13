import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "HotelFlow - Find Your Perfect Stay in Bangladesh",
  description: "Book hotels, resorts and rooms across Bangladesh, from Cox's Bazar beaches to Sylhet tea gardens.",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: "HotelFlow - Find Your Perfect Stay in Bangladesh",
    description: "Book hotels, resorts and rooms across Bangladesh.",
    images: [
      {
        url: '/images/bd/hero/hero-coxsbazar-beach.jpg',
        width: 1920,
        height: 1280,
        alt: "Sunset over Cox's Bazar sea beach, Bangladesh — HotelFlow",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "HotelFlow - Find Your Perfect Stay in Bangladesh",
    description: "Book hotels, resorts and rooms across Bangladesh.",
    images: ['/images/bd/hero/hero-coxsbazar-beach.jpg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
