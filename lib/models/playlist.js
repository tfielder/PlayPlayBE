const environment = process.env.NODE_ENV || 'development';
const configuration = require('../../knexfile')[environment];
const database = require('knex')(configuration);

const all = () => {
  return database('playlists').select('id', 'playlist_name');
}

const create_song_playlist = (playlist_song) => {
  return database('playlist_songs').insert(playlist_song, 'id').returning('*')
}

const create_new = (playlist_name) => {
  return database('playlists').insert(playlist_name, 'id').returning('*');
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

const playlist_name_by_id = (playlist_id) => {
  return database('playlists').where('id', playlist_id).select('playlist_name');
}

module.exports = {
  all,
  find_by_id,
  songs,
  create_song_playlist,
  // update_playlist,
  // delete_playlist,
  playlist_name_by_id,
  create_new
}