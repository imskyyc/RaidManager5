import { Guardsman } from "index";
import {ChatInputCommandInteraction} from "discord.js";

export default class UnbindCommand implements ICommand
{
    name: Lowercase<string> = "unbind";
    description: string = "Allowed guild administrators to unbind ROBLOX data from the guild.";
    guardsman: Guardsman;

    constructor(guardsman: Guardsman)
    {
        this.guardsman = guardsman;
    }

    execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        return Promise.resolve(undefined);
    }
}