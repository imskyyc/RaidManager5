import {
    ApplicationCommandOptionBase,
    ChatInputCommandInteraction, Colors,
    EmbedBuilder,
    PermissionFlagsBits,
    SlashCommandUserOption
} from "discord.js";
import { Guardsman } from "index";

export default class GetUserCommand implements ICommand
{
    name: Lowercase<string> = "getuser";
    description: string = "Returns a user's data";
    defaultMemberPermissions = PermissionFlagsBits.ModerateMembers;
    guardsman: Guardsman;
    options?: ApplicationCommandOptionBase[] | undefined = [
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("The user to return")
            .setRequired(true)
    ];

    constructor(guardsman: Guardsman)
    {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> 
    {
        const user = interaction.options.getUser("user", true);
        const userInfo = await this.guardsman.database<IUser>("users")
            .select("*")
            .where("discord_id", user.id)
            .first();
        
        let userData = await this.guardsman.database<StoredUserdata>("userdata")
            .select("*")
            .where("user_id", user.id)
            .first();

        if (!userInfo)
        {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("RaidManager Userdata")
                        .setDescription(`<@${user.id}> does not have any RaidManager data.`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "RaidManager Database" })
                ]
            });

            return;
        }

        if (!userData)
        {
            userData = {
                user_id: user.id,
                in_squadron: 0,
                events_attended: 0,
                squadron_events_attended: 0,
                squadron_last_promoted: undefined,
                squadron_medals: "[]",
                squadron_loa_start_date: undefined,
                created_at: new Date(),
                updated_at: new Date()
            }
        }

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("RaidManager Userdata")
                    .setDescription("Below is your RaidManager Userdata.")
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({ text: "RaidManager Database" })
                    .setFields(
                        {
                            name: "Id",
                            value: `${userInfo.id}`,
                            inline: true
                        },

                        {
                            name: "Username",
                            value: `${userInfo.username}`,
                            inline: true
                        },

                        {
                            name: "Roblox Id",
                            value: `${userInfo.roblox_id}`,
                            inline: true
                        },

                        {
                            name: "Discord Id",
                            value: `${userInfo.discord_id}`,
                            inline: true
                        },

                        {
                            name: "Events Attended",
                            value: `${userData.events_attended}`,
                            inline: true
                        },

                        {
                            name: "In Squadron",
                            value: `${userData.in_squadron != 0}`,
                            inline: true
                        },

                        {
                            name: "Attended Squadron Events",
                            value: `${userData.squadron_events_attended}`,
                            inline: true
                        },

                        {
                            name: "Last Squadron Promotion",
                            value: `${userData.squadron_last_promoted?.toString() || "None."}`,
                            inline: true
                        },

                        {
                            name: "Squadron Medals",
                            value: `${JSON.parse(userData.squadron_medals).join(", ")}`,
                            inline: true
                        },

                        {
                            name: "Squadron LoA Start Date",
                            value: `${userData.squadron_loa_start_date?.toString() || "Not on LoA."}`,
                            inline: true
                        }
                    )
            ]
        })
    }
    
}