import { defineQuery } from "next-sanity";

export const IMG = /* groq */ `{
  asset->{
    _id,
    url,
    metadata { lqip, dimensions { width, height } }
  },
  alt,
  caption,
  hotspot,
  crop
}`;

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings"][0]{
    siteName, missionLine, companyNumber, companyLocation, parentCompany,
    helloEmail, partnershipsEmail, twitterUrl, linkedinUrl, youtubeUrl,
    defaultOgImage ${IMG}
  }
`);

export const POSTS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)
    && (!defined($category) || category->slug.current == $category)
  ] | order(publishedAt desc) [$start...$end] {
    _id, title, "slug": slug.current, excerpt, publishedAt, score, featured,
    "category": category->{ title, "slug": slug.current, accentTone },
    "author": author->{ name, avatar ${IMG} },
    coverImage ${IMG},
    "readingTime": round(length(pt::text(body)) / 5 / 200)
  }
`);

export const POSTS_COUNT_QUERY = defineQuery(`
  count(*[_type == "post" && defined(slug.current)
    && (!defined($category) || category->slug.current == $category)])
`);

export const POST_SLUGS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)]{ "slug": slug.current }
`);

export const POST_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug][0]{
    _id, title, "slug": slug.current, excerpt, publishedAt, score, featured,
    seoTitle, seoDescription,
    "category": category->{ title, "slug": slug.current, accentTone },
    "author": author->{ name, role, bio, avatar ${IMG} },
    coverImage ${IMG},
    ogImage ${IMG},
    body[]{
      ...,
      _type == "image" => ${IMG},
      _type == "mux.video" => {
        ...,
        "playbackId": asset->playbackId
      },
      _type == "scoreBreakdown" => { ..., items[]{ factor, score } },
      _type == "calloutBox" => { ..., body }
    },
    "readingTime": round(length(pt::text(body)) / 5 / 200)
  }
`);

export const CATEGORIES_QUERY = defineQuery(`
  *[_type == "category"] | order(title asc) {
    title, "slug": slug.current, description, accentTone
  }
`);

export const FEATURES_QUERY = defineQuery(`
  *[_type == "feature" && live == true] | order(order asc) {
    _id, name, "slug": slug.current, group, tagline, summary, icon, bullets,
    appHref, order, live,
    screenshot ${IMG},
    "demoPlaybackId": demoVideo.asset->playbackId,
    seoTitle, seoDescription
  }
`);

export const FEATURE_QUERY = defineQuery(`
  *[_type == "feature" && slug.current == $slug][0]{
    _id, name, "slug": slug.current, group, tagline, summary, icon, bullets,
    appHref, order, live,
    screenshot ${IMG},
    "demoPlaybackId": demoVideo.asset->playbackId,
    seoTitle, seoDescription, ogImage ${IMG}
  }
`);

export const FEATURE_SLUGS_QUERY = defineQuery(`
  *[_type == "feature" && live == true && defined(slug.current)]{ "slug": slug.current }
`);

export const PAGE_QUERY = defineQuery(`
  *[_type == "page" && slug.current == $slug][0]{
    _id, title, "slug": slug.current, seoTitle, seoDescription,
    ogImage ${IMG},
    pageBuilder[]{
      ...,
      _type == "hero" => {
        ...,
        image ${IMG},
        "videoPlaybackId": video.asset->playbackId
      },
      _type == "splitMedia" => {
        ...,
        image ${IMG},
        "videoPlaybackId": video.asset->playbackId,
        body
      },
      _type == "videoShowcase" => {
        ...,
        poster ${IMG},
        "videoPlaybackId": video.asset->playbackId
      },
      _type == "gallery" => {
        ...,
        images[] ${IMG}
      },
      _type == "faqSection" => {
        ...,
        faqs[]->{ question, answer, audience }
      },
      _type == "ctaSection" => {
        band->{ heading, body, primaryLabel, primaryHref, secondaryLabel, secondaryHref }
      },
      _type == "richText" => { body },
      _type == "featureGrid" => { heading, items[] },
      _type == "statsBand" => { items[] }
    }
  }
`);

export const LEGAL_PAGE_QUERY = defineQuery(`
  *[_type == "legalPage" && slug.current == $slug][0]{
    title, "slug": slug.current, lastUpdated, body
  }
`);

export const LEGAL_SLUGS_QUERY = defineQuery(`
  *[_type == "legalPage" && defined(slug.current)]{ "slug": slug.current }
`);
