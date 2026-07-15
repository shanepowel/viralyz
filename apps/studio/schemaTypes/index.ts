import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentTextIcon, TagIcon, UserIcon} from '@sanity/icons'

export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (r) => r.required(),
    }),
  ],
})

export const author = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({name: 'name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'role', type: 'string'}),
    defineField({
      name: 'avatar',
      type: 'image',
      options: {hotspot: true},
    }),
  ],
})

export const scoreCallout = defineType({
  name: 'scoreCallout',
  title: 'Score callout',
  type: 'object',
  fields: [
    defineField({
      name: 'score',
      type: 'number',
      validation: (r) => r.required().min(0).max(100),
    }),
    defineField({name: 'label', type: 'string'}),
    defineField({name: 'note', type: 'text', rows: 3}),
  ],
  preview: {
    select: {title: 'label', subtitle: 'score'},
    prepare: ({title, subtitle}) => ({
      title: title || 'Score callout',
      subtitle: subtitle != null ? `Score ${subtitle}` : undefined,
    }),
  },
})

export const post = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      rows: 3,
      description:
        'One or two sentences shown on the card. Plain language, no em dashes.',
    }),
    defineField({
      name: 'category',
      type: 'reference',
      to: [{type: 'category'}],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'author',
      type: 'reference',
      to: [{type: 'author'}],
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'coverImage',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          validation: (r) => r.required(),
        }),
      ],
    }),
    defineField({
      name: 'scoreBadge',
      type: 'string',
      description:
        'Optional short badge shown on the card image, e.g. 94 or +12. Leave empty for none.',
    }),
    defineField({
      name: 'body',
      type: 'array',
      of: [
        defineArrayMember({type: 'block'}),
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              validation: (r) => r.required(),
            }),
          ],
        }),
        defineArrayMember({type: 'scoreCallout'}),
      ],
    }),
    defineField({name: 'seoTitle', type: 'string'}),
    defineField({name: 'seoDescription', type: 'text', rows: 2}),
  ],
  orderings: [
    {
      title: 'Published date, new',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {title: 'title', media: 'coverImage', subtitle: 'category.title'},
  },
})

export const schemaTypes = [post, category, author, scoreCallout]
