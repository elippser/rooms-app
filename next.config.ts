import type { NextConfig } from "next";

const HABITACIONES_BASE = "/habitaciones";

const nextConfig: NextConfig = {
  basePath: HABITACIONES_BASE,
  assetPrefix: `${HABITACIONES_BASE}-static`,
  async redirects() {
    return [
      {
        source: "/",
        destination: HABITACIONES_BASE,
        permanent: false,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
