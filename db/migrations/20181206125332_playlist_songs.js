
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('playlist_songs', function(table){
      table.increments('id').primary();
      table.integer('song_id').unsigned();
      table.integer('playlist_id').unsigned();
      table.foreign('song_id').references('songs.id');
      table.foreign('playlist_id').references('playlists.id');
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('playlist_songs')
  ]);
};
