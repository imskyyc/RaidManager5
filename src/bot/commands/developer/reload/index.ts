import { Guardsman } from "index";
import {ChatInputCommandInteraction} from "discord.js";

export default class ReloadCommand implements ICommand
{
    name: Lowercase<string> = "reload";
    description: string = "(DEVELOPER ONLY) Allows developers to reload individual components of the bot.";
    guardsman: Guardsman;

    constructor(guardsman: Guardsman)
    {
        this.guardsman = guardsman;
    }

    execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        return Promise.resolve(undefined);
    }

}