import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("channel_configuration", (table) =>
    {
        table.increments('id');
        table.string("guild_id").notNullable();
        table.string("channel_id").notNullable();
        table.string("setting").notNullable();
        table.dateTime('created_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
        table.dateTime('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("channel_configuration");
}

