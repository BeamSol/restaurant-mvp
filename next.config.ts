import type { NextConfig } from "next";

// Allow next/image to show photos uploaded to Supabase Storage.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL) : null;

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp"],
    qualities: [60, 70, 75],
    // Phones first: these widths match our layouts (cards ≈ 360–560px, hero ≈ full width).
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1600],
    imageSizes: [64, 96, 128, 256],
    remotePatterns: supabaseUrl
      ? [{ protocol: supabaseUrl.protocol.replace(":", "") as "http" | "https", hostname: supabaseUrl.hostname, port: supabaseUrl.port, pathname: "/storage/v1/object/public/**" }]
      : [],
    // Local Supabase runs on 127.0.0.1, which Next blocks by default. Only allow it in development.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production" || supabaseUrl?.hostname === "127.0.0.1",
  },
  trailingSlash: true,
  // Security headers + service-worker headers (PWA)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      { source: "/icons/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=604800" }] },
    ];
  },
  experimental: {
    // Photo uploads from the admin: 5 MB file + form overhead.
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
