import { Client, Collection, Intents } from "discord.js";
import { readdirSync } from "fs";

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
});

export const initializeBot = async () => {
  // Load events
  const eventFiles = readdirSync(`${__dirname}/../events`).filter(
    (file) => file.endsWith(".ts") || file.endsWith(".js")
  );

  for await (const file of eventFiles) {
    const event = (await import(`${__dirname}/../events/${file}`)).default;
    if (event.once) {
      client.once(event.name, (...args) => event.execute(client, ...args));
    } else {
      client.on(event.name, (...args) => event.execute(client, ...args));
    }
  }

  // Load commands
  client.commands = new Collection();
  const commandFiles = readdirSync(`${__dirname}/../commands`).filter(
    (file) => file.endsWith(".ts") || file.endsWith(".js")
  );
  for await (const file of commandFiles) {
    const command = await import(`${__dirname}/../commands/${file}`);
    client.commands.set(command.default.data.name, command);
  }

  // Initialize client
  client.login(process.env.DISCORD_BOT_TOKEN);
};
