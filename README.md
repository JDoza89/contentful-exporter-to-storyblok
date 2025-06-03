# contentful-exporter-to-storyblok

This is a sample project meant to act as a guide for migrating content from Contentful to Storyblok.

Tools Used
This project utilizes the following:

- [contentful-cli - space export content command](https://github.com/contentful/contentful-cli/tree/main/docs/space/export) to export content.

- [storyblok-js-client](https://github.com/storyblok/storyblok-js-client) to create corresponding entries in the target Storyblok space.

- [slugify](https://github.com/simov/slugify) to generate URL-safe slugs.

Getting Started

1. Install Dependencies

```bash
npm install
```

2. Populate the Configs

<br/>
Contentful:
<br/>
Refer to the Contentful [space export command](https://github.com/contentful/contentful-cli/tree/main/docs/space/export) documentation to determine the required values for the `contentfulConfig.json` file.

Storyblok:
<br/>
Create a `storyblokConfig.json` file in the project root with the following content:

```json
{
  "storyblokPersonalAccessToken": "your_personal_access_token",
  "storyblokSpaceId": "your_space_id",
  "storyblokSpaceRegion": "your_space_region"
}
```

To learn how to create a Personal Access Token for Storyblok, refer to this documentation:
[Storyblok Access Tokens](https://www.storyblok.com/docs/concepts/access-tokens)

3. Run the Migration

```bash
npm run migrate
```

This command will export content from Contentful and recreate the corresponding entries in your specified Storyblok space.
