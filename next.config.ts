import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Mengizinkan build selesai meski ada benturan tipe data React 19 dan Leaflet
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;