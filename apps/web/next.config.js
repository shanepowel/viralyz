/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/config"],
  serverExternalPackages: [
    "@repo/db",
    "@neondatabase/serverless",
    "drizzle-orm",
  ],
};

export default nextConfig;
