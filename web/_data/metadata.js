const BlocksToMarkdown = require("@sanity/block-content-to-markdown");
const groq = require("groq");
const client = require("../utils/sanityClient.js");
const serializers = require("../utils/serializers");

function generateSettings(settings) {
  return {
    ...settings,
    intro: BlocksToMarkdown(settings.intro, { serializers, ...client.config() }),
  };
}

module.exports = async function () {
  return generateSettings(
    await client.fetch(groq`
    *[_id == "siteSettings"]{
      ...
    }[0]
  `)
  );
};
