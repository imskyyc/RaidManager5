import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("failed_jobs", (table) =>
    {
        table.increments("id");
        table.string("uuid").unique().notNullable();
        table.text("connection").notNullable();
        table.text("queue").notNullable();
        table.text("payload").notNullable();
        table.text("exception").notNullable();
        table.timestamp("failed_at").defaultTo(knex.fn.now(6)).notNullable();
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("failed_jobs");
}

