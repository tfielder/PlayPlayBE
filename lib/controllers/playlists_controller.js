const environment = process.env.NODE_ENV || 'development';
const configuration = require('../../knexfile')[environment];
const database = require('knex')(configuration);

const Playlist = require('../models/playlist')
const Song = require('../models/song')

const index = (request, response) => {

  const getSongs = async (playlist_id) => {
    let allsongs = Playlist.songs(playlist_id)
    let songs = await allsongs;
    return songs;
  }

  const addSongs = async (playlist) => {
    play = playlist.map( async (p) => {
      p.songs = {};
      p.ranking = {};
      let songs = await getSongs(p.id);
      p.songs = songs;
      let ranking = await Playlist.playlist_ranking(p.id);
      p.ranking = ranking;
      return p
    })

    const playlist_songs = await Promise.all(play);
    return playlist_songs;
  }

  Playlist.all()
    .then((playlists) => {
      modifiedPlaylists = addSongs(playlists);
      return modifiedPlaylists;
    })
    // .then((modifiedPlaylists) => {
    //   sorted_list = Playlist.sort_by_playlist(modifiedPlaylists);
    //   return sorted_list;
    // })
    .then((playlists) => {
      console.log(playlists)
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
    playlister[0].songs = songs;
    let playlist = playlister[0];

    return playlist
  }

  getPlaylist(playlist_id)
    .then((playlist) => {
      response.status(200).json( playlist )
    })
    .catch( error => {
      response.status(500).json( {error})
    });
}

const create_playlist = (request, response) => {
let playlist = request.body
for (let requiredParameter of ['playlist_name']){
  if (!playlist[requiredParameter]){
    return response.status(400).send({ error : `Expected format: { playlist_name: <String>. You're missing the "${requiredParameter}" property.`});
  }
}

let playlist_name = playlist;

Playlist.create_new(playlist_name)
  .then(value => {
    let pname = value[0]["playlist_name"]
    let pid = value[0]["id"]
    response.status(201).json({ message: `Successfully added '${pname}' with id:${pid}` })
  })
  .catch(error => {
    response.status(404).json({ error: "Could not complete the request" });
  });
}

const create = (request, response) => {
  const playlist_param = parseInt(request.params.playlist_id);
  const song_param = parseInt(request.params.id);

  const playlist_song = {
    song_id: song_param,
    playlist_id: playlist_param
  };

  Song.song_name_by_id(song_param)
    .then((song) => {return song_name = song[0]["name"];})
    .then((song) => {return Playlist.playlist_name_by_id(playlist_param)})
    .then((playlist) => {return playlist_name = playlist[0]["playlist_name"];})
    .then((playlist_name) => {return Playlist.create_song_playlist(playlist_song)})
    .then(value => {
      response.status(201).json({ message: `Successfully added '${song_name}' to '${playlist_name}'` })
    })
    .catch(error => {
      response.status(404).json({ error: "Could not complete the request" });
    });
}

const destroy = (request, response) => {
  const playlist_param = parseInt(request.params.playlist_id);
  const song_param = parseInt(request.params.id);

  const deleteSongPlaylist = () => {
    return database('playlist_songs').where('playlist_songs.playlist_id', '=', playlist_param).where('playlist_songs.song_id', '=', song_param).limit('1').del()
  }
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
  destroy,
  create_playlist
}