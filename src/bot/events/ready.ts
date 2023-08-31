import { Guardsman, GuardsmanState } from "../../index.js";
import { ActivityType } from "discord.js";
import { readFile, unlink } from "fs";

export default async (guardsman: Guardsman) =>
{
    guardsman.log.info("RaidManager ready.")
    guardsman.state = GuardsmanState.ONLINE;

    // check for reboot file
    try {
        readFile(".rm-rebootfile", async (err, data) =>
        {
            if (!data) return;

            const rebootData = JSON.parse(data.toString());

            const guild = await guardsman.bot.guilds.fetch(rebootData.guild);
            if (!guild) return;

            const channel = await guild.channels.fetch(rebootData.channel);
            if (!channel || !channel.isTextBased()) return;

            const message = await channel.messages.fetch(rebootData.message);
            if (!message) return;

            message.edit("Reboot complete.");

            unlink(".rm-rebootfile", () => {});
        })
    } catch (error) {}

    guardsman.bot.user?.setPresence({
        status: "online",
        activities: [
            {
                name: `RaidManager 5`,
                type: ActivityType.Playing,
            }
        ]
    })
}