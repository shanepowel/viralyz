export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pages under /dashboard redirect to https://app.viralyz.com
  return <>{children}</>;
}
