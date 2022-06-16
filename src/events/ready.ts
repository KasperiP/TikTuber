import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { readdirSync } from "fs";
import { logger } from "../utils/logger";

export default {
  name: "ready",
  once: true,
  async execute() {
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

        logger.info("Registered bot commands");
      } catch (error) {
        logger.error("Error while registering commands:\n" + error);
      }
    })();
  },
};
