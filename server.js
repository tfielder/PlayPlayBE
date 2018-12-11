const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

const Song = require('./lib/models/song');
const Playlist = require('./lib/models/playlist');

const songs_routes = require('./lib/routes/api/v1/songs');
const playlists_routes = require('./lib/routes/api/v1/playlists');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', process.env.PORT || 3000);
app.locals.title = 'playplay';

app.get('/', (request, response) => {
  response.send("Welcome!");
});

// Playlists Section
//Read
app.use('/api/v1/playlists', playlists_routes);

// Playlist Songs Section
//Create
app.post('/api/v1/playlists/:playlist_id/songs/:id', (request, response) => {
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
});

//Delete
app.delete('/api/v1/playlists/:playlist_id/songs/:id', (request, response) => {
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
});

// Songs Section
app.use('/api/v1/songs', songs_routes);
app.use('/api/v1/favorites', songs_routes);

//***stopping here

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});

module.exports = app;