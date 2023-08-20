import { Guardsman, GuardsmanState } from "../../index.js";
import { ActivityType } from "discord.js";

export default (guardsman: Guardsman) =>
{
    guardsman.log.info("RaidManager ready.")
    guardsman.state = GuardsmanState.ONLINE;

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