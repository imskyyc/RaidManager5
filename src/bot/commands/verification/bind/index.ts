import { Guardsman } from "index";
import {ChatInputCommandInteraction} from "discord.js";

export default class BindCommand implements ICommand
{
    name: Lowercase<string> = "bind";
    description: string = "Allowed guild administrators to bind ROBLOX data to the guild for users to obtain roles.";
    guardsman: Guardsman;

    constructor(guardsman: Guardsman)
    {
        this.guardsman = guardsman;
    }

    execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        return Promise.resolve(undefined);
    }
}