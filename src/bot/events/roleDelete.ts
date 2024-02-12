import { Guardsman } from "index";
import { Role } from "discord.js";

export default async (guardsman: Guardsman, role: Role) => {
    try {
        guardsman.database<IRoleBind>("verification_binds")
            .delete("*")
            .where({
                role_id: role.id
            })
    } catch (error) { }
}