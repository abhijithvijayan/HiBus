const express = require('express');
const path = require('path');

const router = express.Router();

const { catchErrors } = require('../handlers/errorHandlers');
const validate = require('../controllers/validateBodyController');
const bus = require('../controllers/busController');
const api = require('./api');

router.get('/api/v1/', api.sendStatus);

// add bus with regId
router.post(
    '/api/v1/bus/add',
    validate.addBusValidationCriterias,
    validate.addBusValidationBody,
    catchErrors(bus.addBusByRegId)
);

// save last found location & time
router.post(
    '/api/v1/bus/status',
    validate.UpdateBusStatusValidationCriterias,
    validate.UpdateBusStatusValidationBody,
    catchErrors(bus.getBusDetails),
    catchErrors(bus.saveAndUpdateBusStatus)
);

router.post(
    '/api/v1/bus/fetch',
    validate.fetchBusesValidationCriterias,
    validate.fetchBusesValidationBody,
    catchErrors(bus.fetchCloserBuses)
);

if (process.env.NODE_ENV === 'production') {
    // Handles any requests that don't match the ones above
    router.get('*', (req, res) => {
        res.sendFile(path.join(`${__dirname}/../../client/build/index.html`));
    });
}

module.exports = router;
