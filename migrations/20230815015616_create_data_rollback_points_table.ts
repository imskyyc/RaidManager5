import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("data_rollback_points", (table) =>
    {
        table.integer("user_id", 11).notNullable();
        table.string("game_name").notNullable();
        table.text("game_data").notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now(6)).notNullable();
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("data_rollback_points");
}

