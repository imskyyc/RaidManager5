import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("personal_access_tokens", (table) =>
    {
        table.increments('id');
        table.string('tokenable_type').notNullable();
        table.string('tokenable_id').notNullable();
        table.string('name').notNullable();
        table.string('token', 64).notNullable().unique();
        table.text('abilities').nullable();
        table.timestamp("last_used_at").nullable();
        table.timestamp("expires_at").nullable();
        table.timestamps();

        table.index(["tokenable_type", "tokenable_id"], "personal_access_tokens_tokenable_type_tokenable_id_index");
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("personal_access_tokens");
}

