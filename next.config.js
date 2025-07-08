/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    dirs: ['pages', 'components', 'lib', 'src'],
  },
}

module.exports = nextConfig


const nextConfig = {
  experimental: {
    legacyBrowsers: false, // ⛔ don't support legacy browsers like IE11
  },
  // optionally, if using Babel:
  swcMinify: true, // ensure modern minification
};

module.exports = nextConfig;