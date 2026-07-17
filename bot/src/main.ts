import { dirname, importx } from "@discordx/importer";
import { IntentsBitField, type Interaction, type Message } from "discord.js";
import { Client } from "discordx";
import http from "node:http";

export const bot = new Client({
    // To use only guild command
    // botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],

    // Discord intents
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.MessageContent,
    ],

    // Debug logs are disabled in silent mode
    silent: false,

    // Configuration for @SimpleCommand
    simpleCommand: {
        prefix: "!",
    },
});

bot.once("ready", () => {
    // Make sure all guilds are cached
    // await bot.guilds.fetch();

    // Synchronize applications commands with Discord
    void bot.initApplicationCommands();

    // To clear all guild commands, uncomment this line,
    // This is useful when moving from guild commands to global commands
    // It must only be executed once
    //
    //  await bot.clearApplicationCommands(
    //    ...bot.guilds.cache.map((g) => g.id)
    //  );

    console.log("Bot started");
});

bot.on("interactionCreate", (interaction: Interaction) => {
    bot.executeInteraction(interaction);
});

bot.on("messageCreate", (message: Message) => {
    void bot.executeCommand(message);
});

async function run() {
    // The following syntax should be used in the commonjs environment
    //
    // await importx(__dirname + "/{events,commands}/**/*.{ts,js}");

    // The following syntax should be used in the ECMAScript environment
    await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

    // Let's start the bot
    if (!process.env.BOT_TOKEN) {
        throw Error("Could not find BOT_TOKEN in your environment");
    }

    // Log in with your bot token
    try {
        await bot.login(process.env.BOT_TOKEN);
    } catch (err) {
        console.error(`[Bot] Failed to connect to Discord: ${(err as Error).message}`);
        console.warn("[Bot] Running bot in offline/mock mode for local development...");
    }

    // Start a lightweight HTTP listener for backend notifications
    const port = process.env.PORT || 5001;
    const server = http.createServer((req, res) => {
        if (req.method === "POST") {
            let body = "";
            req.on("data", (chunk) => {
                body += chunk;
            });
            req.on("end", async () => {
                try {
                    const data = JSON.parse(body);
                    if (req.url === "/api/notify") {
                        if (!data.channelId || !data.message) {
                            res.writeHead(400, { "Content-Type": "application/json" });
                            res.end(JSON.stringify({ error: "Missing channelId or message" }));
                            return;
                        }
                        const channel = await bot.channels.fetch(data.channelId);
                        if (channel && channel.isTextBased() && "send" in channel) {
                            await channel.send(data.message);
                            res.writeHead(200, { "Content-Type": "application/json" });
                            res.end(JSON.stringify({ success: true }));
                        } else {
                            res.writeHead(404, { "Content-Type": "application/json" });
                            res.end(JSON.stringify({ error: "Channel not found or not text-based/sendable" }));
                        }
                    } else if (req.url === "/api/emit") {
                        if (!data.event) {
                            res.writeHead(400, { "Content-Type": "application/json" });
                            res.end(JSON.stringify({ error: "Missing event name" }));
                            return;
                        }
                        bot.emit(data.event, ...(data.args || []));
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ success: true }));
                    } else {
                        res.writeHead(404);
                        res.end();
                    }
                } catch (err) {
                    res.writeHead(500, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: (err as Error).message }));
                }
            });
        } else {
            res.writeHead(404);
            res.end();
        }
    });

    server.listen(port, () => {
        console.log(`[Bot] HTTP notifier listening on port ${port}`);
    });
}

void run();
