const Playlist = require('../models/playlist')

const index = async(request, response) => {

  const getSongs = async (playlist_id) => {
    let allsongs = await Playlist.songs(playlist_id);
    let songs = await allsongs;
    return songs;
  }

  const addSongs = async(playlist) => {
    playlist.map( async (p) => {
      p.songs = {};
      p.songs = await getSongs(p.id);
      //doesn't seem to be storing the songs here . . . but why?
    });

    console.log(playlist);
    return playlist;
  }

  Playlist.all()
    .then((playlists) => {
      modifiedPlaylists = addSongs(playlists);
      return modifiedPlaylists;
    })
    .then((playlists) => {
      response.status(200).json(playlists)
    })
    .catch((error) => {
      response.status(500).json({ error })
    })
}

const show = (request, response) => {
  const playlist_id = parseInt(request.params.playlist_id);

  const getPlaylist = async (playlist_id) => {
    let playlister = await Playlist.find_by_id(playlist_id);
    let songs = await Playlist.songs(playlist_id);
    playlister[0].songs = songs[0];
    let playlist = playlister[0];

    return playlist
  }

  getPlaylist(playlist_id)
    .then((playlist) => {
      response.status(200).json({ playlist })
    })
    .catch( error => {
      response.status(500).json( {error})
    });
}

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