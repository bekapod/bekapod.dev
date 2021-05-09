import S from "@sanity/desk-tool/structure-builder";
import { MdSettings } from "react-icons/md";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hiddenDocTypes = (listItem: any) =>
  !["post", "siteSettings"].includes(listItem.getId());

export default (): unknown =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Settings")
        .icon(MdSettings)
        .child(
          S.editor()
            .id("siteSettings")
            .schemaType("siteSettings")
            .documentId("siteSettings"),
        ),
      S.listItem()
        .title("Blog posts")
        .schemaType("post")
        .child(S.documentTypeList("post").title("Blog posts")),
      // This returns an array of all the document types
      // defined in schema.js. We filter out those that we have
      // defined the structure above
      ...S.documentTypeListItems().filter(hiddenDocTypes),
    ]);
