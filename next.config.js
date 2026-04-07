/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },

  // ✅ ADD THIS (IMPORTANT)
  transpilePackages: ["firebase"],
  experimental: {
    esmExternals: "loose",
  },
};

module.exports = nextConfig;