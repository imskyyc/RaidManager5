import { Guardsman } from "index";
import {ChatInputCommandInteraction, SlashCommandNumberOption, SlashCommandStringOption} from "discord.js";
import { exec } from "child_process";

export default class PullCommand implements ICommand
{
    name: Lowercase<string> = "compile";
    description: string = "(DEVELOPER ONLY) Compiles the latest app code.";
    guardsman: Guardsman;
    developer = true;

    constructor(guardsman: Guardsman)
    {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void>
    {
        await interaction.reply("Compiling...");

        exec("rm -rf ./build && tsc && mkdir ./build/api/middleware", async (error, stdout, stderr) =>
        {
            if (error)
            {
                await interaction.editReply(`Compile failed: ${error}`);

                return;
            }

            await interaction.editReply("Compiled!");
        })
    }
}