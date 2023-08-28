import {Colors, EmbedBuilder, Interaction, GuildScheduledEventEntityType, PermissionFlagsBits} from "discord.js";
import { Guardsman } from "index";

function firstToUpper(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export default async (guardsman: Guardsman, interaction: Interaction<"cached">) =>
{
    if (interaction.isChatInputCommand())
    {
        const sentCommand = interaction.commandName;
        const options = interaction.options;
        let command: ICommand | undefined;

        guardsman.bot.commands.list.find(category =>
            {
                command = category.find(com => com.name == sentCommand)
                return command;
            })

        if (!command)
        {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Command Execution Error")
                        .setDescription(`No command was found matching name \`${sentCommand}\`.`)
                        .setColor(Colors.Red)
                ]
            })
        }

        const subCommand = options.getSubcommand(false);
        if (subCommand)
        {
            command = command.subcommands?.find(subCom => subCom.name == subCommand);
        }

        if (!command)
        {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Command Execution Error")
                        .setDescription(`No subcommand was found matching name \`${sentCommand}\`.`)
                        .setColor(Colors.Red)
                ]
            })
        }

        if (command.developer && interaction.member.id != "250805980491808768")
        {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Command Execution Error")
                        .setDescription(`You do not have permission to execute this command.`)
                        .setColor(Colors.Red)
                ]
            })
        }

        if (typeof command.defaultMemberPermissions == "bigint" && !interaction.member.permissions.has(command.defaultMemberPermissions))
        {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Command Execution Error")
                        .setDescription(`You do not have permission to execute this command.`)
                        .setColor(Colors.Red)
                ]
            })
        }

        try
        {
            await command.execute(interaction);
        }
        catch (error)
        {
            const replied = interaction.replied;
            const replyData = {
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Command Execution Error")
                        .setDescription(`${error}`)
                        .setColor(Colors.Red)
                ]
            }

            console.log("errored");

            if (replied)
            {
                return interaction.editReply(replyData)
            }
            else
            {
                return interaction.reply(replyData);
            }
        }
    }

    if (interaction.isModalSubmit())
    {
        if (interaction.customId != "scheduler_modal") return;

        const eventName = interaction.fields.getTextInputValue("name");
        const eventType: any = interaction.fields.getTextInputValue("type");
        const eventLength = interaction.fields.getTextInputValue("length");
        const eventDate = interaction.fields.getTextInputValue("date");
        const eventNotes = interaction.fields.getTextInputValue("notes");

        const eventData: IScheduleEvent = {
            host: interaction.member.id,
            name: eventName,
            type: eventType.toLowerCase(),
            length: parseInt(eventLength),
            date: parseInt(eventDate),
            notes: eventNotes
        }

        if (eventData.notes == "")
        {
            eventData.notes = "None."
        }

        // validate
        const EVENT_TYPES = [
            "raid",
            "training",
            "tryout",
            "eval",
            "rally"
        ]

        if (!EVENT_TYPES.includes(eventData.type))
        {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("RaidManager Scheduler")
                        .setDescription(`${eventData.type} is not a valid event type! Please enter \`raid\`,\`training\`,\`tryout\`,\`eval\`, or \`rally\`.`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "RaidManager Database" })
                ]
            })
        }

        if (eventData.type == "rally" && !guardsman.environment.RALLY_ALLOWED_SERVERS.includes(interaction.guild.id))
        {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("RaidManager Scheduler")
                        .setDescription("This guild is not allowed to schedule rallies.")
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "RaidManager Database" })
                ]
            })
        }

        if (!eventData.length)
        {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("RaidManager Scheduler")
                        .setDescription(`Event length must be a number!`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "RaidManager Database" })
                ]
            })
        }

        if (!eventData.date)
        {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("RaidManager Scheduler")
                        .setDescription(`Event date must be a number!`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "RaidManager Database" })
                ]
            })
        }

        const CURRENT_TIME = Math.floor(Date.now() / 1000);
        if (CURRENT_TIME > eventData.date)
        {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("RaidManager Scheduler")
                        .setDescription(`Event date must be in the future!`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "RaidManager Database" })
                ]
            })
        }

        try
        {
            const raidId = await guardsman.database<IScheduleEvent>("events")
                .insert(eventData);

            const typeColors = {
                "tryout": Colors.DarkGold,
                "raid": Colors.Yellow,
                "training": Colors.Blue,
                "eval": Colors.Green,
                "rally": Colors.DarkRed
            }

            const raidEmbed = new EmbedBuilder()
                .setTitle("RaidManager Scheduler")
                .setDescription(`An event has been scheduled!`)
                .setColor(typeColors[eventData.type])
                .setTimestamp()
                .setFooter({ text: "RaidManager Database" })
                .addFields(
                    {
                        name: "ID",
                        value: `${raidId}`,
                        inline: true
                    },

                    {
                        name: "Host",
                        value: `<@${eventData.host}>`,
                        inline: true
                    },

                    {
                        name: "Name",
                        value: eventData.name,
                        inline: true
                    },

                    {
                        name: "Type",
                        value: firstToUpper(eventData.type),
                        inline: true
                    },

                    {
                        name: "Length",
                        value: `${eventData.length} Minutes`,
                        inline: true
                    },

                    {
                        name: "Date",
                        value: `<t:${eventData.date}>`,
                        inline: true,
                    },

                    {
                        name: "Notes",
                        value: eventData.notes,
                    }
                )

            try
            {
                const channel = guardsman.bot.channels.resolve(
                    guardsman.environment[eventData.type == "rally" && "RALLY_SCHEDULE_CHANNEL" || "EVENT_SCHEDULE_CHANNEL"]
                );
                if (!channel?.isTextBased()) return;
                channel.send({
                    embeds: [ raidEmbed ]
                })
            }
            catch (error)
            {
                await interaction.channel?.send("Failed to send automatic schedule notification. Please send manually.");
            }

            await interaction.guild.scheduledEvents.create({
                name: eventData.name,
                description: `Event Details:
                    **ID**: ${raidId}
                    **Host**: <@${eventData.host}>
                    **Type**: ${firstToUpper(eventData.type)}
                    **Length**: ${eventData.length} Minutes
                    **Date**: <t:${eventData.date}>
                    **Notes**: ${eventData.notes}`,
                scheduledStartTime: (eventData.date * 1000),
                scheduledEndTime: (eventData.date + (eventData.length * 60)) * 1000,
                privacyLevel: 2,
                entityType: GuildScheduledEventEntityType.External,
                entityMetadata: {
                    location: "This server."
                }
            })

            await interaction.reply({
                content: `<@${interaction.member.id}>`,
                embeds: [ raidEmbed ]
            });
        }
        catch (error)
        {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("RaidManager Scheduler")
                        .setDescription(`An error occurred whilst inserting data. ${error}`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "RaidManager Database" })
                ]
            })
        }
    }
}