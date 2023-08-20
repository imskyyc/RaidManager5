import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("api_keys", (table) =>
    {
        table.increments("id");
        table.string("name").notNullable();
        table.integer("user_id").notNullable();
        table.string("scopes").notNullable();
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("api_keys");
}

