import { Guardsman } from "index";
import {ChatInputCommandInteraction, EmbedBuilder, Colors} from "discord.js";

export default class MyDataCommand implements ICommand
{
    name: Lowercase<string> = "mydata"
    description: string = "Allows users to see their userdata."
    guardsman: Guardsman;

    constructor(guardsman: Guardsman)
    {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void>
    {
        const member = interaction.member;
        const userData = await this.guardsman.database<StoredUserdata>("userdata")
            .select("*")
            .where("user_id", member.id)
            .first();

        if (!userData)
        {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("RaidManager Userdata")
                        .setDescription("No userdata was found matching your user id. You will be entered into the database upon attending your first event.")
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "RaidManager Database" })
                ]
            })
            return;
        }

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("RaidManager Userdata")
                    .setDescription("Below is your RaidManager Userdata.")
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({ text: "RaidManager Database" })
                    .setFields(
                        {
                            name: "Events Attended",
                            value: `${userData.events_attended}`
                        },

                        {
                            name: "In Squadron",
                            value: `${userData.in_squadron != 0}`
                        },

                        {
                            name: "Attended Squadron Events",
                            value: `${userData.squadron_events_attended}`
                        }
                    )
            ]
        })
    }


}