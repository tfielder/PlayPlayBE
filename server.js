const express = require('express');
const cors = require('cors');
const app = express();

const bodyParser = require('body-parser');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

const Song = require('./lib/models/song');
const Playlist = require('./lib/models/playlist');

const songs_routes = require('./lib/routes/api/v1/songs');
const playlists_routes = require('./lib/routes/api/v1/playlists');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', process.env.PORT || 3000);
app.locals.title = 'playplay';

app.get('/', (request, response) => {
  response.send("Welcome!");
});

app.use('/api/v1/playlists', playlists_routes);
app.use('/api/v1/songs', songs_routes);
app.use('/api/v1/favorites', songs_routes);

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});

module.exports = app;