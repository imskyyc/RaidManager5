import { Guardsman } from "index";
import {
    ApplicationCommandOptionBase,
    ChatInputCommandInteraction, Colors, EmbedBuilder,
    SlashCommandNumberOption,
    SlashCommandRoleOption
} from "discord.js";

export default class UnbindGamePassSubcommand implements ICommand {
    name: Lowercase<string> = "gamepass";
    description: string = "Allows guild administrators to unbind ROBLOX gamepass data from the guild.";
    guardsman: Guardsman;
    options: ApplicationCommandOptionBase[] = [
        new SlashCommandRoleOption()
            .setName("role")
            .setDescription("The role to unbind from.")
            .setRequired(true),
        new SlashCommandNumberOption()
            .setName("gamepass")
            .setDescription("The ID of the game pass to unbind from.")
            .setRequired(true),
    ];

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const options = interaction.options;
        const guild = interaction.guild;

        const guildRole = options.getRole("role", true);
        const gamepassId = options.getNumber("gamepass", true);

        // validate role settings
        const gamepassRoleBind: RoleData<RoleDataGamePassBind> = {
            type: "group",
            gamepassId: gamepassId
        }

        const existingRole = await this.guardsman.database<IRoleBind>("verification_binds")
            .where({
                guild_id: guild.id,
                role_id: guildRole.id,
                role_data: JSON.stringify(gamepassRoleBind)
            })
            .first();

        if (!existingRole) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Guardsman Database")
                        .setDescription(`A gamepass role bind for <@&${guildRole.id}> with those properties does not exist.`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({text: "Guardsman Database"})
                ]
            });

            return;
        }

        await this.guardsman.database<IRoleBind>("verification_binds")
            .delete()
            .where({
                id: existingRole.id,
                guild_id: existingRole.guild_id,
                role_id: existingRole.role_id,
                role_data: existingRole.role_data,
            })

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Guardsman Database`)
                    .setDescription(`Successfully removed gamepass bind for <@&${guildRole.id}> for gamepass ${gamepassId}.`)
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({text: "Guardsman Database"})
            ]
        })
    }
}