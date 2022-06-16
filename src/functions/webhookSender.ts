import { MessageEmbed, WebhookClient } from "discord.js";

export const sendWebhook = async (
  id: string,
  url: string,
  influencer: string
) => {
  const webhookClient = new WebhookClient({
    url: process.env.DISCORD_WEBHOOK_URL as string,
  });
  const embed = new MessageEmbed()
    .setTitle("Uusi TikTok-video käyttäjältä " + influencer)
    .setColor("#0099ff")
    .addField("Videon ID:", id)
    .addField("Videon URL:", url);

  await webhookClient.send({
    content: `<@${process.env.DISCORD_OWNER_ID}>`,
    embeds: [embed],
  });

  await webhookClient.send({ content: id });
};
