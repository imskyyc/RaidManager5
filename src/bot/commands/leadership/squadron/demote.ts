import {
    ApplicationCommandOptionBase,
    ChatInputCommandInteraction, Colors,
    EmbedBuilder,
    PermissionFlagsBits,
    SlashCommandUserOption
} from "discord.js";
import { Guardsman } from "index";
import Noblox from "noblox.js";

export default class DeomoteSquadronSubcommand implements ICommand
{
    name: Lowercase<string> = "demote";
    description: string = "Demotes the provided squadron member in the TSA group.";
    defaultMemberPermissions = PermissionFlagsBits.ManageRoles;
    guardsman: Guardsman;
    options?: ApplicationCommandOptionBase[] | undefined = [
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("The user to demote.")
            .setRequired(true)
    ];

    constructor(guardsman: Guardsman)
    {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> 
    {
        const user = interaction.options.getUser("user", true);
        
        let userInfo = await this.guardsman.database<IUser>("users")
            .select("*")
            .where("discord_id", user.id)
            .first();

        if (!userInfo)
        {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Squadron Management")
                        .setDescription(`<@${user.id}> does not have any verification data.`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "RaidManager Database" })
                ]
            })

            return;
        }

        const rankChangeData = await Noblox.demote(15910027, parseInt(userInfo.roblox_id));
        if (rankChangeData.oldRole == rankChangeData.newRole)
        {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Squadron Management")
                        .setDescription(`Unable to demote <@${user.id}>. Are they already the max promotable role?`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "RaidManager API" })
                ]
            })

            return;
        }

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Squadron Management")
                    .setDescription(`Successfully demoted <@${user.id}> to ${rankChangeData.newRole.name}.`)
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({ text: "RaidManager Database" })
            ]
        })
    }
    
}