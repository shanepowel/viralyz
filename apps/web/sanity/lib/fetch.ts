import { stegaClean } from "@sanity/client/stega";
import { client } from "./client";
import { sanityFetch } from "./live";

type FetchArgs = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any;
  params?: Record<string, unknown>;
  stega?: boolean;
  /** When true, use published CDN client (for generateStaticParams / metadata). */
  published?: boolean;
};

/** Live fetch with a null fallback when Sanity is unreachable. */
export async function fetchSanity<T>({
  query,
  params,
  stega,
  published,
}: FetchArgs): Promise<T | null> {
  try {
    if (published || stega === false) {
      const data = await client.fetch<T>(query, params ?? {}, {
        stega: false,
        perspective: "published",
      });
      return data ?? null;
    }
    const { data } = await sanityFetch({
      query,
      params,
      stega,
    });
    return (data as T) ?? null;
  } catch (err) {
    console.error("[sanity]", err);
    return null;
  }
}

export function cleanSlug(value: string | null | undefined) {
  return value ? stegaClean(value) : "";
}
