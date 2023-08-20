import { Guardsman } from "index";
import {ChatInputCommandInteraction, SlashCommandNumberOption, SlashCommandStringOption} from "discord.js";

export default class EvalCommand implements ICommand
{
    name: Lowercase<string> = "event";
    description: string = "Allows event hosts to schedule events.";
    guardsman: Guardsman;

    constructor(guardsman: Guardsman)
    {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        return Promise.resolve(undefined);
    }
}