/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/config", "@repo/database"],
};

export default nextConfig;
