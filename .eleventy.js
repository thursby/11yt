const { DateTime } = require("luxon");
const CleanCSS = require("clean-css");
const UglifyJS = require("uglify-es");
const htmlmin = require("html-minifier");

const fs = require('fs');

console.log("Getting YT videos");
//rss url for your videos
const url = 'https://www.youtube.com/feeds/videos.xml?channel_id=UC1JNnoFiWxeTe-nyorgAZFw';

let Parser = require('rss-parser');
let parser = new Parser({
    customFields: {
      item: [
        ['media:group', 'group'],
      ]
    }
  });


let videos = [];

(async() => {
    let feed = await parser.parseURL(url);
    feed.items.forEach(item => {
        //create a videoId from id
        item.videoId = item.id.split(":").pop();
        item.description = item.group["media:description"];
        // tmp = item.group["media:thumbnail"];
        // holy garbage batman this was a major pain to figure out.
        item.thumbnail = item.group["media:thumbnail"][0]["$"];
        item.views = item.group["media:community"][0]["media:statistics"][0]["$"]["views"];
        videos.push(item);
    });

    let JSONText = JSON.stringify(videos, null, 2);

    fs.writeFileSync('./_data/videos.json', JSONText);

})();

module.exports = function(eleventyConfig) {
    eleventyConfig.addLayoutAlias("post", "layouts/post.njk");

    // Date formatting (human readable)
    eleventyConfig.addFilter("readableDate", dateObj => {
        return DateTime.fromJSDate(dateObj).toFormat("dd LLL yyyy");
    });

    // Date formatting (machine readable)
    eleventyConfig.addFilter("machineDate", dateObj => {
        return DateTime.fromJSDate(dateObj).toFormat("yyyy-MM-dd");
    });

    // Minify CSS
    eleventyConfig.addFilter("cssmin", function(code) {
        return new CleanCSS({}).minify(code).styles;
    });

    // Minify JS
    eleventyConfig.addFilter("jsmin", function(code) {
        let minified = UglifyJS.minify(code);
        if (minified.error) {
            console.log("UglifyJS error: ", minified.error);
            return code;
        }
        return minified.code;
    });

    // Minify HTML output
    eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
        if (outputPath.indexOf(".html") > -1) {
            let minified = htmlmin.minify(content, {
                useShortDoctype: true,
                removeComments: true,
                collapseWhitespace: true
            });
            return minified;
        }
        return content;
    });

    // only content in the `posts/` directory
    eleventyConfig.addCollection("posts", function(collection) {
        return collection.getAllSorted().filter(function(item) {
            return item.inputPath.match(/^\.\/posts\//) !== null;
        });
    });

    // Don't process folders with static assets e.g. images
    eleventyConfig.addPassthroughCopy("favicon.ico");
    eleventyConfig.addPassthroughCopy("static/img");
    eleventyConfig.addPassthroughCopy("admin");
    eleventyConfig.addPassthroughCopy("_includes/assets/");

    /* Markdown Plugins */
    let markdownIt = require("markdown-it");
    let markdownItAnchor = require("markdown-it-anchor");
    let options = {
        html: true,
        breaks: true,
        linkify: true
    };
    let opts = {
        permalink: false
    };

    eleventyConfig.setLibrary("md", markdownIt(options)
        .use(markdownItAnchor, opts)
    );

    return {
        templateFormats: ["md", "njk", "html", "liquid"],

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
            output: "_site"
        }
    };
};