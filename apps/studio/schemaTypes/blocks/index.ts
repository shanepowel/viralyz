import { defineArrayMember, defineField, defineType } from "sanity";
import { imageWithAlt, videoField } from "../shared/mediaFields";

const ctaFields = [
  defineField({ name: "label", type: "string" }),
  defineField({ name: "href", type: "string" }),
];

export const heroBlock = defineType({
  name: "hero",
  title: "Hero",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", type: "string" }),
    defineField({ name: "heading", type: "string", validation: (r) => r.required() }),
    defineField({ name: "lede", type: "text", rows: 3 }),
    defineField({ name: "primaryCta", type: "object", fields: ctaFields }),
    defineField({ name: "secondaryCta", type: "object", fields: ctaFields }),
    defineField({
      name: "mediaKind",
      type: "string",
      options: {
        list: [
          { title: "None", value: "none" },
          { title: "Image", value: "image" },
          { title: "Video", value: "video" },
          { title: "Score demo", value: "scoreDemo" },
        ],
      },
      initialValue: "none",
    }),
    imageWithAlt("image", "Hero image"),
    videoField("video"),
  ],
  preview: {
    select: { title: "heading", media: "image" },
    prepare: ({ title, media }) => ({ title: title || "Hero", subtitle: "Hero", media }),
  },
});

export const splitMediaBlock = defineType({
  name: "splitMedia",
  title: "Split media",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", type: "string" }),
    defineField({ name: "heading", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "body",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "bullets",
      type: "array",
      of: [{ type: "string" }],
      validation: (r) => r.max(6),
    }),
    defineField({
      name: "mediaSide",
      type: "string",
      options: {
        list: [
          { title: "Left", value: "left" },
          { title: "Right", value: "right" },
        ],
      },
      initialValue: "right",
    }),
    defineField({
      name: "mediaKind",
      type: "string",
      options: {
        list: [
          { title: "Image", value: "image" },
          { title: "Video", value: "video" },
        ],
      },
      initialValue: "image",
    }),
    imageWithAlt("image", "Media image"),
    videoField("video"),
    defineField({ name: "cta", type: "object", fields: ctaFields }),
  ],
  preview: {
    select: { title: "heading", media: "image" },
    prepare: ({ title, media }) => ({
      title: title || "Split media",
      subtitle: "Split media",
      media,
    }),
  },
});

export const featureGridBlock = defineType({
  name: "featureGrid",
  title: "Feature grid",
  type: "object",
  fields: [
    defineField({ name: "heading", type: "string" }),
    defineField({
      name: "items",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "icon",
              type: "string",
              description: "lucide-react icon name, e.g. gauge",
            }),
            defineField({ name: "title", type: "string", validation: (r) => r.required() }),
            defineField({ name: "body", type: "text", rows: 3 }),
            defineField({ name: "href", type: "string" }),
          ],
          preview: { select: { title: "title", subtitle: "body" } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "heading" },
    prepare: ({ title }) => ({ title: title || "Feature grid", subtitle: "Feature grid" }),
  },
});

export const videoShowcaseBlock = defineType({
  name: "videoShowcase",
  title: "Video showcase",
  type: "object",
  fields: [
    defineField({ name: "heading", type: "string" }),
    videoField("video"),
    imageWithAlt("poster", "Poster"),
    defineField({ name: "caption", type: "string" }),
  ],
  preview: {
    select: { title: "heading" },
    prepare: ({ title }) => ({ title: title || "Video showcase", subtitle: "Video" }),
  },
});

export const galleryBlock = defineType({
  name: "gallery",
  title: "Gallery",
  type: "object",
  fields: [
    defineField({
      name: "images",
      type: "array",
      of: [defineArrayMember({ type: "image", options: { hotspot: true }, fields: [
        defineField({ name: "alt", type: "string" }),
        defineField({ name: "caption", type: "string" }),
      ] })],
    }),
    defineField({
      name: "layout",
      type: "string",
      options: {
        list: [
          { title: "Grid", value: "grid" },
          { title: "Strip", value: "strip" },
        ],
      },
      initialValue: "grid",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Gallery" }),
  },
});

export const statsBandBlock = defineType({
  name: "statsBand",
  title: "Stats band",
  type: "object",
  fields: [
    defineField({
      name: "items",
      type: "array",
      description:
        "Only product truths. No usage claims without evidence.",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "value", type: "string", validation: (r) => r.required() }),
            defineField({ name: "label", type: "string", validation: (r) => r.required() }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Stats band" }),
  },
});

export const faqSectionBlock = defineType({
  name: "faqSection",
  title: "FAQ section",
  type: "object",
  fields: [
    defineField({ name: "heading", type: "string" }),
    defineField({
      name: "faqs",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "faqItem" }] })],
    }),
  ],
  preview: {
    select: { title: "heading" },
    prepare: ({ title }) => ({ title: title || "FAQ", subtitle: "FAQ section" }),
  },
});

export const ctaSectionBlock = defineType({
  name: "ctaSection",
  title: "CTA section",
  type: "object",
  fields: [
    defineField({
      name: "band",
      type: "reference",
      to: [{ type: "ctaBand" }],
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    prepare: () => ({ title: "CTA section" }),
  },
});

export const richTextBlock = defineType({
  name: "richText",
  title: "Rich text",
  type: "object",
  fields: [
    defineField({
      name: "body",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Rich text" }),
  },
});

export const logoStripBlock = defineType({
  name: "logoStrip",
  title: "Logo strip",
  type: "object",
  hidden: true,
  fields: [
    defineField({ name: "heading", type: "string" }),
    defineField({
      name: "logos",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", type: "string" }),
            defineField({ name: "caption", type: "string" }),
          ],
        }),
      ],
    }),
  ],
});

export const pageBuilderBlocks = [
  heroBlock,
  splitMediaBlock,
  featureGridBlock,
  videoShowcaseBlock,
  galleryBlock,
  statsBandBlock,
  faqSectionBlock,
  ctaSectionBlock,
  richTextBlock,
  logoStripBlock,
];
