let Parser = require('rss-parser');


module.exports = async function () {
    console.log("Getting YT videos");
    //rss url for your videos
    const url = 'https://www.youtube.com/feeds/videos.xml?channel_id=UC1JNnoFiWxeTe-nyorgAZFw';

    let parser = new Parser({
        customFields: {
            item: [
                ['media:group', 'group'],
            ]
        }
    });


    let videos = [];

    // (async() => {
    let feed = await parser.parseURL(url);
    // await parser.parseURL(url, function (err, feed) {
    feed.items.forEach(item => {
        //create a videoId from id
        item.videoId = item.id.split(":").pop();
        console.log(item.videoId);
        item.description = item.group["media:description"];
        // tmp = item.group["media:thumbnail"];
        // holy garbage batman this was a major pain to figure out.
        item.thumbnail = item.group["media:thumbnail"][0]["$"];
        item.views = item.group["media:community"][0]["media:statistics"][0]["$"]["views"];
        videos.push(item);
    });

    let JSONText = JSON.stringify(videos, null, 2);
    //fs.writeFileSync('./_data/videos.json', JSONText);
    return videos;
    // });
    // })();
};