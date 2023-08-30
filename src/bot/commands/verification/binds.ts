import {
    ChatInputCommandInteraction,
    Colors,
    EmbedBuilder, PermissionFlagsBits,
} from "discord.js";
import { Guardsman } from "index";

export default class BindsCommand implements ICommand
{
    name: Lowercase<string> = "binds";
    description = "Allows guild managers to view the list of role binds for this guild.";
    defaultMemberPermissions = PermissionFlagsBits.ManageRoles;

    guardsman: Guardsman;

    constructor(guardsman: Guardsman)
    {
        this.guardsman = guardsman;
    }

    async execute (interaction: ChatInputCommandInteraction<"cached">) : Promise<void>
    {
        const guild = interaction.guild;
        const bindData = await this.guardsman.database<IRoleBind>(
            "verification_binds"
        )
            .select("*")
            .where("guild_id", guild.id);

        const binds: Array<string> = [];

        for (const bind of bindData) {
            const roleData = JSON.parse(bind.role_data);
            let roleDataString = "";

            for (const index in roleData) {
                const value = roleData[index];

                roleDataString = roleDataString + `${index}: ${value}\n  `;
            }

            binds.push(`• ${bind.id}
          Role: <@&${bind.role_id}>,
          ${roleDataString}`);
        }

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(
                        `Guardsman Role binds for ${guild.name}`
                    )
                    .setDescription(binds.join("\n"))
                    .setColor(Colors.Green),
            ],
        });
    };
}
