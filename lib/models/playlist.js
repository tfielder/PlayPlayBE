const environment = process.env.NODE_ENV || 'development';
const configuration = require('../../knexfile')[environment];
const database = require('knex')(configuration);

const all = () => {
  return database('playlists').select('id', 'playlist_name');
}

const create_new = (playlist_name) => {
  return database('playlists').insert(playlist_name, 'id').returning('*');
}

module.exports = {
  all,
  // find_by_id,
  // update_playlist,
  // delete_playlist,
  create_new
}