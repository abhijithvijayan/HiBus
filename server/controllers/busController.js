const generate = require('nanoid/generate');

const { createBus, getBusByRegId, getBusByBusId, updateBusStatus, getCloserRecords } = require('../db/bus');

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
    const { latitude, longitude, lastSeenAt } = req.body;

    const updatedTime = new Date(_updated).getTime();
    let status = false;
    // don't update if data in db is more newer than received
    if (updatedTime < lastSeenAt) {
        const unitItem = await updateBusStatus({
            busId,
            lastKnown: {
                latitude,
                longitude,
            },
            lastSeenAt,
        });
        if (unitItem) {
            status = true;
        }
    }

    const promoCode = generate('1245689ABEFKLPRTVXZ', 12);

    // promotional brands
    const brands = {
        0: {
            name: 'Uber',
            description: 'UberMoto Offer - Get Upto 50% OFF',
            discount: '50%',
            type: 'OFF',
        },
        1: {
            name: 'Zomato',
            description: 'Get Upto Rs.300 Cashback on First Order with this coupon',
            discount: 'Rs.300',
            type: 'CASHBACK',
        },
        2: {
            name: 'OYO',
            description: 'OYO Hotels at Just Rs.999 or less - Use Coupon today',
            discount: 'Best Price',
            type: '',
        },
        3: {
            name: 'BookMyShow',
            description: 'Flat Rs.85 OFF On All Movie Tickets on applying coupon',
            discount: 'Rs.85',
            type: 'OFF',
        },
    };

    return res.status(200).json({
        status,
        promoCode: `${promoCode.slice(0, 4)}-${promoCode.slice(4, 8)}-${promoCode.slice(8, 12)}`,
        brand: brands[Math.floor(Math.random() * 4)],
        busId,
        _reported: new Date().getTime(),
    });
};

exports.fetchCloserBuses = async (req, res) => {
    const { latitude, longitude, requestedAt } = req.body;

    const response = await getCloserRecords({ latitude, longitude, requestedAt });

    if (response.status) {
        return res.status(200).json({
            busRecords: response.busRecords,
            _reported: new Date().getTime(),
        });
    }

    return res.status(403).json({
        error: {
            msg: response.error,
            _reported: new Date().getTime(),
        },
    });
};
