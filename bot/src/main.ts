import { dirname, importx } from "@discordx/importer";
import { IntentsBitField, type Interaction, type Message } from "discord.js";
import { Client } from "discordx";

import { connectDiscord } from "./services/discord.js";
import { startHttpServer } from "./services/notifier.js";

export const bot = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.MessageContent,
    ],
    silent: false,
    simpleCommand: {
        prefix: "!",
    },
});

bot.once("ready", () => {
    void bot.initApplicationCommands();
    console.log("Bot started");
});

bot.on("interactionCreate", (interaction: Interaction) => {
    bot.executeInteraction(interaction);
});

bot.on("messageCreate", (message: Message) => {
    void bot.executeCommand(message);
});

async function run() {
    await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);
    await connectDiscord(bot);
    startHttpServer(bot);
}

void run();
