/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    dirs: ['pages', 'components', 'lib', 'src'],
  },
  experimental: {
    legacyBrowsers: false, // ✅ Avoid transpiling for legacy browsers like IE11
  }
};

module.exports = nextConfig;
