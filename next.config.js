/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
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

    return config;
  },
  experimental: {
    // Enable server components
    serverComponentsExternalPackages: ['pdfjs-dist'],
  },
  images: {
    domains: ['raw.githubusercontent.com', 'github.com', 'images.pexels.com', 'example.com'],
  },
};

module.exports = nextConfig;
