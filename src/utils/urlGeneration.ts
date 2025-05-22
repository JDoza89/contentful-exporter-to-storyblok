import slugify from "slugify";

export function generateSlugFromName(name: string): string {
  return slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });
}
