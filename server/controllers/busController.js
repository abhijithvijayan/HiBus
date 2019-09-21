const generate = require('nanoid/generate');

const { createBus, getBusByRegId, getBusByBusId } = require('../db/bus');

/**
 *  Add Bus
 */
exports.addBusByRegId = async (req, res) => {
    let { regId = '' } = req.body;

    const bus = await getBusByRegId({ regId });

    if (bus) {
        return res.status(403).json({
            error: {
                msg: 'This Bus is already registered',
                _reported: new Date().getTime(),
            },
        });
    }

    let busId;

    ({ busId, regId } = await createBus({ regId }));

    return res.status(201).json({
        regId,
        busId,
        msg: 'Bus registration successful',
        _reported: new Date().getTime(),
    });
};

/**
 *  Get bus details middleware
 */
exports.getBusDetails = async (req, res, next) => {
    const { busId = '' } = req.body;

    const bus = await getBusByBusId({ busId });

    if (bus) {
        req.bus = {
            regId: bus.regId,
            busId,
            msg: 'Bus exists',
            _reported: new Date().getTime(),
        };
        return next();
    }

    return res.status(404).json({
        error: {
            msg: 'The requested bus is not yet registered',
        },
    });
};

exports.saveAndUpdateBusStatus = async (req, res) => {
    const { busId } = req.bus;

    const promoCode = generate('1245689ABEFKLPRTVXZ', 12);

    // ToDo: update bus status

    return res.status(201).json({
        busId,
        promoCode: `${promoCode.slice(0, 4)}-${promoCode.slice(4, 8)}-${promoCode.slice(8, 12)}`,
        _reported: new Date().getTime(),
    });
};
