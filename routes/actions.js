const express = require('express');
const router = express.Router()

const message_controller = require('../controllers/messageController')


router.get('/message', message_controller.get_form)
router.post('/message', message_controller.post_form)


module.exports = router