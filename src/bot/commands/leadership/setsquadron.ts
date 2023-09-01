import {
    ApplicationCommandOptionBase,
    ChatInputCommandInteraction, Colors,
    EmbedBuilder,
    PermissionFlagsBits,
    SlashCommandUserOption
} from "discord.js";
import { Guardsman } from "index";

export default class SetSquadronCommand implements ICommand
{
    name: Lowercase<string> = "setsquadron";
    description: string = "Toggles squadron status for the provided user.";
    defaultMemberPermissions = PermissionFlagsBits.ModerateMembers;
    guardsman: Guardsman;
    options?: ApplicationCommandOptionBase[] | undefined = [
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("The user to toggle squadron status on")
            .setRequired(true)
    ];

    constructor(guardsman: Guardsman)
    {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> 
    {
        const user = interaction.options.getUser("user", true);
        
        let userData = await this.guardsman.database<StoredUserdata>("userdata")
            .select("*")
            .where("user_id", user.id)
            .first();

        if (!userData)
        {
            userData = {
                user_id: user.id,
                in_squadron: 1,
                events_attended: 0,
                squadron_events_attended: 0,
                squadron_last_promoted: undefined,
                squadron_medals: "[]",
                squadron_loa_start_date: undefined,
                created_at: new Date(),
                updated_at: new Date()
            }

            await this.guardsman.database<Userdata>("userdata")
                .insert(userData);
        }
        else
        {
            userData.in_squadron = (userData.in_squadron == 1 ? 0 : 1);
            await this.guardsman.database<Userdata>("userdata")
                .update("in_squadron", userData.in_squadron)
                .where("user_id", user.id);
        }

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("RaidManager Userdata")
                    .setDescription(`Squadron status for <@${user.id}> toggled to ${userData.in_squadron == 1}.`)
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({ text: "RaidManager Database" })
            ]
        })
    }
    
}