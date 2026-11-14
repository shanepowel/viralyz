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
        destination: "/for-sellers",
        permanent: true,
      },
      { source: "/for-brands", destination: "/for-sellers", permanent: true },
      // Retired creator-era posts and tools.
      ...[
        "kitchen-video-12-million-views",
        "creator-pricing-2026",
        "three-fixes-that-move-scores",
        "packages-on-media-kits",
      ].map((slug) => ({ source: `/blog/${slug}`, destination: "/blog", permanent: true })),
      { source: "/tools/engagement-calculator", destination: "/tools/safe-zone-checker", permanent: true },
      { source: "/tools/thumbnail-checker", destination: "/tools/ad-readability-checker", permanent: true },
      {
        source: "/report",
        destination: "/platform",
        permanent: true,
      },
      {
        source: "/brands",
        destination: "/for-sellers",
        permanent: true,
      },
      {
        source: "/academy",
        destination: "/blog",
        permanent: false,
      },
      {
        source: "/community",
        destination: "/for-sellers",
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
        destination: `${app}/studio`,
        permanent: false,
      },
      {
        source: "/dashboard",
        destination: `${app}/studio`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
