import { PreviewValue, Slug } from "@sanity/types";

export default {
  name: "tag",
  type: "document",
  title: "Tag",
  fields: [
    {
      name: "title",
      type: "string",
      title: "Title",
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
  ],
  preview: {
    select: {
      title: "title",
      slug: "slug",
    },
    prepare({
      title = "No title",
      slug,
    }: {
      title?: string;
      slug: Slug;
    }): PreviewValue {
      const path = `/tag/${slug.current}/`;
      return {
        title,
        subtitle: path,
      };
    },
  },
};
