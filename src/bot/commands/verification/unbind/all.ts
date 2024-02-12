import { Guardsman } from "index";
import { ChatInputCommandInteraction, Colors, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export default class UnbindAllSubcommand implements ICommand {
    name: Lowercase<string> = "all";
    description: string = "Unbinds all binds in a guild.";
    guardsman: Guardsman;
    defaultMemberPermissions = PermissionFlagsBits.ManageRoles;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const guild = interaction.guild;

        const binds = await this.guardsman.database<IRoleBind>("verification_binds")
            .select("*")
            .where({
                guild_id: guild.id
            })

        if (binds.length === 0) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Guardsman Database`)
                        .setDescription(`There are no binds in this guild.`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "Guardsman Database" })
                ]
            })

            return;
        }

        const ConfEmbed = await interaction.reply({
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel("Cancel")
                            .setCustomId("cancel")
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setLabel("Confirm")
                            .setCustomId("confirm")
                            .setStyle(ButtonStyle.Success),
                    )
            ],

            embeds: [
                new EmbedBuilder()
                    .setTitle(`Guardsman Database`)
                    .setDescription(`Are you sure you want to unbind all binds in this guild?`)
                    .setColor(Colors.Yellow)
                    .setTimestamp()
                    .setFooter({ text: "Guardsman Database" })
            ]
        })

        const collector = ConfEmbed.createMessageComponentCollector({
            time: 60_000,
            filter: (interact) => {
                if (interact.member.id === interaction.member.id) {
                    return true;
                }

                interact.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Guardsman Database")
                            .setColor(Colors.Red)
                            .setDescription("You cannot use this button!")
                            .setTimestamp()
                            .setFooter({ text: "Guardsman Database" })
                    ],
                    ephemeral: true
                })

                return false;
            }
        })

        collector.on("collect", async (collected) => {
            switch (collected.customId) {
                case "confirm":
                    await this.guardsman.database<IRoleBind>("verification_binds")
                        .delete("*")
                        .where({
                            guild_id: guild.id,
                        })

                    await collected.update({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(`Guardsman Database`)
                                .setDescription(`Successfully unbound all binds in this guild.`)
                                .setColor(Colors.Green)
                                .setTimestamp()
                                .setFooter({ text: "Guardsman Database" })
                        ]
                    })

                    break;
                case "cancel":
                    await collected.update({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(`Guardsman Database`)
                                .setDescription(`Cancelled the binds deletion.`)
                                .setColor(Colors.Green)
                                .setTimestamp()
                                .setFooter({ text: "Guardsman Database" })
                        ]
                    })

                    break;
            }

            collector.stop();
        })

        collector.on("end", (collected, reason) => {
            if (reason === "time") {
                interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`Guardsman Database`)
                            .setDescription(`This interaction has timed out.`)
                            .setColor(Colors.Orange)
                            .setTimestamp()
                            .setFooter({ text: "Guardsman Database" })
                    ],
                    components: []
                }).catch(() => { });
            }

            interaction.editReply({
                components: []
            }).catch(() => { });
        });
    }
}