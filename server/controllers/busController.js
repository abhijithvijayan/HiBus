const generate = require('nanoid/generate');

const { createBus, getBusByRegId, getBusByBusId, updateBusStatus } = require('../db/bus');

/**
 *  Add Bus
 */
exports.addBusByRegId = async (req, res) => {
    let { regId, type, from, to } = req.body;

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

    ({ busId, regId, from, to, type } = await createBus({ regId, type, from, to }));

    return res.status(201).json({
        regId,
        busId,
        from,
        to,
        type,
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
            _updated: bus._updated,
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
    const { busId, _updated } = req.bus;
    let status = false;
    const { lat, lng, lastSeenAt } = req.body;

    const updatedTime = new Date(_updated).getTime();

    // don't update if data in db is more newer than received
    if (updatedTime < lastSeenAt) {
        const unitItem = await updateBusStatus({ busId, lat, lng, lastSeenAt });
        if (unitItem) {
            status = true;
        }
    }

    const promoCode = generate('1245689ABEFKLPRTVXZ', 12);

    return res.status(201).json({
        status,
        promoCode: `${promoCode.slice(0, 4)}-${promoCode.slice(4, 8)}-${promoCode.slice(8, 12)}`,
        busId,
        _reported: new Date().getTime(),
    });
};
