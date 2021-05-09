import { format } from "date-fns";
import { PreviewValue, Slug } from "@sanity/types";

export default {
  name: "post",
  type: "document",
  title: "Post",
  fields: [
    {
      name: "title",
      type: "string",
      title: "Title",
      description: "Titles should be catchy, descriptive, and not too long",
    },
    {
      name: "slug",
      type: "slug",
      title: "Slug",
      options: {
        source: "title",
        maxLength: 96,
      },
    },
    {
      name: "publishedAt",
      type: "datetime",
      title: "Published at",
      description: "This can be used to schedule post for publishing",
    },
    {
      name: "excerpt",
      type: "excerptPortableText",
      title: "Excerpt",
      description:
        "This ends up on summary pages, on Google, when people share your post in social media.",
    },
    {
      name: "body",
      type: "bodyPortableText",
      title: "Body",
    },
    {
      name: "sources",
      type: "array",
      title: "Sources",
      of: [
        {
          type: "reference",
          to: {
            type: "source",
          },
        },
      ],
    },
    {
      name: "tags",
      type: "array",
      title: "Tags",
      of: [
        {
          type: "reference",
          to: {
            type: "tag",
          },
        },
      ],
    },
  ],
  orderings: [
    {
      name: "publishingDateAsc",
      title: "Publishing date new–>old",
      by: [
        {
          field: "publishedAt",
          direction: "asc",
        },
        {
          field: "title",
          direction: "asc",
        },
      ],
    },
    {
      name: "publishingDateDesc",
      title: "Publishing date old->new",
      by: [
        {
          field: "publishedAt",
          direction: "desc",
        },
        {
          field: "title",
          direction: "asc",
        },
      ],
    },
  ],
  preview: {
    select: {
      title: "title",
      publishedAt: "publishedAt",
      slug: "slug",
    },
    prepare({
      title = "No title",
      slug,
    }: {
      title?: string;
      slug: Slug;
    }): PreviewValue {
      const path = `/post/${slug.current}/`;
      return {
        title,
        subtitle: path,
      };
    },
  },
};
