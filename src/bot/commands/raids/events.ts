import { Guardsman } from "index";
import {
    ChatInputCommandInteraction,
    Colors,
    EmbedBuilder, SlashCommandBuilder,
    SlashCommandNumberOption,
    SlashCommandStringOption
} from "discord.js";

function firstToUpper(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export default class RaidsCommand implements ICommand
{
    name: Lowercase<string> = "events";
    description: string = "Shows a list of events.";
    guardsman: Guardsman;

    constructor(guardsman: Guardsman)
    {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const events = await this.guardsman.database<IScheduledEvent>("events")
            .select("*");

        const parsedEvents = []
        const typeColors = {
            "tryout": Colors.DarkGold,
            "raid": Colors.Yellow,
            "training": Colors.Blue,
            "eval": Colors.Green,
            "rally": Colors.DarkRed
        }

        const PAGE_SIZE = 5;
        for (const event of events)
        {
            if (parsedEvents.length >= PAGE_SIZE) break;
            if (event.type == "rally" && !this.guardsman.environment.RALLY_ALLOWED_SERVERS.includes(interaction.guild.id)) continue;

            parsedEvents.push(
                new EmbedBuilder()
                    .setTitle(event.name)
                    .setColor(typeColors[event.type])
                    .setTimestamp()
                    .setFooter({ text: "RaidManager Database" })
                    .addFields(
                        {
                            name: "ID",
                            value: `${event.id}`,
                            inline: true
                        },

                        {
                            name: "Host",
                            value: `<@${event.host}>`,
                            inline: true
                        },

                        {
                            name: "Name",
                            value: event.name,
                            inline: true
                        },

                        {
                            name: "Type",
                            value: firstToUpper(event.type),
                            inline: true
                        },

                        {
                            name: "Length",
                            value: `${event.length} Minutes`,
                            inline: true
                        },

                        {
                            name: "Date",
                            value: `<t:${event.date}>`,
                            inline: true,
                        },

                        {
                            name: "Notes",
                            value: event.notes,
                        }
                    )
            )
        }

        if (parsedEvents.length == 0)
        {
            parsedEvents.push(
                new EmbedBuilder()
                    .setTitle("RaidManager Scheduler")
                    .setDescription("No events are scheduled at this time.")
                    .setColor(Colors.Red)
                    .setTimestamp()
                    .setFooter({ text: "RaidManager Database" })
            )
        }

        await interaction.reply({
            embeds: parsedEvents
        })
    }
}