const Song = require('../models/song')

const index = (request, response) => {
  Song.all()
    .then((songs) => {
      response.status(200).json(songs);
    })
    .catch((error) => {
      response.status(500).json({ error });
    });
}

const show = (request, response) => {
  Song.find_by_id(request.params.id)
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
}

const create = (request, response) => {
  const song = request.body;
  for (let requiredParameter of ['name', 'artist_name', 'genre', 'song_rating']){
    if (!song[requiredParameter]){
      return response.status(400).send({ error : `Expected format: { name: <String>, artist_name: <String>, genre: <String>, song_rating: <Integer>}. You're missing a "${requiredParameter}" property.`});
    }
  }

  Song.create_song(song)
    .then(song => {
      const songs = song[0]
      response.status(201).json({ songs })
    })
    .catch(error => {
      response.status(500).json({ error });
    });
}

const update = (request, response) => {
  const song = (request.body);
  const id = parseInt(request.params.id);

  for (let requiredParameter of ['name', 'artist_name', 'genre', 'song_rating']){
    if (!song[requiredParameter]){
      return response.status(422).send({ error: `Expected format: { name: <String>, artist_name: <String>, genre: <String>, song_rating: <Integer>}. You're missing a "${requiredParameter}" property.`});
    }
  }

  let update_info = {
    name: request.body['name'],
    artist_name: request.body['artist_name'],
    genre: request.body['genre'],
    song_rating: request.body['song_rating']
  };

  Song.update_song(id, update_info)
    .then(song => {
      response.status(200).json({ song })
    })
    .catch(error => {
      response.status(500).json({ error });
    });
}

const destroy = (request, response) => {
  const song = Song.find_by_id(request.params.id);
  if (song) {
    Song.delete_song(request.params.id)
      .then(song => {
        return response.status(204);
      })
      .catch(error => {
        return response.status(500).json({ error });
      })
  } else {
    return response.status(404).send({ error: `Could not find song with id ${request.params.id}` });
  }
}

module.exports = {
  index,
  show,
  create,
  update,
  destroy
}