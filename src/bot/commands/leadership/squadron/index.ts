import {Guardsman} from "index";
import {ChatInputCommandInteraction} from "discord.js";

export default class SquadronCommand implements ICommand {
    name: Lowercase<string> = "squadron"
    description: string = "Squadron subcommands."
    guardsman: Guardsman;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void>
    {
        throw new Error("Method not implemented.");
    }
}