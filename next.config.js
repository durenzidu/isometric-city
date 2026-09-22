const { withGTConfig } = require("gt-next/config");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  async redirects() {
    return [
      { source: '/thumbnail', destination: '/', permanent: false },
    ];
  },
};

module.exports = withGTConfig(nextConfig);