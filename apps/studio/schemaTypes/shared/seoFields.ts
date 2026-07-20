import { defineField } from "sanity";

export const seoFields = [
  defineField({
    name: "seoTitle",
    type: "string",
    group: "seo",
    description: "Overrides the page title in search/social. ~60 chars.",
  }),
  defineField({
    name: "seoDescription",
    type: "text",
    rows: 2,
    group: "seo",
    validation: (r) => r.max(160),
  }),
  defineField({
    name: "ogImage",
    type: "image",
    group: "seo",
    options: { hotspot: true },
    description: "1200×630. Falls back to a generated card if empty.",
  }),
];
