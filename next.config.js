/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict mode for better development experience
  reactStrictMode: true,
  
  // Allow cross-origin requests from specific origins in development
  allowedDevOrigins: ['10.67.121.140'],
  
  webpack: (config, { isServer, dev }) => {
    return config;
  },
  
  // External packages for server components
  experimental: {
    serverComponentsExternalPackages: [],
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Optimization settings
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    // Allow SVG images from DiceBear
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Reduce bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Skip ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },

};

module.exports = nextConfig;
