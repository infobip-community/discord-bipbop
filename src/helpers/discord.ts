import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  TextChannel,
  EmbedBuilder,
} from "discord.js";
import { stripHtml } from "string-strip-html";
import Fastify from "fastify";

const fastify = Fastify({
  logger: true,
});

// Discord function
export interface DiscordEmbedAuthor {
  name: string;
  iconURL?: string;
  url?: string;
}
export interface DiscordEmbed {
  title: string;
  url: string;
  imageUrl: string;
  thumbnailUrl?: string;
  description: string;
  author?: DiscordEmbedAuthor;
}
export const sendToDiscord = async (
  channelId: string,
  discordEmbeds: Array<DiscordEmbed>,
) => {
  return new Promise((success, reject) => {
    const discord = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    });
    discord.login(process.env.DISCORD_TOKEN);
    discord.on("ready", async () => {
      try {
        const channel = (await discord.channels.cache.get(
          channelId,
        )) as TextChannel;
        await channel.send({
          embeds: discordEmbeds.map((discordEmbed: DiscordEmbed) => {
            const embed = new EmbedBuilder()
              .setColor(0x0099ff)
              .setTitle(discordEmbed.title)
              .setDescription(stripHtml(discordEmbed.description).result)
              .setURL(discordEmbed.url)
              .setImage(discordEmbed.imageUrl);
            if (discordEmbed.thumbnailUrl)
              embed.setThumbnail(discordEmbed.thumbnailUrl);
            if (discordEmbed.author) {
              const author: DiscordEmbedAuthor = {
                name: discordEmbed.author.name,
              };
              if (discordEmbed.author.iconURL)
                author.iconURL = discordEmbed.author.iconURL;
              if (discordEmbed.author.url) author.url = discordEmbed.author.url;
              embed.setAuthor(author);
            }
            return embed;
          }),
        });
        return success(true);
      } catch (error) {
        fastify.log.error(error);
        return reject(error);
      }
    });
  });
};
