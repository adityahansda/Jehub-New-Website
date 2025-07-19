/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable strict mode to reduce Fast Refresh issues
  reactStrictMode: false,
  
  // Optimize build output
  swcMinify: true,
  
  webpack: (config, { isServer, dev }) => {
    // Handle PDF.js worker
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        encoding: false,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        zlib: false,
      };
    }

    // Optimize for development
    if (dev) {
      config.devtool = 'eval-cheap-module-source-map';
    }

    return config;
  },
  
  experimental: {
    // Enable server components
    serverComponentsExternalPackages: ['pdfjs-dist'],
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
    ],
    // Optimization settings
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Reduce bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
