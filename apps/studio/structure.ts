import type { StructureResolver } from "sanity/structure";

const PAGE_SINGLES = [
  { id: "homePage", title: "Home" },
  { id: "aboutPage", title: "About" },
  { id: "contactPage", title: "Contact" },
  { id: "affiliatesPage", title: "Affiliates" },
  { id: "forCreatorsPage", title: "For creators" },
  { id: "forBrandsPage", title: "For brands" },
  { id: "reportPage", title: "Viral Score Report" },
] as const;

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Site settings")
        .id("siteSettings")
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings")
            .title("Site settings"),
        ),
      S.divider(),
      S.listItem()
        .title("Pages")
        .child(
          S.list()
            .title("Pages")
            .items([
              ...PAGE_SINGLES.map((p) =>
                S.listItem()
                  .title(p.title)
                  .id(p.id)
                  .child(
                    S.document()
                      .schemaType("page")
                      .documentId(p.id)
                      .title(p.title),
                  ),
              ),
              S.divider(),
              S.documentTypeListItem("page").title("All pages"),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title("Blog")
        .child(
          S.list()
            .title("Blog")
            .items([
              S.documentTypeListItem("post").title("Posts"),
              S.documentTypeListItem("author").title("Authors"),
              S.documentTypeListItem("category").title("Categories"),
            ]),
        ),
      S.documentTypeListItem("feature").title("Platform features"),
      S.documentTypeListItem("faqItem").title("FAQs"),
      S.documentTypeListItem("ctaBand").title("CTA bands"),
      S.documentTypeListItem("legalPage").title("Legal pages"),
    ]);
