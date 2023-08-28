import { Guardsman } from "index";
import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    Colors,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";

export default class SetRequestChannel implements ICommand
{
    name: Lowercase<string> = "setrequestchannel"
    description: string = "Sets the current channel as the channel where import requests are sent."
    guardsman: Guardsman

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const channel = interaction.channel;
        if (!channel)
        {
            await interaction.reply("channel cache miss, please retry")
            return;
        }

        const currentRequestChannel = await this.guardsman.database<StoredChannelConfiguration>
            ("channel_configuration")
            .where({
                guild_id: interaction.guild.id,
                setting: "IMPORT_REQUESTS"
            })
            .first()

        const setChannelConfiguration = async () =>
        {
            await this.guardsman.database<ChannelConfiguration>("channel_configuration")
                .insert({
                    guild_id: interaction.guild.id,
                    channel_id: channel.id,
                    setting: "IMPORT_REQUESTS"
                })
        }

        if (currentRequestChannel)
        {
            const componentCollector = channel.createMessageComponentCollector({
                time: 30_000,
                maxComponents: 1,
                filter: (interact) => interact.member.id === interaction.member.id
            })

            componentCollector.on("collect", async (collected) =>
            {
                await collected.deferUpdate();

                if (collected.customId === "confirm")
                {
                    await setChannelConfiguration();

                    await interaction.editReply({
                        components: [],
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Channel Configuration")
                                .setDescription(`Successfully set <#${channel.id}> as the event import requests channel.`)
                                .setColor(Colors.Green)
                                .setTimestamp()
                                .setFooter({ text: "RaidManager Database" })
                        ]
                    })
                }
                else
                {
                    await interaction.editReply({
                        components: [],
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Channel Configuration")
                                .setDescription("Prompt cancelled.")
                                .setColor(Colors.Red)
                                .setTimestamp()
                                .setFooter({ text: "RaidManager Database" })
                        ]
                    })
                }
            })

            componentCollector.on("end", async (collected) =>
            {
                if (collected.size == 0)
                {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Channel Configuration")
                                .setDescription("Prompt timed out.")
                                .setColor(Colors.Red)
                                .setTimestamp()
                                .setFooter({ text: "RaidManager Database" })
                        ]
                    })
                }
            })

            await interaction.reply({
                components: [
                    new ActionRowBuilder<ButtonBuilder>()
                        .setComponents(
                            new ButtonBuilder()
                                .setCustomId("confirm")
                                .setLabel("Confirm")
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId("cancel")
                                .setLabel("Cancel")
                                .setStyle(ButtonStyle.Danger)
                        )
                ],

                embeds: [
                    new EmbedBuilder()
                        .setTitle("Channel Configuration")
                        .setDescription(`A channel is already configured to have import requests sent to it (<#${currentRequestChannel.channel_id}>). Do you want to replace it?`)
                        .setColor(Colors.Yellow)
                        .setTimestamp()
                        .setFooter({ text: "RaidManager Database" })
                ]
            })
        }
        else
        {
            await setChannelConfiguration();

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Channel Configuration")
                        .setDescription(`Successfully set <#${channel.id}> as the event import requests channel.`)
                        .setColor(Colors.Green)
                        .setTimestamp()
                        .setFooter({ text: "RaidManager Database" })
                ]
            })
        }
    }
}