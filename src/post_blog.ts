import "dotenv/config";
import dayjs from "dayjs";
import { sendToDiscord } from "./helpers/discord";
import Fastify from "fastify";

const fastify = Fastify({
  logger: true,
});

export const start = async () => {
  try {
    const timeBefore = dayjs()
      .add(-1, "hour")
      .minute(0)
      .second(0)
      .millisecond(0)
      .toISOString();
    const timeAfter = dayjs()
      .add(-2, "hour")
      .minute(0)
      .second(0)
      .millisecond(0)
      .toISOString();
    const wordpressUrl = `${process.env.INFOBIP_WP_URL}/wp-json/wp/v2/posts?_fields=id,author,excerpt,title,featured_media,link,categories,_links,_embedded&_embed&after=${timeAfter}&before=${timeBefore}`;
    const rssResponse = await fetch(wordpressUrl, {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    });
    const feed = await rssResponse.json();
    if (feed.length) {
      await sendToDiscord(
        String(process.env.DISCORD_BLOG_CHANNEL),
        feed.map((post: any) => {
          return {
            title: post.title.rendered,
            url: post.link,
            imageUrl: post._embedded["wp:featuredmedia"][0].link,
            thumbnailUrl: post._embedded["wp:featuredmedia"][0].link,
            description: post.excerpt.rendered,
            author: {
              name: post._embedded.author[0].name,
            },
          };
        }),
      );
    }
    fastify.log.info({
      wordpressUrl,
      feed,
    });
    process.exit(0);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
