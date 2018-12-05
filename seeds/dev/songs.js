
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('songs').del()
    .then(() => {
      return Promise.all([
        knex('songs').insert({name: "We Are the Champions", artist_name: "Queen", genre: "Rock", song_rating: 99}, 'id'),
        knex('songs').insert({name: "We Will Rock You", artist_name: "Queen" , genre: "Rock", song_rating: 77}, 'id'),
        knex('songs').insert({name: "Somebody to Love", artist_name: "Queen" , genre: "Rock", song_rating: 88}, 'id'),
        knex('songs').insert({name: "I Want to Break Free", artist_name: "Queen" , genre: "Rock", song_rating: 99}, 'id')
    .then(() => console.log('Seeding complete!'))
    .catch(error => console.log(`Error seeding data: ${error}`))
    ])
    })
    .catch(error => console.log(`Error seeding data: ${error}`));
  };
