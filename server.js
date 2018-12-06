const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', process.env.PORT || 3000);
app.locals.title = 'playplay';

app.get('/', (request, response) => {
  response.send("Welcome!\n");
});

//Create
app.post('/api/v1/songs', (request, response) => {
  const song = request.body;
  for (let requiredParameter of ['name', 'artist_name', 'genre', 'song_rating']){
    if (!song[requiredParameter]){
      return response
        .status(400)
        .send({ error: `Expected format: { name: <String>, artist_name: <String>, genre: <String>, song_rating: <Integer>}. You're missing a "${requiredParameter}" property.`});
    }
  }

  database('songs').insert(song, 'id')
    .then(song => {
      response.status(201).json({ song: {song}})
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

//Read
app.get('/api/v1/favorites', (request, response) => {

  database('songs').select('id', 'name', 'artist_name', 'genre', 'song_rating')
    .then((songs) => {
      response.status(200).json(songs);
    })
    .catch((error) => {
      response.status(500).json({ error });
    });
});

app.get('/api/v1/songs/:id', (request, response) => {
  database('songs').where('id', request.params.id).select('id', 'name', 'artist_name', 'genre', 'song_rating')
    .then(song => {
      if (song.length) {
        response.status(200).json(song);
      } else {
        response.status(404).json({
          error: `Could not find song with id ${request.params.id}`
        });
      }
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

//Update
app.put('/api/v1/songs/:id', (request, response) => {
  const song = request.body;
  const id = parseInt(request.params.id);
  for (let requiredParameter of ['id', 'name', 'artist_name', 'genre', 'song_rating']){
    if (!song["songs"][requiredParameter]){
      return response
        .status(422)
        .send({ error: `Expected format: { name: <String>, artist_name: <String>, genre: <String>, song_rating: <Integer>}. You're missing a "${requiredParameter}" property.`});
    }
  }

  let update_info = {
    name: request.body["songs"]['name'],
    artist_name: request.body["songs"]['artist_name'],
    genre: request.body["songs"]['genre'],
    song_rating: request.body["songs"]['song_rating']
  };

  database('songs').where('id', request.params.id).update(update_info)
    .then(song => {
      response.status(200).json({ "song": song[id] })
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

//Destroy
app.delete('/api/v1/songs/:id', (request, response) => {
  const song = database('songs').where('id', request.params.id).select();
  if (song) {
    database('songs').where('id', request.params.id).del()
      .then(song => {
        response.status(204);
      })
      .catch(error => {
        response.status(500).json({ error });
      })
  } else {
    response.status(404).send({ error: `Could not find song with id ${request.params.id}` });
  }
 });

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});