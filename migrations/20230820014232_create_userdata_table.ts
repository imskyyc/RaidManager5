import { Knex } from "knex";
export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("userdata", (table) =>
    {
        table.string("user_id").notNullable().unique();
        table.boolean("in_squadron").notNullable().defaultTo(false);
        table.integer("events_attended").notNullable().defaultTo(0);

        table.integer("squadron_events_attended").notNullable().defaultTo(0);
        table.timestamp("squadron_last_promoted");
        table.json("squadron_medals").notNullable().defaultTo([]);
        table.timestamp("squadron_loa_start_date");

        table.timestamps();
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("userdata");
}

