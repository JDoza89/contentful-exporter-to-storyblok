import { Storyblok } from "../../lib/storyblokClient.js";
import fs from "fs";
import FormData from "form-data";
import path from "path";
import storyblokConfig from "../../../storyblokConfig.json" with { type: "json" };

async function fileUpload(signed_request, file, success, failed) {
  var form = new FormData();
  for (var key in signed_request.fields) {
    form.append(key, signed_request.fields[key]);
  }
  form.append("file", fs.createReadStream(file));
  form.submit(signed_request.post_url, function (err, res) {
    if (err) throw err;
    console.log(
      "https://a.storyblok.com/" + signed_request.fields.key + " UPLOADED!"
    );
  });
}

export default async function importAssets(assets, locale = "en-US") {
  console.log("Importing assets...");
  for (const asset of assets ?? []) {
    const file = asset.fields.file?.[locale];
    if (file?.details && asset.fields.file?.[locale]?.fileName) {
      await Storyblok.post(
        `spaces/${storyblokConfig.storyblokSpaceId}/assets/`,
        {
          filename: asset.fields.file?.[locale]?.fileName,
          size: `${file.details.image.width}x${file.details.image.height}`,
        }
      )
        .then(async (response) => {
          if (file?.url) {
            const contentPath = path.resolve(
              process.cwd(),
              "content",
              file.url.replace(/^\/+/, "")
            );
            await fileUpload(
              response.data,
              contentPath,
              function () {
                console.log("Done");
              },
              function () {
                console.log("Failed");
              }
            );
          }
          console.log("✅ Asset uploaded:", asset.fields.title?.[locale]);
        })
        .catch((error) => {
          console.log("❌ Asset upload failed:", error);
        });
    }
  }
}
