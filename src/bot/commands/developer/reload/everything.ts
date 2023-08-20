import { Guardsman } from "index";
import {ChatInputCommandInteraction, Colors, EmbedBuilder} from "discord.js";
import { config as parseEnv } from "dotenv";

export default class ReloadEverythingSubcommand implements ICommand
{
    name: Lowercase<string> = "everything";
    description = "(DEVELOPER ONLY) Reloads all bot components."
    developer = true;

    guardsman: Guardsman;

    constructor(guardsman: Guardsman)
    {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void>
    {
        const environment = parseEnv().parsed || {};
        await interaction.deferReply();

        try
        {
            this.guardsman.environment = environment;
            await this.guardsman.bot.events.load();
            await this.guardsman.bot.commands.push();

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("All components reloaded")
                        .setDescription(`All components have successfully been reloaded.`)
                        .setColor(Colors.Green),
                ],
            });
        }
        catch (error)
        {
            console.log(error);
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Component Reload failed")
                        .setDescription(`One or more components failed to reload. ${error}`)
                        .setColor(Colors.Red),
                ]
            })
        }
    }
}