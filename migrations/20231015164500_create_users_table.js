export const up = function(knex) {
    return knex.schema.createTable('users', function(table) {
        table.increments('id').primary();
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
    });
};

export const down = function(knex) {
    return knex.schema.dropTable('users');
};
