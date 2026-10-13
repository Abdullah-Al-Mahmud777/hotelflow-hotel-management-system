"use client";

// ---------------------------------------------------------------------------
// HotelFlow Footer — link columns + social icons. All English.
// ---------------------------------------------------------------------------

import Link from "next/link";
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  YoutubeIcon,
} from "./SocialIcons";
import { BRAND } from "./data";

const socials = [
  { Icon: FacebookIcon, label: "Facebook", href: "#" },
  { Icon: TwitterIcon, label: "Twitter", href: "#" },
  { Icon: InstagramIcon, label: "Instagram", href: "#" },
  { Icon: YoutubeIcon, label: "YouTube", href: "#" },
];

export default function Footer() {
  return (
    <footer className="mt-14 bg-[#1B1D2A] text-white">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-lg font-black" style={{ color: BRAND }}>
              H
            </span>
            <span className="text-lg font-extrabold tracking-wide">HotelFlow</span>
          </div>
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-white/60">
            Book hotels, resorts and rooms across Bangladesh — from
            Cox&apos;s Bazar beaches to Sylhet tea gardens.
          </p>
          <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-white/50">
            House 25, Road 12, Dhanmondi, Dhaka 1209, Bangladesh
            <br />
            +880 1712-345678 • support@hotelflow.com.bd
          </p>
          <div className="mt-4 flex gap-2">
            {socials.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-white/80">Company</h4>
          <ul className="mt-3 space-y-2 text-[13.5px] text-white/60">
            <li><Link href="/about" className="hover:text-white">About</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link href="/rooms" className="hover:text-white">Rooms</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-white/80">Legal</h4>
          <ul className="mt-3 space-y-2 text-[13.5px] text-white/60">
            <li><a href="#" className="hover:text-white">Terms</a></li>
            <li><a href="#" className="hover:text-white">Privacy</a></li>
            <li><a href="#" className="hover:text-white">Cancellation policy</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-white/80">Discover</h4>
          <ul className="mt-3 space-y-2 text-[13.5px] text-white/60">
            <li><a href="#results" className="hover:text-white">All stays</a></li>
            <li><Link href="/" className="hover:text-white">All hotels</Link></li>
            <li><Link href="/rooms" className="hover:text-white">Rooms</Link></li>
            <li><Link href="/about" className="hover:text-white">About our hotels</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-[1280px] px-4 py-5 text-center text-xs text-white/50 sm:px-6">
          © {new Date().getFullYear()} HotelFlow. All rights reserved. Made in Bangladesh.
        </p>
      </div>
    </footer>
  );
}
