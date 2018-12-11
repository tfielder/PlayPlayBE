const environment = process.env.NODE_ENV || 'development';
const configuration = require('../../knexfile')[environment];
const database = require('knex')(configuration);

const all = () => {
  return database('playlists').select('id', 'playlist_name');
}



module.exports = {
  all,
  // find_by_id,
  // update_playlist,
  // delete_playlist,
  // create_playlist
}