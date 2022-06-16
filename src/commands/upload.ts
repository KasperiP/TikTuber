import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction } from "discord.js";
import { uploadToYoutube } from "../functions/uploadToYoutube";
import Videos from "../schemas/videoSchema";

export default {
  data: new SlashCommandBuilder()
    .setName("upload")
    .setDescription("Julkaise TikTok-video YouTubeen!")
    .setDefaultMemberPermissions(0)
    .addStringOption((option) =>
      option
        .setName("id")
        .setDescription("Julkaistavan videon ID")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("Syötä videon otsikko.")
        .setRequired(true)
    ),

  async execute(client: Client, interaction: CommandInteraction) {
    await interaction.deferReply();

    const title = interaction.options.getString("title", true);
    const id = interaction.options.getString("id", true);

    const video = await Videos.findOne({
      "downloadedVideos.id": id,
      uploaded: false,
    });

    if (!video) {
      return interaction.editReply("Videota ei löytynyt tai se on jo ladattu.");
    }

    const path = video.downloadedVideos.find(
      (video: any) => video.id === id
    )?.path;

    const videoUrl = await uploadToYoutube(path, title, video.influencer);

    await Videos.updateOne({ _id: video._id }, { $set: { uploaded: true } });

    return interaction.editReply(`Video ladattu YouTubeen: ${videoUrl}`);
  },
};
