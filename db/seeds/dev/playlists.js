exports.seed = function(knex, Promise) {
  return knex('playlists').del()
    .then(() => {
      return Promise.all([
        knex('playlists').insert({playlist_name: "Poppy"}, 'id'),
        knex('playlists').insert({playlist_name: "Rocky"}, 'id'),
        knex('playlists').insert({playlist_name: "Runny"}, 'id')
      .then(() => console.log('Seeding playlists complete!'))
      .catch(error => console.log(`Error seeding data: ${error}`))
      ])
    })
    .catch(error => console.log(`Error seeding data: ${error}`));
};