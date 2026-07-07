/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  output: "standalone",
  transpilePackages: ["@repopulse/core", "@repopulse/db"]
};

export default nextConfig;
