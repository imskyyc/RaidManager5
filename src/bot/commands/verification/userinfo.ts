import {
    ChatInputCommandInteraction,
    Colors,
    EmbedBuilder,
    SlashCommandUserOption,
} from "discord.js";
import { Guardsman } from "index";

export default class UserInfoCommand implements ICommand {
    name: Lowercase<string> = "userinfo";
    description = "Shows info about a verified user.";
    guardsman: Guardsman;
    options = [
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("User to get the info for.")
            .setRequired(true),
    ];

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const user = interaction.options.getUser("user", true);

        const existingUserData = await this.guardsman.database<IUser>("users")
            .where("discord_id", user.id)
            .first();

        if (!existingUserData) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Verification")
                        .setDescription(`<@${user.id}> is not verified with Guardsman.`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "Guardsman Verification" })
                ]
            })

            return;
        }

        const Headshot = await this.guardsman.roblox.getPlayerThumbnail(Number(existingUserData.roblox_id), "420x420", "png", false, "headshot");
        const Headshot2 = Headshot[0].imageUrl + ".png";

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("User Info")
                    .addFields([
                        { name: "Roblox Username", value: await this.guardsman.roblox.getUsernameFromId(Number(existingUserData.roblox_id)), inline: true },
                        { name: "Roblox ID", value: existingUserData.roblox_id, inline: true },
                        { name: "Discord ID", value: existingUserData.discord_id, inline: true },
                    ])
                    .setColor(Colors.Green)
                    .setThumbnail(Headshot2)
                    .setTimestamp()
                    .setFooter({ text: "RaidManager Database" })
            ]
        })
    };
}
