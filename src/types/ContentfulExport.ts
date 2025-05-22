// Only supports what is needed for this example
export interface ContentfulExport {
  entries?: import("contentful-management").EntryProps<
    Record<string, Record<string, unknown>>
  >[];
  assets?: import("contentful-management").AssetProps[];
}
