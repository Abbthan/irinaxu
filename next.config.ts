import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This portfolio has no server-only routes or runtime data. Emit a complete
  // static site so Cloudflare can serve it directly from edge assets.
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
