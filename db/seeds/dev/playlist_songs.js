exports.seed = function(knex, Promise) {
  return knex('playlist_songs').del()
    .then(() => {
      return Promise.all([
        knex('playlist_songs').insert('id')
      .then(() => console.log('Seeding Playlist Songs Complete!'))
      .catch(error => console.log(`Error seeding data: ${error}`))
      ])
    })
    .catch(error => console.log(`Error seeding data: ${error}`))
  };


