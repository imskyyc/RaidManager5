import { Guardsman } from "index";
import {ChatInputCommandInteraction} from "discord.js";
import * as process from "process";
import { writeFile } from "fs/promises";

export default class PullCommand implements ICommand
{
    name: Lowercase<string> = "reboot";
    description: string = "(DEVELOPER ONLY) Reboots the bot.";
    guardsman: Guardsman;
    developer = true;

    constructor(guardsman: Guardsman)
    {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void>
    {
        const reply = await interaction.reply({
            content: "Rebooting...",
            fetchReply: true
        });

        await writeFile(".rm-rebootfile", JSON.stringify({
            guild: interaction.guild.id,
            channel: interaction.channel?.id,
            message: reply.id
        }))

        process.exit(1);
    }
}