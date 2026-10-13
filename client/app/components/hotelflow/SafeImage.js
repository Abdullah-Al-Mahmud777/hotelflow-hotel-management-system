"use client";

// ---------------------------------------------------------------------------
// HotelFlow SafeImage — next/image wrapper with a graceful fallback.
// - Gray skeleton background while loading (no layout shift surprises).
// - If the file fails to load, renders a gray box with a MapPin icon and
//   keeps the same layout footprint (works in fill and fixed modes).
// - Always pass meaningful `alt` text describing the Bangladeshi place.
// ---------------------------------------------------------------------------

import { useState } from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";

export default function SafeImage({
  src,
  alt,
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  className = "",
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-[#E4E7F0] ${
          fill ? "absolute inset-0" : ""
        } ${className}`}
      >
        <MapPin className="h-8 w-8 shrink-0 text-[#9AA0B4]" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      {...(fill ? { fill: true } : { width, height })}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      onError={() => setFailed(true)}
      className={`bg-[#E4E7F0] ${className}`}
    />
  );
}
