import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("events", (table) =>
    {
        table.increments('id');
        table.string("name").notNullable();
        table.string("host").notNullable();
        table.string("type").notNullable();
        table.integer("length").notNullable();
        table.integer("date").notNullable();
        table.text("notes", "LONGTEXT")
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("events");
}

