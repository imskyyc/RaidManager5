import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("roles", (table) =>
    {
        table.increments('id');
        table.string("name").notNullable();
        table.integer("position", 11).notNullable();
        table.string("permissions").notNullable();
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("roles");
}

