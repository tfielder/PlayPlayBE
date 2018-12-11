const Playlist = require('../models/playlist')

const index = (request, response) => {
  Playlist.all()
    .then((playlists) => {
      response.status(200).json(playlists)
    })
    .catch((error) => {
      response.status(500).json({ error })
    })
}

const show = (request, response) => {
  const playlist_id = parseInt(request.params.playlist_id);
  if (!playlist_id) {
    return response.status(400).json({ error: `No playlist id provided`} );
  }

  const getPlaylist = (playlist_id) => {
    return database('playlists')
        .where('playlists.id', playlist_id)
          .select('playlists.id', 'playlists.playlist_name')
            .returning('*')
            .catch( error => {
              response.status(500).json( {error} )
            });
  }

  const getSongs = (playlist_id) => {
    return database('playlists')
          .where('playlists.id', playlist_id)
            .innerJoin('playlist_songs', 'playlists.id', '=', 'playlist_songs.playlist_id')
              .join('songs', 'playlist_songs.song_id', '=', 'songs.id')
                .select('songs.id', 'songs.name', 'songs.artist_name', 'songs.genre', 'songs.song_rating')
                  .returning('*')
                  .catch( error => {
                    response.status(500).json( {error} )
                  });
  }

  const getPlaylistSongs = (playlist_id) => {
    let playlist = null;
    return getPlaylist(playlist_id)
      .then((playlister) => {
        if (!playlister || playlister.length === 0) {
          return { error: 'no playlist found'}
        };
        playlist = playlister;
        return getSongs(playlist_id);
      })
      .then((songs) => {
        playlist = playlist[0];
        playlist.songs = songs;
       return playlist;
     })
      .catch( error => {
        response.status(500).json( {error})
      })
  }

    return getPlaylistSongs(playlist_id)
      .then((playlist) => {
        response.status(200).json({ playlist})
      })
      .catch( error => {
        response.status(500).json( {error})
      });
}

const action = (request, response) => {

}

module.exports = {
  index,
  show,
}