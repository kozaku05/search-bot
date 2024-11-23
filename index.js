const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const dotenv = require("dotenv");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const search = require("./search");
dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const TOKEN = process.env.TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const commands = [
  new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search Google")
    .addStringOption((option) =>
      option.setName("query").setDescription("Search query").setRequired(true)
    ),
].map((command) => command.toJSON());

const rest = new REST({ version: "9" }).setToken(TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });
    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();

client.once("ready", () => {
  console.log("Bot is online!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  const { commandName, options } = interaction;
  if (commandName === "search") {
    const query = options.getString("query");
    const results = await search(query);
    if (!results || results.length === 0) {
      return interaction.reply(`No results found for "${query}".`);
    }
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`Search results for "${query}"`)
      .setDescription(`Found ${results.length} result(s):`);
    results.forEach((item, index) => {
      embed.addFields({
        name: `${index + 1}. ${item.title}`,
        value: `${item.snippet}\n[Link](${item.link})`,
        inline: false,
      });
    });
    return interaction.reply({ embeds: [embed] });
  }
});

client.login(TOKEN);
