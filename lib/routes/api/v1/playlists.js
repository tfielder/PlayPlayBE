const express = require('express');
const router = express.Router();
const playlistsController = require('../../../controllers/playlists_controller')

router.get('/', playlistsController.index);
router.get('/:playlist_id/songs', playlistsController.show);
router.post('/:playlist_id/songs/:id', playlistsController.create);
// router.put('/:id', playlistsController.update);
router.delete('/:playlist_id/songs/:id', playlistsController.destroy);

module.exports = router