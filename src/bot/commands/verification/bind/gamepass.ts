import { Guardsman } from "index";
import {
    ApplicationCommandOptionBase,
    ChatInputCommandInteraction, Colors, EmbedBuilder,
    SlashCommandNumberOption,
    SlashCommandRoleOption
} from "discord.js";

export default class BindGamePassSubcommand implements ICommand {
    name: Lowercase<string> = "gamepass";
    description: string = "Allows guild administrators to bind ROBLOX gamepass data to the guild for users to obtain roles.";
    guardsman: Guardsman;
    options: ApplicationCommandOptionBase[] = [
        new SlashCommandRoleOption()
            .setName("role")
            .setDescription("The role to bind to.")
            .setRequired(true),
        new SlashCommandNumberOption()
            .setName("gamepass")
            .setDescription("The ID of the game pass to bind to.")
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

        if (existingRole) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("RaidManager Database")
                        .setDescription(`A gamepass role bind for <@&${guildRole.id}> with those properties already exists.`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({text: "RaidManager Database"})
                ]
            });

            return;
        }

        await this.guardsman.database<IRoleBind>("verification_binds")
            .insert({
                guild_id: guild.id,
                role_id: guildRole.id,
                role_data: JSON.stringify(gamepassRoleBind)
            });

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`RaidManager Database`)
                    .setDescription(`Successfully added a gamepass bind for <@&${guildRole.id}> for gamepass ${gamepassId}.`)
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({text: "RaidManager Database"})
            ]
        })
    }
}