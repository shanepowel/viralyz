import { defineArrayMember, defineField, defineType } from "sanity";

export const linkObject = defineType({
  name: "link",
  title: "Link",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "href", type: "string", validation: (r) => r.required() }),
  ],
});

export const scoreBreakdown = defineType({
  name: "scoreBreakdown",
  title: "Score breakdown",
  type: "object",
  fields: [
    defineField({
      name: "items",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "factor",
          fields: [
            defineField({ name: "factor", type: "string", validation: (r) => r.required() }),
            defineField({
              name: "score",
              type: "number",
              validation: (r) => r.required().min(0).max(100),
            }),
          ],
          preview: {
            select: { title: "factor", subtitle: "score" },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Score breakdown" }),
  },
});

export const calloutBox = defineType({
  name: "calloutBox",
  title: "Callout",
  type: "object",
  fields: [
    defineField({
      name: "tone",
      type: "string",
      options: {
        list: [
          { title: "Tip", value: "tip" },
          { title: "Warning", value: "warning" },
          { title: "Fix", value: "fix" },
        ],
      },
      initialValue: "tip",
    }),
    defineField({
      name: "body",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { tone: "tone" },
    prepare: ({ tone }) => ({ title: `Callout · ${tone ?? "tip"}` }),
  },
});

export const portableBody = defineType({
  name: "portableBody",
  title: "Body",
  type: "array",
  of: [
    defineArrayMember({ type: "block" }),
    defineArrayMember({
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          validation: (r) =>
            r.required().warning("Alt text is required for accessibility and SEO"),
        }),
        defineField({ name: "caption", type: "string" }),
      ],
    }),
    defineArrayMember({ type: "mux.video" }),
    defineArrayMember({ type: "scoreBreakdown" }),
    defineArrayMember({ type: "calloutBox" }),
  ],
});
