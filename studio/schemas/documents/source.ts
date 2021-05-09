import { PreviewValue } from "@sanity/types";

export default {
  name: "source",
  type: "document",
  title: "Source",
  fields: [
    {
      name: "title",
      type: "string",
      title: "Title",
    },
    {
      name: "image",
      type: "mainImage",
      title: "Image",
    },
    {
      name: "description",
      type: "excerptPortableText",
      title: "Description",
    },
    {
      name: "url",
      type: "url",
      title: "URL",
    },
  ],
  preview: {
    select: {
      title: "title",
      media: "image",
    },
    prepare({
      title = "No title",
      media,
    }: {
      title?: string;
      media?: string;
    }): PreviewValue {
      return {
        title,
        media,
      };
    },
  },
};
