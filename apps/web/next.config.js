/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/config"],
  serverExternalPackages: [
    "@repo/db",
    "@neondatabase/serverless",
    "drizzle-orm",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "image.mux.com" },
    ],
  },
  async redirects() {
    const app = "https://app.viralyz.com";
    return [
      // The creator marketplace (browse/hire creators, public creator profiles)
      // no longer exists — the product is a single-sided seller tool now.
      {
        source: "/browse",
        destination: "/",
        permanent: true,
      },
      {
        source: "/browse/:path*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/creators",
        destination: "/",
        permanent: true,
      },
      {
        source: "/for-creators",
        destination: "/for-brands",
        permanent: true,
      },
      {
        source: "/kit/:path*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/report",
        destination: "/platform",
        permanent: true,
      },
      {
        source: "/brands",
        destination: "/for-brands",
        permanent: true,
      },
      {
        source: "/academy",
        destination: "/blog",
        permanent: false,
      },
      {
        source: "/community",
        destination: "/for-brands",
        permanent: false,
      },
      {
        source: "/help",
        destination: "/contact",
        permanent: false,
      },
      // Everything under the old /dashboard (and its per-tool deep links) maps
      // to a product that was rebuilt from scratch — none of those app routes
      // exist anymore. Every old deep link goes to the new app's entry point
      // rather than a guessed one-to-one mapping that would just be wrong.
      {
        source: "/dashboard/:path*",
        destination: `${app}/discover`,
        permanent: false,
      },
      {
        source: "/dashboard",
        destination: `${app}/discover`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
