import {
    ChatInputCommandInteraction,
    Colors,
    EmbedBuilder,
    PermissionFlagsBits
} from "discord.js";
import { Guardsman } from "index";
import Noblox from "noblox.js";
import axios from "axios";

export default class UpdateAllCommand implements ICommand {
    name: Lowercase<string> = "updateall";
    description: string = "Allows guild administrators to update all members of a guild.";
    guardsman: Guardsman;
    defaultMemberPermissions = PermissionFlagsBits.Administrator;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const guild = interaction.guild;

        const guildData = await this.guardsman.database<IRoleBind>("verification_binds")
            .where("guild_id", guild.id);

        if (!guildData) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setTitle("Update All")
                        .setDescription(`Update all failed to due guild data being empty (for guild_id ${guild.id}).`)
                ]
            })

            return;
        };

        const guildMembers = await guild.members.list({ limit: 1000 })

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Orange)
                    .setTitle("Verify All")
                    .setDescription(`Updating all guild members. This may take some time.`)
            ]
        })

        for (const guildMember of Array.from(guildMembers.values())) {

            const existingUserData = await this.guardsman.database<IUser>("users")
                .where("discord_id", guildMember.id)
                .first();

            if (!existingUserData) continue;

            const roleCache: { [groupId: number]: number } = {};
            const allowedRoles: IRoleBind[] = [];
            const removedRoles: IRoleBind[] = [];
            const errors: string[] = [];

            // parse allowed roles
            for (const verificationBind of guildData) {
                const bindData: RoleData<any> = JSON.parse(verificationBind.role_data);

                const type = bindData.type;
                try {
                    switch (type) {
                        case "group":
                            const groupId = bindData.groupId;
                            const minimumRank = bindData.minRank;
                            const maxRank = bindData.maxRank;

                            let userRank = roleCache[groupId];
                            if (!userRank) {
                                userRank = await Noblox.getRankInGroup(groupId, parseInt(existingUserData.roblox_id));
                                roleCache[groupId] = userRank;
                            }

                            if (userRank >= minimumRank && userRank <= maxRank) {
                                allowedRoles.push(verificationBind);
                            }

                            break;
                        case "user":
                            const userId = bindData.userId;

                            if (userId == existingUserData.roblox_id || userId == existingUserData.discord_id) {
                                allowedRoles.push(verificationBind);
                            }

                            break;
                        case "gamepass":
                            const gamepassId = bindData.gamepassId;
                            let userOwnsGamepass = false;

                            try {
                                const apiUrl = `https://inventory.roblox.com/v1/users/${existingUserData.roblox_id}/items/1/${gamepassId}/is-owned`
                                const returnedApiData = await axios.get(apiUrl);
                                userOwnsGamepass = returnedApiData.data == "true";
                            } catch (error: any) {
                                errors.push(error);
                            }

                            if (userOwnsGamepass) {
                                allowedRoles.push(verificationBind);
                            }

                            break;
                        case "role":
                            const canAddRole = guildMember.roles.resolve(verificationBind.role_id)
                                || allowedRoles.find(role => role.role_id == verificationBind.role_id);

                            if (canAddRole != null) {
                                allowedRoles.push(verificationBind);
                            }

                            break;
                        default:
                            errors.push(`Unknown bind type ${type}. Please contact a guild administrator.`);
                    }
                } catch (error) {
                    errors.push(`Failed to apply a role. ${error}`);
                }
            }

            // scan user's current roles and verify they are allowed to have them
            //console.log(guildMember.roles.cache)
            for (const role of guildMember.roles.cache.keys()) {
                const isBoundRole = (guildData.find(r => r.role_id == role && r.guild_id == guild.id)) != null
                const allowedRole = allowedRoles.find(r => r.role_id == role);

                if (!allowedRole && isBoundRole) {
                    removedRoles.push({
                        id: -1,
                        guild_id: guild.id,
                        role_data: "",
                        role_id: role,
                    })
                }
            }

            // ensure no allowed roles are in the removedRoles list
            for (const removedRole of removedRoles) {
                if (allowedRoles.includes(removedRole)) {
                    removedRoles.splice(removedRoles.indexOf(removedRole), 1);
                }
            }

            // remove roles
            for (const removedRole of removedRoles) {
                const userRole = guildMember.roles.resolve(removedRole.role_id);
                if (userRole) {
                    try {
                        await guildMember.roles.remove(removedRole.role_id);
                    }
                    catch (error: any) {
                        errors.push(error);
                    }
                }
            }

            // add roles
            for (const allowedRole of allowedRoles) {
                const userRole = guildMember.roles.resolve(allowedRole.role_id);
                if (!userRole) {
                    const guildRole = guild.roles.resolve(allowedRole.role_id);
                    if (!guildRole) {
                        errors.push(`Failed to find role for bind ${allowedRole.id}`);
                        continue;
                    }

                    try {
                        await guildMember.roles.add(guildRole);
                    }
                    catch (error: any) {
                        errors.push(error);
                    }
                }
            }

            // Set nickname
            try {
                await guildMember.setNickname(existingUserData.username);
            } catch (error) {
                errors.push(`Failed to set member nickname: ${error}`);
            }

            await interaction.channel?.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor((errors.length > 0 && Colors.Orange) || Colors.Green)
                        .setTitle("User Update")
                        .setDescription(`Update for <@${guildMember.id}> successful. ${errors.join("\n")}`)
                ]
            })
        }

        await new Promise((resolve) => {
            setTimeout(resolve, 5_000)
        })
    }
}