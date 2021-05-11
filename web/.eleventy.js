const { DateTime } = require("luxon");
const util = require("util");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  eleventyConfig.addFilter("debug", function (value) {
    return util.inspect(value, { compact: false });
  });

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Date(dateObj).toDateString();
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  eleventyConfig.addFilter("hasTag", (postObj, tag) => {
    if (postObj.tags && !!postObj.tags.find(({ slug }) => slug.current === tag)) {
      return true;
    }

    return false;
  });

  const markdownIt = require("markdown-it");
  const markdownItAnchor = require("markdown-it-anchor");
  const prism = require("markdown-it-prism");
  const options = {
    html: true,
    breaks: true,
    linkify: true,
  };
  const opts = {
    permalink: true,
    permalinkClass: "direct-link",
    permalinkSymbol: "#",
  };

  eleventyConfig.setLibrary("md", markdownIt(options).use(markdownItAnchor, opts));

  eleventyConfig.addFilter("markdownify", function (value) {
    const md = new markdownIt(options);
    md.use(prism);
    return md.render(value);
  });

  eleventyConfig.addPlugin(syntaxHighlight);

  return {
    templateFormats: ["md", "njk", "html", "liquid", "jpg", "webp"],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about it.
    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for URLs (it does not affect your file structure)
    pathPrefix: "/",

    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    passthroughFileCopy: true,
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
  };
};
