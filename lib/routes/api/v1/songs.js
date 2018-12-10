const express = require('express');
const router = express.Router();
const songsController = require('../../../controllers/songs_controller')

router.get('/', songsController.index);

module.exports = router;