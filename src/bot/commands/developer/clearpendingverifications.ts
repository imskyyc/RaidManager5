import { Guardsman } from "index";
import {ChatInputCommandInteraction} from "discord.js";

export default class ClearPendingVerifications implements ICommand
{
    name: Lowercase<string> = "clearpendingverifications";
    description: string = "(DEVELOPER ONLY) Clears all in-progress verification tokens.";
    guardsman: Guardsman;
    developer = true;

    constructor(guardsman: Guardsman)
    {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void>
    {
        await interaction.reply("Clearing...")

        this.guardsman.database<IVerificationConfirmation>("pending_verification")
            .delete();

        await interaction.editReply("Cleared!")
    }
}