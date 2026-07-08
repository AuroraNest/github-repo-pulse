/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  devIndicators: false,
  output: "standalone",
  transpilePackages: ["@repopulse/core", "@repopulse/db"]
};

export default nextConfig;
