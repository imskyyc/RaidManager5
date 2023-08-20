import { Colors, EmbedBuilder } from "discord.js";
import { Guardsman } from "index";

export default async (guardsman: Guardsman, discordId: string) =>
{
    const interaction = guardsman.bot.pendingVerificationInteractions[discordId];

    const reply = await interaction.editReply({
        components: [],

        embeds: [
        new EmbedBuilder()
            .setTitle(`RaidManager Verification`)
            .setDescription(
                "Discord account verification was successful! Please run `/update` to obtain roles."
            )
            .setColor(Colors.Green)
            .setTimestamp()
            .setFooter({
                text: "RaidManager Verification"
            }),
        ],
    });

    await reply.reply(`<@${interaction.member.id}>`)
}