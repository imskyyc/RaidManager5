import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("punishments", (table) =>
    {
        table.string("id", 8);
        table.integer("moderator", 11).notNullable();
        table.integer("user", 11).notNullable();
        table.string("action", 100).notNullable();
        table.string("reason").notNullable();
        table.boolean("active").notNullable();
        table.string("expires");
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("punishments");
}

