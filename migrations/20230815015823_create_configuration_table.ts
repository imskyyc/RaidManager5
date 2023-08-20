import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("configuration", (table) =>
    {
        table.string("guild_id").unique().notNullable();
        table.boolean("verification_enabled").notNullable().defaultTo(true);
        table.text("moderator_roles").notNullable().defaultTo("[]");
        table.text("muterole").notNullable();
        table.timestamps();
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("configuration");
}

