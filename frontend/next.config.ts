import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/univ_map",
        destination: "http://localhost:8000/api/university-map/univ_map",
      },
      {
        source: "/univ_major",
        destination: "http://localhost:8000/api/university-map/univ_major",
      },
    ];
  },
};

export default nextConfig;
