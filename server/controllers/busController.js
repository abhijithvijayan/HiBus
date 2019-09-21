const { createBus, getBusDetails } = require('../db/bus');

exports.addBus = async (req, res) => {
    let { regId } = req.body;

    const bus = await getBusDetails({ regId });

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
    // ToDo: extract busFixedPrefix from this and send back

    return res.status(201).json({
        regId,
        busId,
        msg: 'Bus registration successful',
        _reported: new Date().getTime(),
    });
};
