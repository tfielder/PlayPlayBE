const environment = process.env.NODE_ENV || 'development';
const configuration = require('../../knexfile')[environment];
const database = require('knex')(configuration);

const all = () => {
  return database('playlists').select('id', 'playlist_name');
}

const find_by_id = (playlist_id) => {
  return database('playlists')
      .where('playlists.id', playlist_id)
        .select('playlists.id', 'playlists.playlist_name')
          .returning('*')
}

const songs = (playlist_id) => {
  return database('playlists')
        .where('playlists.id', playlist_id)
          .innerJoin('playlist_songs', 'playlists.id', '=', 'playlist_songs.playlist_id')
            .join('songs', 'playlist_songs.song_id', '=', 'songs.id')
              .select('songs.id', 'songs.name', 'songs.artist_name', 'songs.genre', 'songs.song_rating')
                .returning('*')
}


module.exports = {
  all,
  find_by_id,
  songs,
  // update_playlist,
  // delete_playlist,
  // create_playlist
}