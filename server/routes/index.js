const express = require('express');

const router = express.Router();

const { catchErrors } = require('../handlers/errorHandlers');
const bus = require('../controllers/busController');
const api = require('./api');

router.get('/api/v1/', api.sendStatus);

router.post('/api/v1/bus/add', catchErrors(bus.addBus));

module.exports = router;
