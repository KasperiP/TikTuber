import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Client } from "discord.js";
import { readdirSync } from "fs";

export default {
  name: "ready",
  once: true,
  async execute(client: Client) {
    // Get all commands
    const path = `${__dirname}/../commands`;
    const commands = [];
    const commandFiles = readdirSync(path).filter(
      (file) => file.endsWith(".ts") || file.endsWith(".js")
    );
    for await (const file of commandFiles) {
      const command = (await import(`../commands/${file}`)).default;
      commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: "9" }).setToken(
      process.env.DISCORD_BOT_TOKEN as string
    );
    (async () => {
      // Register commands
      try {
        await rest.put(
          Routes.applicationGuildCommands(
            process.env.CLIENT_ID as string,
            process.env.GUILD_ID as string
          ),
          {
            body: commands,
          }
        );

        console.log("> Discord commands registered");
      } catch (error) {
        console.error(error);
      }
    })();
  },
};
