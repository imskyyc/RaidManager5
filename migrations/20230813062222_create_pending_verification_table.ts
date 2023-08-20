import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("pending_verification", (table) =>
    {
        table.string("discord_id").notNullable();
        table.string("token").notNullable();
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("pending_verification");
}

