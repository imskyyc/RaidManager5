import { Guardsman } from "index";
import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    ModalBuilder, PermissionFlagsBits, StringSelectMenuBuilder,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";

export default class ScheduleSubCommand implements ICommand
{
    name: Lowercase<string> = "schedule";
    description: string = "Allows event hosts to schedule raids.";
    guardsman: Guardsman;
    defaultMemberPermissions = PermissionFlagsBits.ManageEvents;

    constructor(guardsman: Guardsman)
    {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const member = interaction.member;
        const modal = new ModalBuilder()
            .setCustomId("scheduler_modal")
            .setTitle("RaidManager Scheduler")

        // components
        const raidNameComponent = new TextInputBuilder()
            .setCustomId("name")
            .setLabel("Name")
            .setValue(`${member.displayName}'s Raid`)
            .setRequired(true)
            .setMaxLength(50)
            .setStyle(TextInputStyle.Short)

        // const raidTypeComponent = new StringSelectMenuBuilder()
        //     .setCustomId("raid_type")
        //     .setOptions(
        //         {
        //             default: true,
        //             description: "A KOG Raid",
        //             label: "Raid",
        //             value: "event"
        //         },
        //
        //         {
        //             description: "A QSO-KOG Training",
        //             label: "Training",
        //             value: "training"
        //         },
        //
        //         {
        //             description: "A KOG Recruit Tryout",
        //             label: "Tryout",
        //             value: "tryout"
        //         },
        //
        //         {
        //             description: "A KOG Promotion Evaluation",
        //             label: "Eval",
        //             value: "eval"
        //         }
        //     )

        const raidTypeComponent = new TextInputBuilder()
            .setCustomId("type")
            .setLabel("Type (event, training, tryout, eval, rally)")
            .setValue(`Raid`)
            .setRequired(true)
            .setMaxLength(8)
            .setStyle(TextInputStyle.Short)

        const raidLengthComponent = new TextInputBuilder()
            .setCustomId("length")
            .setLabel("Length (number of minutes)")
            .setValue("60")
            .setRequired(true)
            .setMaxLength(3)
            .setStyle(TextInputStyle.Short)

        const dateComponent = new TextInputBuilder()
            .setCustomId("date")
            .setLabel("Date (UNIX timestamp)")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)

        const notesComponent = new TextInputBuilder()
            .setCustomId("notes")
            .setLabel("Notes (location, hosts, etc)")
            .setRequired(false)
            .setPlaceholder("None.")
            .setStyle(TextInputStyle.Paragraph)

        const nameRow = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(raidNameComponent);

        const typeSelectRow = new ActionRowBuilder<TextInputBuilder>()
            // .addComponents(raidTypeComponent)
            .addComponents(raidTypeComponent)

        const raidLengthRow = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(raidLengthComponent)

        const dateRow = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(dateComponent)

        const notesRow = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(notesComponent)

        // modal.addComponents(nameRow);
        modal.addComponents(nameRow, typeSelectRow, raidLengthRow, dateRow, notesRow)

        await interaction.showModal(modal);
    }
}