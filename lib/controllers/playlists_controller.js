const Playlist = require('../models/playlist')
const pry = require('pryjs')

const index = (request, response) => {
  Playlist.all()
    .then((playlists) => {
      response.status(200).json(playlists)
    })
    .catch((error) => {
      response.status(500).json({ error })
    })
}

//***Working here
const show = async (request, response) => {
  const playlist_id = parseInt(request.params.playlist_id);

  let playlists = await Playlist.all();
  console.log(playlists);
  let songs = await Playlist.songs(playlist_id);
  console.log(songs);
  

  //original code below

  // const getPlaylist = (playlist_id) => {
  //   return Playlist.find_by_id(playlist_id)
  //           .catch( error => {
  //             response.status(500).json( {error} )
  //           });
  // }
  //
  // const getSongs = (playlist_id) => {
  //   return Playlist.songs(playlist_id)
  //                 .catch( error => {
  //                   response.status(500).json( {error} )
  //                 });
  // }
  //
  // const getPlaylistSongs = (playlist_id) => {
  //   let playlist = null;
  //   return getPlaylist(playlist_id)
  //     .then((playlister) => {
  //       if (!playlister || playlister.length === 0) {
  //         return { error: 'no playlist found'}
  //       };
  //       playlist = playlister;
  //       return getSongs(playlist_id);
  //     })
  //     .then((songs) => {
  //
  //       playlist = playlist[0];
  //       playlist.songs = songs;
  //       return playlist;
  //    })
  //     .catch( error => {
  //       response.status(500).json( {error})
  //     })
  // }
  //
  //   return getPlaylistSongs(playlist_id)
  //     .then((playlist) => {
  //       response.status(200).json({ playlist})
  //     })
  //     .catch( error => {
  //       response.status(500).json( {error})
  //     });
}

//*****
const create = (request, response) => {
  const playlist_param = request.params.playlist_id;
  const song_param = request.params.id;

  const playlist_song = {
    song_id: song_param,
    playlist_id: playlist_param
  };

  database('songs').where('id', song_param).select('name')
    .then((song) => {return song_name = song[0]["name"];})
    .then((song) => {return database('playlists').where('id', playlist_param).select('playlist_name')})
    .then((playlist) => {playlist_name = playlist[0]["playlist_name"];})
    .then( database('playlist_songs').insert(playlist_song, 'id').returning('*'))
    .then(value => {
      response.status(201).json({ message: `Successfully added '${song_name}' to '${playlist_name}'` })
    })
    .catch(error => {
      response.status(404).json({ error: "Could not complete the request" });
    });
}

const destroy = (request, response) => {
  const playlist_param = request.params.playlist_id;
  const song_param = request.params.id;

  const deleteSongPlaylist = () => {
    return database('playlist_songs').where('playlist_songs.playlist_id', '=', playlist_param).where('playlist_songs.song_id', '=', song_param).limit('1').del()
  }
  //validations
  // if (!SONG_NAME) {
  //   return response.status(404).send({ error: `Not a valid song.`});
  // }
  // if (!PLAYLIST_NAME) {
  //   return response.status(404).send({ error: `Not a valid playlist.`});
  // }
  database('songs').where('id', song_param).select('name')
    .then((song) => {return song_name = song[0]['name']})
    .then(database('playlists').where('id', playlist_param).select('playlist_name').then((playlist) => {return playlist_name = playlist[0]['playlist_name']}))
    .then((playlist) => {
      deleteSongPlaylist();
    })
    .then(value => {
      response.status(201).json({ message: `Successfully deleted ${song_name} from ${playlist_name}` })
    })
    .catch(error => {
      response.status(404).json({ error: "Could not complete the request" });
    });
}

module.exports = {
  index,
  show,
  create,
  destroy
}