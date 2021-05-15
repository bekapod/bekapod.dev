const BlocksToMarkdown = require("@sanity/block-content-to-markdown");
const groq = require("groq");
const client = require("../utils/sanityClient.js");
const serializers = require("../utils/serializers");
const overlayDrafts = require("../utils/overlayDrafts");
const imageUrl = require("../utils/imageUrl");
const hasToken = !!client.config().token;

function generatePost(post) {
  return {
    ...post,
    body: BlocksToMarkdown(post.body, { serializers, ...client.config() }),
    excerpt: BlocksToMarkdown(post.excerpt, { serializers, ...client.config() }),
    sources: post.sources?.map(generateSource) ?? [],
  };
}

function generateSource(source) {
  return {
    ...source,
    description: BlocksToMarkdown(source.description, { serializers, ...client.config() }),
    image: source.image
      ? `<img src="${imageUrl(source.image).width(150).url()}" alt="${source.image.alt.replace(
          /"/g,
          "&quot;"
        )}" loading="lazy" />`
      : "",
  };
}

async function getPosts() {
  // Learn more: https://www.sanity.io/docs/data-store/how-queries-work
  const filter = groq`*[_type == "post" && defined(slug) && publishedAt < now()]`;
  const projection = groq`{
    _id,
    publishedAt,
    title,
    slug,
    excerpt,
    tags[]->{
      ...
    },
    sources[]->{
      ...
    },
    body[]{
      ...,
      children[]{
        ...
      }
    }
  }`;
  const order = `| order(publishedAt asc)`;
  const query = [filter, projection, order].join(" ");
  const docs = await client.fetch(query).catch((err) => console.error(err));
  const reducedDocs = overlayDrafts(hasToken, docs);
  const preparePosts = reducedDocs.map(generatePost);
  return preparePosts;
}

module.exports = getPosts;
