import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> 
{
    return knex.schema.createTable("users", (table) =>
        {
            /*
                id: number
                username: string
                roblox_id: string
                discord_id: string
                password: string
                remember_token: string
                roles: JSONEncodable<string>
                created_at: Date
                updated_at: Date
            */

            table.increments("id");
            table.string("username").notNullable();
            table.string("roblox_id").notNullable();
            table.string("discord_id").nullable();
            table.string("password").nullable();
            table.string("remember_token").nullable();
            table.string("roles").defaultTo("[]");
            table.timestamps();
        });
}


export async function down(knex: Knex): Promise<void> 
{
    knex.schema.dropTableIfExists("users");
}

