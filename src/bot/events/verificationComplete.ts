import { Colors, EmbedBuilder } from "discord.js";
import { Guardsman } from "index";

export default async (guardsman: Guardsman, discordId: string) =>
{
    try {
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
    } catch (error) {}

    //await reply.reply(`<@${interaction.member.id}>`) --//Because it is already replied to?
}