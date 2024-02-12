import {
    ChatInputCommandInteraction,
    Colors,
    EmbedBuilder,
    PermissionFlagsBits,
    SlashCommandUserOption
} from "discord.js";
import { Guardsman } from "index";
import { updateUser } from "../../util/user.js"

export default class UpdateCommand implements ICommand {
    name: Lowercase<string> = "forceupdate";
    description: string = "Allows guild admins to force update a user's Discord roles.";
    guardsman: Guardsman;
    defaultMemberPermissions = PermissionFlagsBits.ModerateMembers

    options = [
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("The user to update.")
            .setRequired(true)
    ]

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const guild = interaction.guild;

        const user = interaction.options.getUser("user", true);
        const guildMember = interaction.guild.members.resolve(user.id);

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

        if (!guildMember) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Verification")
                        .setDescription(`<@${user.id}> is not a member of this guild.`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "Guardsman Verification" })
                ]
            })

            return;
        }

        let userReturn = await updateUser(this.guardsman, guild, guildMember, existingUserData);

        let InfoEmbed = new EmbedBuilder()
            .setTitle("Guardsman Verification")
            .setDescription(`Role update complete. See details below.`)
            .setColor(userReturn.errors.length > 0 && Colors.Orange || Colors.Green)
            .setTimestamp()
            .setFooter({ text: "Guardsman Verification" })
            .addFields(
                {
                    name: "Added Roles",
                    value: `${userReturn.addedRoles.length > 0 && "• " || "None."}${userReturn.addedRoles.map(r => "<@&" + r.role_id + '>').join("\n • ")}`
                },

                {
                    name: "Removed Roles",
                    value: `${userReturn.removedRoles.length > 0 && "• " || "None."}${userReturn.removedRoles.map(r => "<@&" + r.role_id + '>').join("\n •")}`
                }
            );

        if (userReturn.errors.length > 0) {
            InfoEmbed.addFields({
                name: "Errors",
                value: userReturn.errors.join("\n")
            });
        }

        await interaction.reply({
            embeds: [InfoEmbed]
        })
    }
}