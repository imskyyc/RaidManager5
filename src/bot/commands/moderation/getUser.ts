import { ApplicationCommandOptionBase, ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandUserOption } from "discord.js";
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
        const user = await interaction.options.getUser("user", true);
        const userData = await this.guardsman.database<IUser>("users")
        .where("discord_id", user.id)
        .first();
        
        
    }
    
}