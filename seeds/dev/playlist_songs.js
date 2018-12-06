exports.seed = function(knex, Promise) {
  return knex('playlist_songs').del()
    .then(() => {
      return Promise.all([
        knex('playlist_songs').insert({})
      ])
    })
};