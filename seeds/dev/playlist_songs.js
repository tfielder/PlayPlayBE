exports.seed = function(knex, Promise) {
  return knex('playlist_songs').del()
    .then(() => {
      return Promise.all([
        knex('playlist_songs').insert('id')
        // knex('playlist_songs').insert({song_id: 1, playlist_id: 1}, 'id'),
        // knex('playlist_songs').insert({song_id: 2, playlist_id: 1}, 'id'),
        // knex('playlist_songs').insert({song_id: 1, playlist_id: 2}, 'id'),
        // knex('playlist_songs').insert({song_id: 2, playlist_id: 2}, 'id')
      .then(() => console.log('Seeding Playlist Songs Complete!'))
      .catch(error => console.log(`Error seeding data: ${error}`))
      ])
    })
    .catch(error => console.log(`Error seeding data: ${error}`))
  };


