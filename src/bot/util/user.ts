import { Guild, GuildMember } from "discord.js";
import { Guardsman } from "../../index.js";
import axios from "axios";

async function updateUser(guardsman: Guardsman, guild: Guild, member: GuildMember, existingUserData: IUser) {
    const verificationBinds = await guardsman.database<IRoleBind>("verification_binds")
        .where("guild_id", guild.id);

    const roleCache: { [groupId: number]: number } = {};
    const allowedRoles: IRoleBind[] = [];
    const addedRoles: IRoleBind[] = [];
    const removedRoles: IRoleBind[] = [];
    const errors: string[] = [];

    // parse allowed roles
    for (const verificationBind of verificationBinds) {
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
                        userRank = await guardsman.roblox.getRankInGroup(groupId, parseInt(existingUserData.roblox_id));
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
                    const canAddRole = member.roles.resolve(verificationBind.role_id)
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
    //console.log(member.roles.cache)
    for (const role of member.roles.cache.keys()) {
        const isBoundRole = (verificationBinds.find(r => r.role_id == role && r.guild_id == guild.id)) != null
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
        const userRole = member.roles.resolve(removedRole.role_id);
        if (userRole) {
            try {
                await member.roles.remove(removedRole.role_id);
            }
            catch (error: any) {
                errors.push(error);
            }
        }
    }

    // add roles
    for (const allowedRole of allowedRoles) {
        const userRole = member.roles.resolve(allowedRole.role_id);
        if (!userRole) {
            const guildRole = guild.roles.resolve(allowedRole.role_id);
            if (!guildRole) {
                errors.push(`Failed to find role for bind ${allowedRole.id}`);
                continue;
            }

            try {
                await member.roles.add(guildRole);

                addedRoles.push({
                    id: -1,
                    guild_id: guild.id,
                    role_data: "",
                    role_id: guildRole.id,
                })
            }
            catch (error: any) {
                errors.push(error);
            }
        }
    }

    // Set nickname
    try {
        await member.setNickname(existingUserData.username);
    } catch (error) {
        errors.push(`Failed to set member nickname: ${error}`);
    }

    return { addedRoles, removedRoles, errors };
}

export {
    updateUser
}