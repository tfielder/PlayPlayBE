const environment = process.env.NODE_ENV || 'development';
const configuration = require('../../knexfile')[environment];
const database = require('knex')(configuration);

const all = () => {
  return database('songs').select('id', 'name', 'artist_name', 'genre', 'song_rating');
}

const find_by_id = (id) => {
  return database('songs').where('id', id).select('id', 'name', 'artist_name', 'genre', 'song_rating');
}

const update_song = (id, song_info) => {
  return database('songs').where('id', id).update(song_info).returning('*');
}

const delete_song = (id) => {
  return database('songs').where('id', request.params.id).del().returning('*');
}

const create_song = (song) => {
  return database('songs').insert(song, 'id').returning('*');
}

const song_name_by_id = (song_id) => {
  return database('songs').where('id', song_id).select('name');
}

module.exports = {
  all,
  find_by_id,
  update_song,
  delete_song,
  create_song,
  song_name_by_id
}