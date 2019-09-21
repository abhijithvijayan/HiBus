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
 *  Get bus details
 *  @params busId from params
 */
exports.getBusDetails = async (req, res) => {
    const { busId = '' } = req.body;

    const bus = await getBusByBusId({ busId });

    if (bus) {
        return res.status(201).json({
            regId: bus.regId,
            busId,
            msg: 'Bus successfully fetched',
            _reported: new Date().getTime(),
        });
    }

    return res.status(404).json({
        error: {
            msg: 'The requested bus is not yet registered',
        },
    });
};
