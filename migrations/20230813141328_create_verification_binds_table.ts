import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("verification_binds", (table) =>
    {
        table.increments('id');
        table.string("guild_id").notNullable();
        table.string("role_id").notNullable();
        table.string("role_data").notNullable();
        table.dateTime('created_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
        table.dateTime('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("verification_binds");
}

