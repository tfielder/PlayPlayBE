
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('playlist_songs', function(table){
      table.increments('id').primary();
      table.foreign('song_id').references('id').inTable('songs');
      table.foreign('playlist_id').references('id').inTable('playlists');
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('playlist_songs')
  ]);
};
