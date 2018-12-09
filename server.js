const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const pry = require('pryjs');
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

  const SONG_NAME = database('songs').where('id', song_param).select('name').then((song) => {return song})
  const PLAYLIST_NAME = database('playlists').where('id', playlist_param).select('playlist_name').then((playlist) => {return playlist})

  if (!SONG_NAME) {
    return response.status(404).send({ error: `Not a valid song.`});
  }
  if (!PLAYLIST_NAME) {
    return response.status(404).send({ error: `Not a valid playlist.`});
  }

  const playlist_song = {
    song_id: song_param,
    playlist_id: playlist_param
  };

  //database('playlist_songs').where('').where('').find(playlist_song, 'id').limit('1')
  database('playlist_songs').where('playlist_songs.playlist_id', '=', playlist_param).where('playlist_songs.song_id', '=', song_param).limit('1').del()
    .then(value => {
      response.status(201).json({ message: `Successfully deleted ${SONG_NAME} from ${PLAYLIST_NAME}` })
    })
    .catch(error => {
      response.status(404).json({ error: "Could not complete the request" });
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