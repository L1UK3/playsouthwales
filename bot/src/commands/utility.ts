import { CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash } from "discordx";

/**
 * Utility slash commands for the Discord bot.
 */
@Discord()
export class UtilityCommands {
    @Slash({ name: "ping", description: "Check bot latency" })
    ping(interaction: CommandInteraction): void {
        const latency = Date.now() - interaction.createdTimestamp;
        interaction.reply({ content: `🏓 Pong! Latency is **${latency}ms**.`, ephemeral: true });
    }

    @Slash({ name: "help", description: "Show bot help" })
    help(interaction: CommandInteraction): void {
        const embed = new EmbedBuilder()
            .setTitle("🎮 Play! South Wales Bot Help")
            .setDescription("Welcome to the community assistant. Below are the available features:")
            .setColor(0x5865F2)
            .addFields(
                { name: "📢 Event Notifications", value: "The bot automatically forwards daily and weekly premier events from the backend to designated channels." },
                { name: "⚡ Slash Commands", value: "`/ping` - Check API and gateway latency\n`/help` - Show this instructions menu" }
            )
            .setFooter({ text: "Play! South Wales" })
            .setTimestamp();

        interaction.reply({ embeds: [embed], ephemeral: true });
    }
}
