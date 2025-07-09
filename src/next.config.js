const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    dirs: ['pages', 'components', 'lib', 'src'],
  },
  experimental: {
    legacyBrowsers: false, // ✅ Disable support for older browsers like IE11
    esmExternals: 'loose', // ✅ Use modern ES modules for externals
  },
};

module.exports = withBundleAnalyzer(nextConfig);
