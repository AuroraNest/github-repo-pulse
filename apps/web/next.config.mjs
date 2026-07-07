/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@repopulse/core", "@repopulse/db"]
};

export default nextConfig;
