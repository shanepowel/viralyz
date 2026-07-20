import { defineArrayMember, defineField, defineType } from "sanity";
import { imageWithAlt } from "../shared/mediaFields";
import { seoFields } from "../shared/seoFields";
import { pageBuilderBlocks } from "../blocks";

const pageBuilderField = defineField({
  name: "pageBuilder",
  title: "Page builder",
  type: "array",
  of: pageBuilderBlocks.map((b) => defineArrayMember({ type: b.name })),
  options: {
    insertMenu: {
      views: [
        {
          name: "grid",
          previewImageUrl: (type) => `/block-previews/${type}.png`,
        },
      ],
    },
  },
});

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({ name: "siteName", type: "string", initialValue: "Viralyz" }),
    defineField({
      name: "missionLine",
      type: "string",
      description: "Footer one-liner",
    }),
    defineField({ name: "companyNumber", type: "string" }),
    defineField({ name: "companyLocation", type: "string" }),
    defineField({ name: "parentCompany", type: "string" }),
    defineField({ name: "helloEmail", type: "string" }),
    defineField({ name: "partnershipsEmail", type: "string" }),
    defineField({ name: "twitterUrl", type: "url" }),
    defineField({ name: "linkedinUrl", type: "url" }),
    defineField({ name: "youtubeUrl", type: "url" }),
    imageWithAlt("defaultOgImage", "Default OG image"),
  ],
});

export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  groups: [{ name: "seo", title: "SEO" }],
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    pageBuilderField,
    ...seoFields,
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current" },
  },
});

export const author = defineType({
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "role", type: "string" }),
    imageWithAlt("avatar", "Avatar"),
    defineField({ name: "bio", type: "text", rows: 3 }),
  ],
  preview: { select: { title: "name", subtitle: "role", media: "avatar" } },
});

export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "description", type: "text", rows: 2 }),
    defineField({
      name: "accentTone",
      type: "string",
      options: {
        list: [
          { title: "Neutral", value: "neutral" },
          { title: "Score", value: "score" },
        ],
      },
      initialValue: "neutral",
    }),
  ],
  preview: { select: { title: "title", subtitle: "slug.current" } },
});

export const post = defineType({
  name: "post",
  title: "Post",
  type: "document",
  groups: [{ name: "seo", title: "SEO" }],
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "excerpt",
      type: "text",
      rows: 2,
      validation: (r) => r.required().max(200),
    }),
    defineField({
      name: "category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (r) => r.required(),
    }),
    defineField({ name: "author", type: "reference", to: [{ type: "author" }] }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "featured",
      type: "boolean",
      initialValue: false,
    }),
    {
      ...imageWithAlt("coverImage", "Cover image"),
      validation: (r) => r.required(),
    },
    defineField({
      name: "score",
      type: "number",
      title: "Teardown score",
      description:
        "Only for teardown posts — renders the Score Ring on the card and header.",
      validation: (r) => r.min(0).max(100),
    }),
    defineField({
      name: "body",
      type: "portableBody",
    }),
    ...seoFields,
  ],
  preview: {
    select: {
      title: "title",
      media: "coverImage",
      subtitle: "category.title",
    },
  },
  orderings: [
    {
      title: "Published date, new",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
});

export const feature = defineType({
  name: "feature",
  title: "Platform feature",
  type: "document",
  groups: [{ name: "seo", title: "SEO" }],
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "name" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "group",
      type: "string",
      options: {
        list: ["Score", "Create", "Intel", "Publish", "Engage", "Earn", "Learn"],
      },
    }),
    defineField({
      name: "tagline",
      type: "string",
      validation: (r) => r.required().max(90),
    }),
    defineField({
      name: "summary",
      type: "text",
      rows: 3,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "icon",
      type: "string",
      description: "lucide-react icon name, e.g. gauge",
    }),
    {
      ...imageWithAlt("screenshot", "Product screenshot"),
      // Soft requirement — seed starts live:false until screenshots exist
    },
    defineField({
      name: "demoVideo",
      type: "mux.video",
      title: "Demo video",
    }),
    defineField({
      name: "bullets",
      type: "array",
      of: [{ type: "string" }],
      validation: (r) => r.max(4),
    }),
    defineField({
      name: "appHref",
      type: "url",
      description: "Deep link into app.viralyz.com",
    }),
    defineField({ name: "order", type: "number" }),
    defineField({
      name: "live",
      type: "boolean",
      initialValue: true,
      description: "Off = hidden from /platform and nav.",
    }),
    ...seoFields,
  ],
  preview: {
    select: { title: "name", subtitle: "group", media: "screenshot" },
  },
  orderings: [
    {
      title: "Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
});

export const legalPage = defineType({
  name: "legalPage",
  title: "Legal page",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "lastUpdated", type: "date", validation: (r) => r.required() }),
    defineField({
      name: "body",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
  ],
  preview: { select: { title: "title", subtitle: "lastUpdated" } },
});

export const faqItem = defineType({
  name: "faqItem",
  title: "FAQ item",
  type: "document",
  fields: [
    defineField({ name: "question", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "answer",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "audience",
      type: "string",
      options: {
        list: [
          { title: "Creator", value: "creator" },
          { title: "Brand", value: "brand" },
          { title: "General", value: "general" },
          { title: "Affiliate", value: "affiliate" },
        ],
      },
      initialValue: "general",
    }),
  ],
  preview: { select: { title: "question", subtitle: "audience" } },
});

export const ctaBand = defineType({
  name: "ctaBand",
  title: "CTA band",
  type: "document",
  fields: [
    defineField({ name: "heading", type: "string", validation: (r) => r.required() }),
    defineField({ name: "body", type: "text", rows: 2 }),
    defineField({ name: "primaryLabel", type: "string", validation: (r) => r.required() }),
    defineField({ name: "primaryHref", type: "string", validation: (r) => r.required() }),
    defineField({ name: "secondaryLabel", type: "string" }),
    defineField({ name: "secondaryHref", type: "string" }),
  ],
  preview: { select: { title: "heading", subtitle: "primaryLabel" } },
});
