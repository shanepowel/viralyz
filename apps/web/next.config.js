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
      {
        source: "/browse",
        destination: "/creators",
        permanent: true,
      },
      {
        source: "/browse/:path*",
        destination: "/creators",
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
        destination: "/for-creators",
        permanent: false,
      },
      {
        source: "/help",
        destination: "/contact",
        permanent: false,
      },
      {
        source: "/dashboard",
        destination: `${app}/`,
        permanent: false,
      },
      {
        source: "/dashboard/settings",
        destination: `${app}/settings`,
        permanent: false,
      },
      {
        source: "/dashboard/tools/score-engine",
        destination: `${app}/analyze`,
        permanent: false,
      },
      {
        source: "/dashboard/tools/hook-lab",
        destination: `${app}/hook-lab`,
        permanent: false,
      },
      {
        source: "/dashboard/tools/script-doctor",
        destination: `${app}/caption-studio`,
        permanent: false,
      },
      {
        source: "/dashboard/tools/caption-studio",
        destination: `${app}/caption-studio`,
        permanent: false,
      },
      {
        source: "/dashboard/tools/thumbnail-studio",
        destination: `${app}/thumbnails`,
        permanent: false,
      },
      {
        source: "/dashboard/tools/idea-generator",
        destination: `${app}/ideas`,
        permanent: false,
      },
      {
        source: "/dashboard/tools/trend-radar",
        destination: `${app}/trends`,
        permanent: false,
      },
      {
        source: "/dashboard/tools/competitor-intel",
        destination: `${app}/competitors`,
        permanent: false,
      },
      {
        source: "/dashboard/tools/auto-dm",
        destination: `${app}/messages`,
        permanent: false,
      },
      {
        source: "/dashboard/tools/biopage",
        destination: `${app}/settings`,
        permanent: false,
      },
      {
        source: "/dashboard/tools/:slug",
        destination: `${app}/`,
        permanent: false,
      },
      {
        source: "/dashboard/:path*",
        destination: `${app}/:path*`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
