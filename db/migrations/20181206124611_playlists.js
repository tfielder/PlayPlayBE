
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('playlists', function(table) {
      table.increments('id').primary();
      table.string('playlist_name');

      table.timestamps(true, true);
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('playlists')
  ]);
};
