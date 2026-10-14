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
  experimental: {
    // Photo uploads from the admin: 5 MB file + form overhead.
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
