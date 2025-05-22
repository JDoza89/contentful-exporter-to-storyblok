import { ContentfulExport } from "../../types/ContentfulExport";
import { ISbContentMangmntAPI } from "storyblok-js-client/dist/types/interfaces";
import { convertContentfulRT } from "../../utils/richTextConverter";
import { generateSlugFromName } from "../../utils/urlGeneration";
import { Storyblok } from "../../lib/storyblokClient";
import storyblokConfig from "../../../storyblokConfig.json";
import { EntryProps, SysLink } from "contentful-management";
type Entry = EntryProps<Record<string, Record<string, unknown>>>;
type GroupedEntries = ReturnType<typeof groupEntries>;
type MappedStory = ISbContentMangmntAPI["story"];

// We need to group the entries so that we can create the stories in the correct order
// articles are dependent on authors and categories, so we need to create them first
function groupEntries(entries: ContentfulExport["entries"]) {
  const grouped = {
    category: [] as any[],
    author: [] as any[],
    article: [] as any[],
  };

  for (const entry of entries ?? []) {
    const type = entry.sys.contentType.sys.id;
    if (type === "category") grouped.category.push(entry);
    else if (type === "author") grouped.author.push(entry);
    else if (type === "blogPage") grouped.article.push(entry);
  }

  return grouped;
}

async function mapAuthorEntry(
  entry: Entry,
  assets: ContentfulExport["assets"],
  locale: string
): Promise<MappedStory> {
  let image: any = null;
  try {
    const asset = assets?.find(
      (asset) =>
        asset.sys.id === (entry.fields?.image?.[locale] as SysLink)?.sys?.id
    );
    const sbImage = await Storyblok.get(
      `spaces/${storyblokConfig.storyblokSpaceId}/assets/`,
      {
        search: asset?.fields?.file?.[locale]?.fileName,
      }
    );
    image = sbImage.data?.assets?.[0];
  } catch (error) {
    console.error(
      `Error fetching image for author entry: ${entry.fields?.internalName?.[locale]}`,
      error
    );
  }
  return {
    name: entry.fields?.internalName?.[locale],
    slug: generateSlugFromName(entry.fields?.internalName?.[locale] as string),
    content: {
      name:
        entry.fields?.title?.[locale] || entry.fields?.internalName?.[locale],
      externalId: entry.sys.id, // used to find the value and assign it to the correct blog - temporary field
      image: {
        id: image?.id,
        alt: image?.alt,
        focus: image?.focus,
        title: image?.title,
        source: image?.source,
        filename: image?.filename,
        copyright: image?.copyright,
        fieldtype: "asset",
        is_external_url: false,
      },
      component: "author",
    },
    is_folder: false,
    parent_id: "675527879", // ID of the parent folder "authors"
    is_startpage: false,
  } as ISbContentMangmntAPI["story"];
}

function mapCategoryEntry(entry: Entry, locale: string): MappedStory {
  return {
    name: entry.fields?.name?.[locale],
    slug: entry.fields?.slug?.[locale],
    content: {
      name: entry.fields?.name?.[locale],
      component: "category",
      externalId: entry.sys.id, // used to find the value and assign it to the correct blog - temporary field
    },
    is_folder: false,
    parent_id: "675546908", // ID of the parent folder "categories"
    is_startpage: false,
  } as ISbContentMangmntAPI["story"];
}

async function mapArticleEntry(
  entry: Entry,
  locale: string
): Promise<MappedStory> {
  const authors = await Storyblok.get(
    `spaces/${storyblokConfig.storyblokSpaceId}/stories`,
    {
      component: "author",
      filter_query: {
        externalId: {
          in: (entry.fields?.authors?.[locale] as SysLink[])
            ?.map((author: any) => author.sys.id)
            .join(","),
        },
      },
    }
  );
  const categories = await Storyblok.get(
    `spaces/${storyblokConfig.storyblokSpaceId}/stories`,
    {
      component: "category",
      filter_query: {
        externalId: {
          in: (entry.fields?.categories?.[locale] as SysLink[])
            ?.map((author: any) => author.sys.id)
            .join(","),
        },
      },
    }
  );

  const rt = convertContentfulRT(entry.fields?.body?.[locale]);
  return {
    name: entry.fields?.internalName?.[locale],
    slug: entry.fields?.slug?.[locale],
    content: {
      name:
        entry.fields?.title?.[locale] || entry.fields?.internalName?.[locale],
      body: rt,
      date: entry.fields?.date?.[locale],
      authors: authors.data.stories.map((author) => author.uuid),
      categories: categories.data.stories.map((category) => category.uuid),
      component: "article",
    },
    is_folder: false,
    parent_id: "674895072", // ID of the parent folder "blogs"
    is_startpage: false,
  } as ISbContentMangmntAPI["story"];
}

async function createStoriesSequentially(
  groupedEntries: GroupedEntries,
  assets: ContentfulExport["assets"],
  locale: string
) {
  for (const group of ["author", "category", "article"] as const) {
    for (const entry of groupedEntries[group]) {
      try {
        let mapped: MappedStory | null = null;
        switch (group) {
          case "author":
            mapped = await mapAuthorEntry(entry, assets, locale);
            break;
          case "category":
            mapped = mapCategoryEntry(entry, locale);
            break;
          case "article":
            mapped = await mapArticleEntry(entry, locale);
            break;
        }

        if (mapped) {
          const res = await Storyblok.post(
            `spaces/${storyblokConfig.storyblokSpaceId}/stories`,
            {
              story: mapped,
            }
          );
          console.log(`✅ Created ${group}: ${mapped.name}`);
        }
      } catch (error) {
        console.error(`❌ Failed to create ${group}:`, error);
      }
    }
  }
}

export default async function importContentTypes(
  entries: ContentfulExport["entries"],
  assets: ContentfulExport["assets"],
  locale: string = "en-US"
) {
  console.log("Importing entries...");
  const grouped = groupEntries(entries);
  await createStoriesSequentially(grouped, assets, locale);
  console.log("✅ Entries imported successfully.");
}
