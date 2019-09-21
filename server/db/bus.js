const generate = require('nanoid/generate');

const driver = require('./neo4j');

exports.createBus = async ({ regId, type, from, to }) => {
    const session = driver.session();
    const busRandomPrefix = generate('1245689abefklprtvxz', 27 - regId.length);

    const { records = [] } = await session.writeTransaction(tx => {
        return tx.run(
            'MERGE (id:UniqueId { identifier: $identifierParam, busFixedPrefix: $busFixedPrefixParam }) ' +
                'ON CREATE SET id.count = 1, id.busRandomPrefix = $busRandomPrefixParam ' +
                'ON MATCH SET id.count = id.count + 1, id.busRandomPrefix = $busRandomPrefixParam ' +
                'WITH id.busFixedPrefix + id.busRandomPrefix AS bid, id ' +
                'MERGE (b:Bus { regId : $regIdParam }) ' +
                'ON CREATE SET b.busId = bid, b._created = $_createdParam, b._updated = $_updatedParam, b.from = point($fromParam), b.to = point($toParam), b.type = $typeParam ' +
                'ON MATCH SET id.count = id.count - 1, b._created = $_createdParam, b._updated = $_updatedParam, b.from = $fromParam, b.to = $toParam, b.type = $typeParam ' +
                'RETURN b',
            {
                identifierParam: 'Bus_Counter',
                busFixedPrefixParam: `bus_`,
                busRandomPrefixParam: `${busRandomPrefix}_${regId.toLowerCase()}`,
                regIdParam: regId.toUpperCase(),
                fromParam: from,
                toParam: to,
                typeParam: type.toUpperCase(),
                _createdParam: new Date().toJSON(),
                _updatedParam: new Date().toJSON(),
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
    const { records = [] } = await session.writeTransaction(tx => {
        return tx.run(
            'MERGE (b:Bus { busId : $busIdParam }) ' +
                'SET b._updated = $_updatedParam, b.lastKnown = $lastKnownParam, b.lastSeenAt = $lastSeenAtParam ' +
                'RETURN b',
            {
                busIdParam: busId.toLowerCase(),
                lastKnownParam: JSON.stringify({
                    lat,
                    lng,
                }),
                lastSeenAtParam: `${lastSeenAt}`,
                _updatedParam: new Date().toJSON(),
            }
        );
    });
    session.close();
    const bus = records.length && records[0].get('b').properties;
    return bus;
};
