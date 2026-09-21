import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "*.loca.lt",
    "localhost:3000",
    "10.13.108.13:3000",
  ],
};

export default nextConfig;
