import StoryblokClient from "storyblok-js-client";
import storyblokConfig from "../../storyblokConfig.json";

export const Storyblok = new StoryblokClient({
  oauthToken: storyblokConfig.storyblokPersonalAccessToken,
});
