/** Creator media kits were retired with the marketplace. Gone, not moved. */
export function GET() {
  return new Response("This page has been removed.", {
    status: 410,
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex" },
  });
}
