import { Guardsman } from "index";
import {
    ActionRowBuilder,
    ButtonBuilder, ButtonStyle,
    ChatInputCommandInteraction,
    Colors,
    EmbedBuilder, EmbedField,
    PermissionFlagsBits
} from "discord.js";

export default class ImportEventSubcommand implements ICommand {
    name: Lowercase<string> = "import"
    description: string = "Allows event hosts to import event attendance, either in JSON format or by mentions."
    guardsman: Guardsman;
    defaultMemberPermissions = PermissionFlagsBits.ManageEvents;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void>
    {
        const member = interaction.member;
        const channel = interaction.channel;
        let importData: EventImportData = {};

        if (!channel)
        {
            await interaction.reply("cache miss, please retry.")

            return;
        }

        // render embed
        const baseEmbed = new EmbedBuilder()
            .setTitle("Event Import")
            .setDescription(`
                Please ping the players you wish to add / subtract event logs to / from, in the format: 
                (Point Amount) - @user1,@user2,@user3,...
                
                Example: 2 - @imskyyc,@JustTucky,@tannibus
                
                Example 2: -2 - @imskyyc,@JustTucky,@tannibus
                
                Imported data is shown below:`)
            .setColor(Colors.Yellow)
            .setTimestamp()
            .setFooter({ text: "RaidManager Database - Prompt will expire in 5 minutes." })
        const components = [
            new ActionRowBuilder<ButtonBuilder>()
                .setComponents(
                    new ButtonBuilder()
                        .setCustomId("finalize")
                        .setLabel("Finalize")
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId("reset")
                        .setLabel("Reset")
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId("cancel")
                        .setLabel("Cancel")
                        .setStyle(ButtonStyle.Danger),
                )
        ]
        async function renderEmbed(ignoreComponents?: boolean) {
            const fields: EmbedField[] = [];

            for (const pointValue in importData)
            {
                const pointData = importData[pointValue];
                if (pointData.length == 0) continue;

                fields.push({
                    name: `${pointValue} Event(s)`,
                    value: pointData.map(user => `<@${user}>`).join(", "),
                    inline: false,
                })
            }

            baseEmbed.setFields(...fields)

            await interaction.editReply({
                components: ignoreComponents ? [] : components,
                embeds: [ baseEmbed ]
            })
        }

        // create collector
        const componentCollector = channel.createMessageComponentCollector({
            time: 300_000,
            filter: (interact) => interact.member.id === member.id
        })

        const messageCollector = channel.createMessageCollector({
            time: 300_000,
            filter: (message) => message.author.id === member.id,
        })

        // listen for collector events
        componentCollector.on("collect", async (interact) =>
        {
            switch (interact.customId)
            {
                case "finalize":
                    const fields: EmbedField[] = [];

                    for (const pointValue in importData)
                    {
                        const pointData = importData[pointValue];
                        if (pointData.length == 0) continue;

                        fields.push({
                            name: `${pointValue} Event(s)`,
                            value: pointData.map(user => `<@${user}>`).join(", "),
                            inline: false,
                        })
                    }

                    await renderEmbed(true);

                    const reply = await interact.reply({
                        components: [
                            new ActionRowBuilder<ButtonBuilder>()
                                .setComponents(
                                    new ButtonBuilder()
                                        .setCustomId("submit")
                                        .setLabel("Submit")
                                        .setStyle(ButtonStyle.Success),
                                    new ButtonBuilder()
                                        .setCustomId("cancelSubmit")
                                        .setLabel("Cancel")
                                        .setStyle(ButtonStyle.Danger)
                                )
                        ],
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Event Import")
                                .setDescription("Please confirm the below information is correct.")
                                .setColor(Colors.Yellow)
                                .setTimestamp()
                                .setFooter({ text: "RaidManager Database | Prompt will time out in 30 seconds." })
                                .setFields(...fields)
                        ],

                        fetchReply: true
                    })

                    const confirmationCollector = channel.createMessageComponentCollector({
                        time: 30_000,
                        maxComponents: 1,
                        filter: (confirmation =>
                            confirmation.member.id === member.id && confirmation.message.id == reply.id
                        )
                    });

                    confirmationCollector.on("collect", async (collected) =>
                    {
                        await collected.deferUpdate();
                        await reply.delete();

                        if (collected.customId === "submit") {
                            componentCollector.stop();
                            messageCollector.stop();

                            await interaction.editReply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setTitle("Event Import")
                                        .setDescription("An import request has successfully been sent.")
                                        .setColor(Colors.Green)
                                        .setTimestamp()
                                        .setFooter({text: "RaidManager Database"})
                                        .setFields(...fields)
                                ]
                            })
                        }
                        else
                        {
                            await renderEmbed();
                        }
                    })

                    break;
                case "cancel":
                    componentCollector.stop("cancel");
                    messageCollector.stop();

                    await interact.deferUpdate();

                    break;
                case "reset":
                    importData = {};
                    await renderEmbed();
                    await interact.deferUpdate();

                    break;
            }
        })

        componentCollector.on("end", async (collected, stopReason) =>
        {
            if (collected.size == 0 || stopReason == "cancel")
            {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Event Import")
                            .setDescription("Prompt cancelled or timed out.")
                            .setColor(Colors.Red)
                            .setTimestamp()
                            .setFooter({ text: "RaidManager Database" })
                    ]
                })
            }
        })

        messageCollector.on("collect", async (message) =>
        {
            const messageComponents = message.content.split(" - ")
            const pointValue = parseInt(messageComponents[0]);
            const mentions = message.mentions.users;

            if (!pointValue)
            {
                await message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Event Import")
                            .setDescription("No point value could be parsed. See usage in original prompt.")
                            .setColor(Colors.Red)
                            .setTimestamp()
                            .setFooter({ text: "RaidManager Database" })
                    ]
                })

                return;
            }

            if (!importData[pointValue])
            {
                importData[pointValue] = []
            }

            for (const user of mentions.keys())
            {
                for (const existingValue in importData)
                {
                    const existingData = importData[existingValue];

                    if (existingData.includes(user))
                    {
                        existingData.splice(existingData.indexOf(user), 1)
                    }
                }

                importData[pointValue].push(user)
            }

            await renderEmbed();
        })

        // respond
        await interaction.reply({
            embeds: [ baseEmbed ],
            components
        });


    }
}