const express = require('express');
const router = express.Router();
const songsController = require('../../../controllers/songs_controller')

router.get('/', songsController.index);
router.get('/:id', songsController.show);
router.post('/:id', songsController.create);
router.put('/:id', songsController.update);
router.delete('/:id', songsController.destroy);

module.exports = router