import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suppress non-critical TS and ESLint errors during production builds
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  // Allow images from the backend and external sources
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "80",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },

  // Proxy /api calls to backend — only when NEXT_PUBLIC_API_URL is a valid absolute URL
  // On Vercel with multi-service, requests to /api/* go directly to the backend service, no rewrite needed.
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl || (!apiUrl.startsWith("http://") && !apiUrl.startsWith("https://"))) {
      // No valid URL configured — skip rewrite (Vercel multi-service handles routing)
      return [];
    }
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
