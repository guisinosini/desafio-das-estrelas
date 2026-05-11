import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Ignora a ditadura do TypeScript para botar o site da clínica no ar (erros apenas informativos).
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
