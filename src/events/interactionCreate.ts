import {
  Client,
  CommandInteraction,
  GuildMember,
  Permissions,
} from "discord.js";

export default {
  name: "interactionCreate",
  async execute(client: Client, interaction: CommandInteraction) {
    if (interaction.isCommand()) {
      if (
        !(interaction?.member as GuildMember)?.permissions?.has(
          Permissions.FLAGS.MANAGE_MESSAGES
        )
      ) {
        return null;
      }

      const command = client.commands.get(interaction.commandName).default;
      if (!command) return null;

      try {
        await command.execute(client, interaction);
      } catch (error) {
        console.error(error);
      }
    }
  },
};
