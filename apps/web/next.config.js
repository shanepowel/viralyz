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
    // The creator-scoring and creator-marketplace pages were retired when the
    // product became a seller creative studio. Each old URL goes to the
    // closest page that exists now, so inbound links keep working.
    const retired = [
      ["/for-creators", "/"],
      ["/for-creators/:path*", "/"],
      ["/creators", "/"],
      ["/creators/:path*", "/"],
      ["/browse", "/"],
      ["/browse/:path*", "/"],
      ["/kit/:path*", "/"],
      ["/report", "/"],
      ["/affiliates", "/contact"],
      ["/tools", "/platform"],
      ["/tools/:path*", "/platform"],
      ["/for-brands", "/platform"],
      ["/brands", "/platform"],
      ["/platform/viral-score", "/platform/pre-flight"],
      ["/platform/thumbnail-studio", "/platform/pre-flight"],
      ["/platform/hook-lab", "/platform/studio"],
      ["/platform/script-doctor", "/platform/studio"],
      ["/platform/performance-tracking", "/platform/results"],
      ["/blog/kitchen-video-12-million-views", "/blog"],
      ["/blog/creator-pricing-2026", "/blog"],
      ["/blog/three-fixes-that-move-scores", "/blog"],
      ["/blog/packages-on-media-kits", "/blog"],
    ].map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));

    return [
      ...retired,
      { source: "/academy", destination: "/blog", permanent: false },
      { source: "/community", destination: "/", permanent: false },
      { source: "/help", destination: "/contact", permanent: false },
      { source: "/dashboard", destination: app, permanent: false },
      { source: "/dashboard/:path*", destination: app, permanent: false },
    ];
  },
};

export default nextConfig;
