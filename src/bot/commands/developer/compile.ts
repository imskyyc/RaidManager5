import { Guardsman } from "index";
import {ChatInputCommandInteraction} from "discord.js";
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

        exec("npm run build", async (error, _1, _2) =>
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