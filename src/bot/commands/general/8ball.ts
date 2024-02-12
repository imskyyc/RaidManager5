import { ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandStringOption } from "discord.js";
import { Guardsman } from "index";

export default class EightBallCommand implements ICommand {
    name: Lowercase<string> = "8ball";
    description: string = "A magic 8 ball for you to ask questions to.";
    guardsman: Guardsman;
    options = [
        new SlashCommandStringOption()
            .setName("question")
            .setDescription("A question to ask the magic 8 ball.")
            .setRequired(true)
    ]

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const question = interaction.options.getString("question", true);

        if (question.length > 500) {
            interaction.reply({ content: "**You Are Not Allowed To Go Over 500 Characters!**", ephemeral: true });
            return;
        }

        const replies = ["Yes.", "No.", "Ask again later.", "Maybe.", "Yes and definitely.", "It is certain.", "As I see it, yes.", "Very doubtful.", "Eh I will say yes to that.", "NO!", "Never.", "Nope."];

        const result = Math.floor(Math.random() * replies.length);

        const ballembed = new EmbedBuilder()
            .setTitle("Magic 8 Ball!")
            .setColor(Colors.Green)
            .addFields(
                { name: "Question", value: question },
                { name: "Answer", value: replies[result] }
            )
            .setTimestamp()
            .setFooter({ text: "RaidManager" });

        await interaction.reply({ embeds: [ballembed] });
    }
}