const { withGTConfig } = require("gt-next/config");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  async redirects() {
    return [
      { source: '/coaster', destination: '/', permanent: false },
      { source: '/thumbnail', destination: '/', permanent: false },
    ];
  },
};

module.exports = withGTConfig(nextConfig);