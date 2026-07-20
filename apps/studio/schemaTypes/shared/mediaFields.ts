import { defineField } from "sanity";

export const imageWithAlt = (name: string, title?: string) =>
  defineField({
    name,
    title,
    type: "image",
    options: { hotspot: true },
    fields: [
      defineField({
        name: "alt",
        type: "string",
        title: "Alternative text",
        validation: (r) =>
          r
            .required()
            .warning("Alt text is required for accessibility and SEO"),
      }),
      defineField({ name: "caption", type: "string" }),
    ],
  });

export const videoField = (name = "video") =>
  defineField({
    name,
    type: "mux.video",
    title: "Video",
    description:
      "Upload or pick from Mux. Keep demo clips under 45s, no audio required.",
  });
