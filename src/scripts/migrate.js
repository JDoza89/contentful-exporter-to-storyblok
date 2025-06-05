import fs from "fs/promises";
import path from "path";
import importAssets from "./helpers/importAssets.js";
import importEntries from "./helpers/importEntries.js";

async function loadExport() {
  const filePath = path.resolve(
    process.cwd(),
    "content",
    "contentfulExport.json"
  );
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

async function runMigration() {
  console.log("Loading Data:");
  const data = await loadExport();
  console.log("✅ Data loaded successfully.", data);
  await importAssets(data.assets, "en-US");
  await importEntries(data.entries, data.assets);
}

async function main() {
  try {
    console.log("Starting migration...");
    await runMigration();
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

main();
