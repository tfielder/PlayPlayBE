const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

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

app.get('/db', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM test_table');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

// Playlists Section
//Read
app.get('/api/v1/playlists', (request, response) => {

  database('playlists').select('id', 'playlist_name')
    .then((playlists) => {
      response.status(200).json(playlists);
    })
    .catch((error) => {
      response.status(500).json({ error });
    });
});

app.get('/api/v1/playlists/:playlist_id/songs', (request, response) => {
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
});

// Playlist Songs Section
//Create
app.post('/api/v1/playlists/:playlist_id/songs/:id', (request, response) => {
  const playlist_param = request.params.playlist_id;
  const song_param = request.params.id;
  if (!playlist_param) {
    return response
      .status(400)
      .send({ error: `No playlist id provided.`});
  }
  if (!song_param) {
    return response
      .status(400)
      .send({ error: `No song id provided.`});
  }
  const playlist_song = {
    song_id: song_param,
    playlist_id: playlist_param
  };

  database('playlist_songs').insert(playlist_song, 'id').returning('*')
    .then(value => {
      const song_playlist = value[0]
      response.status(201).json({ song_playlist })
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});


// Songs Section
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

  database('songs').insert(song, 'id').returning('*')
    .then(song => {
      const songs = song[0]
      response.status(201).json({ songs })
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

  database('songs').where('id', request.params.id).update(update_info).returning('*')
    .then(song => {
      response.status(200).json({ song })
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

//Destroy
app.delete('/api/v1/songs/:id', (request, response) => {
  const song = database('songs').where('id', request.params.id).select();
  if (song) {
    database('songs').where('id', request.params.id).del().returning('*')
      .then(song => {
        return response.status(204);
      })
      .catch(error => {
        return response.status(500).json({ error });
      })
  } else {
    return response.status(404).send({ error: `Could not find song with id ${request.params.id}` });
  }
 });

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});