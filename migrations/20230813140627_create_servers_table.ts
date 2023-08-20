import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("servers", (table) =>
    {
        table.string("job_id").primary().notNullable();
        table.string("token", 36).notNullable().unique();
        table.string("game_name").notNullable();
        table.string("place_id").notNullable();
        table.integer("is_vip", 1).notNullable().defaultTo(0);
        table.json("players").notNullable().defaultTo("[]");
        table.timestamp("last_ping").notNullable().defaultTo(knex.fn.now(6));
        table.timestamps();
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("servers");
}