import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Guardsman } from "index";

export default class PingCommand implements ICommand {
    name: Lowercase<string> = "ping";
    description: string = "Shows the ping of the bot.";
    guardsman: Guardsman;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const embed = new EmbedBuilder().setDescription("`Pinging...`").setColor("#3498db");
        const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
        const timestamp = interaction.createdTimestamp;
        const latency = `\`\`\`ini\n[ ${Math.floor(msg.createdTimestamp - timestamp)}ms ]\`\`\``;
        const apiLatency = `\`\`\`ini\n[ ${Math.round(interaction.client.ws.ping)}ms ]\`\`\``;
        embed
            .setTitle(`Pong! 🏓`)
            .setDescription(null)
            .addFields([
                { name: "Latency", value: latency, inline: true },
                { name: "API Latency", value: apiLatency, inline: true },
            ])
            .setTimestamp()
            .setFooter({ text: "RaidManager" });
        msg.edit({ embeds: [embed] });
    }
}