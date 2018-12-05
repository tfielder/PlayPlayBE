
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('songs', function(table) {
      table.increments('id').primary();
      table.string('name');
      table.string('artist_name');
      table.string('genre');
      table.integer('song_rating');

      table.timestamps(true, true);
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('songs')
  ]);
};