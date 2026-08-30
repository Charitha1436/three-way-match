import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/:path*',
      },
      {
        source: '/documents/:path*',
        destination: 'http://localhost:5000/documents/:path*',
      },
      {
        source: '/match/:path*',
        destination: 'http://localhost:5000/match/:path*',
      },
      {
        source: '/summary/:path*',
        destination: 'http://localhost:5000/summary/:path*',
      },
      {
        source: '/masters/:path*',
        destination: 'http://localhost:5000/masters/:path*',
      },
    ];
  },
};

export default nextConfig;