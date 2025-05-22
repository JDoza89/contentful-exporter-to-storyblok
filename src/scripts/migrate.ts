import fs from "fs/promises";
import path from "path";
import { ContentfulExport } from "../types/ContentfulExport";
import importEntries from "./utils/importEntries";
import runContentfulExport from "contentful-export";
import contentfulConfig from "../../contentfulConfig.json";
import importAssets from "./utils/importAssets";

async function exportContentful() {
  console.log("Exporting Contentful data...");
  try {
    await runContentfulExport(contentfulConfig);
    console.log("✅ Export completed.");
  } catch (error) {
    console.error("❌ Export failed:", error);
  }
}
async function loadExport(): Promise<ContentfulExport> {
  const filePath = path.resolve(
    process.cwd(),
    "content",
    "contentfulExport.json"
  );
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as ContentfulExport;
}

async function runMigration() {
  console.log("Loading Data:");
  const data = await loadExport();
  console.log("✅ Data loaded successfully.", data);
  //TODO: support locales and content types
  // The current assumption is that the content types are already created in Storyblok
  // and only en locale is used
  await importAssets(data.assets, "en-US");
  await importEntries(data.entries, data.assets);
}

async function main() {
  try {
    console.log("Starting migration...");
    await exportContentful();
    await runMigration();
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

main();
