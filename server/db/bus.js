const generate = require('nanoid/generate');

const driver = require('./neo4j');

exports.createBus = async ({ regId }) => {
    const session = driver.session();
    const busRandomPrefix = generate('1245689abefklprtvxz', 27 - regId.length);

    const { records = [] } = await session.writeTransaction(tx => {
        return tx.run(
            'MERGE (id:UniqueId { identifier: $identifierParam, busFixedPrefix: $busFixedPrefixParam }) ' +
                'ON CREATE SET id.count = 1, id.busRandomPrefix = $busRandomPrefixParam ' +
                'ON MATCH SET id.count = id.count + 1, id.busRandomPrefix = $busRandomPrefixParam ' +
                'WITH id.busFixedPrefix + id.busRandomPrefix AS bid, id ' +
                'MERGE (b:Bus { regId : $regIdParam }) ' +
                'ON CREATE SET b.busId = bid, b._created = $_createdParam ' +
                'ON MATCH SET id.count = id.count - 1, b._created = $_createdParam ' +
                'RETURN b',
            {
                identifierParam: 'Bus_Counter',
                busFixedPrefixParam: `bus_`,
                busRandomPrefixParam: `${busRandomPrefix}_${regId.toLowerCase()}`,
                regIdParam: regId.toUpperCase(),
                _createdParam: new Date().toJSON(),
            }
        );
    });
    session.close();
    const bus = records[0].get('b').properties;
    return bus;
};

exports.getBusByRegId = async ({ regId }) => {
    const session = driver.session();
    const { records = [] } = await session.readTransaction(tx => {
        return tx.run('MATCH (b:Bus { regId : $regIdParam }) RETURN b', {
            regIdParam: regId.toUpperCase(),
        });
    });
    session.close();
    const bus = records.length && records[0].get('b').properties;
    return bus;
};

exports.getBusByBusId = async ({ busId }) => {
    const session = driver.session();
    const { records = [] } = await session.readTransaction(tx => {
        return tx.run('MATCH (b:Bus { busId : $busIdParam }) RETURN b', {
            busIdParam: busId.toLowerCase(),
        });
    });
    session.close();
    const bus = records.length && records[0].get('b').properties;
    return bus;
};

exports.updateBusStatus = async ({ busId, lat, lng, lastSeenAt }) => {
    const session = driver.session();
    const { records = [] } = await session.readTransaction(tx => {
        return tx.run(
            'MERGE (b:Bus { busId : $busIdParam }) ' +
                'SET b._updated = $updatedParam, b.lat = $latParam, b.lng = $lngParam, b.lastSeenAt = $lastSeenAtParam ' +
                'RETURN b',
            {
                busIdParam: busId.toLowerCase(),
                latParam: lat,
                lngParam: lng,
                lastSeenAtParam: `${lastSeenAt}`,
                updatedParam: new Date().toJSON(),
            }
        );
    });
    session.close();
    const bus = records.length && records[0].get('b').properties;
    return bus;
};
