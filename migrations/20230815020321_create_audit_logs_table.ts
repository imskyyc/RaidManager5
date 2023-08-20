import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("audit_logs", (table) =>
    {
        table.increments('id');
        table.string("user").notNullable();
        table.string("type").notNullable();
        table.string("action").notNullable();
        table.timestamps();
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("audit_logs");
}

