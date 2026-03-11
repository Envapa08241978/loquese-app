import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // Next 13+ App Router requires these defaults usually, `@ducanh2912/next-pwa` handles them well.
});

const nextConfig: NextConfig = {
  // Disable static prerendering for all pages
  experimental: {},
  turbopack: {},
};

export default withPWA(nextConfig);
