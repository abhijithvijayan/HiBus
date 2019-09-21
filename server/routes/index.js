const express = require('express');

const router = express.Router();

const { catchErrors } = require('../handlers/errorHandlers');
const bus = require('../controllers/busController');
const api = require('./api');

router.get('/api/v1/', api.sendStatus);

// add bus with regId
router.post('/api/v1/bus/add', catchErrors(bus.addBusByRegId));

// get bus details with busId
router.post('/api/v1/bus/get', catchErrors(bus.getBusDetails));

// save last saved

module.exports = router;
