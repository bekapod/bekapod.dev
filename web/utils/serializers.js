const imageUrl = require("./imageUrl");

// Learn more on https://www.sanity.io/guides/introduction-to-portable-text
module.exports = {
  types: {
    code: ({ node }) => "```" + node.language + "\n" + node.code + "\n```",
    mainImage: ({ node }) =>
      `<img src="${imageUrl(node).width(600).url()}" alt="${node.alt}" loading="lazy" />`,
  },
};
