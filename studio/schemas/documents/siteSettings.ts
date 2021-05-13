export default {
  name: "siteSettings",
  type: "document",
  title: "Site Settings",
  __experimental_actions: ["update", /* 'create', 'delete', */ "publish"],
  fields: [
    {
      name: "title",
      type: "string",
      title: "Title",
    },
    {
      name: "intro",
      type: "excerptPortableText",
      title: "Intro",
    },
    {
      name: "description",
      type: "text",
      title: "Description",
    },
    {
      name: "keywords",
      type: "array",
      title: "Keywords",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    },
  ],
};
