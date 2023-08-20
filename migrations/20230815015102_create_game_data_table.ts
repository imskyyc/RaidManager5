import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("game_data", (table) =>
    {
        table.integer("user_id", 11).notNullable();
        table.string("game_name").notNullable();
        table.text("game_data").notNullable();
        table.timestamps();
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("game_data");
}

