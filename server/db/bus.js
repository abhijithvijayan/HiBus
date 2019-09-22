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

exports.updateBusStatus = async ({ busId, lastKnown, lastSeenAt }) => {
    const session = driver.session();
    const { records = [] } = await session.writeTransaction(tx => {
        return tx.run(
            'MERGE (b:Bus { busId : $busIdParam }) ' +
                'SET b._updated = $_updatedParam, b.lastKnown = point($lastKnownParam), b.lastSeenAt = $lastSeenAtParam ' +
                'RETURN b',
            {
                busIdParam: busId.toLowerCase(),
                lastKnownParam: lastKnown,
                lastSeenAtParam: `${lastSeenAt}`,
                _updatedParam: new Date().toJSON(),
            }
        );
    });
    session.close();
    const bus = records.length && records[0].get('b').properties;
    return bus;
};

exports.getCloserRecords = async ({ latitude, longitude, requestedAt }) => {
    const session = driver.session();
    // ToDo: match only if last update happened recently
    const { records = [] } = await session.readTransaction(tx => {
        // 10000 is in metres (10km)
        return tx.run(
            'MATCH (b:Bus) ' +
                'WITH point({ latitude: $latitudeParam, longitude: $longitudeParam }) AS p, b ' +
                'WHERE distance(b.lastKnown, p) < 10000 ' +
                'RETURN b, distance(b.lastKnown, p) AS d ',
            {
                latitudeParam: latitude,
                longitudeParam: longitude,
            }
        );
    });
    session.close();

    if (records.length) {
        const busRecords = records.map(record => {
            const items = record._fields[0] ? record._fields[0].properties : null;
            const distance = record._fields[1] || null;

            if (items) {
                return {
                    distance: distance || 'N/A',
                    regId: Object.prototype.hasOwnProperty.call(items, 'regId') ? items.regId : '',
                    busId: Object.prototype.hasOwnProperty.call(items, 'busId') ? items.busId : '',
                    type: Object.prototype.hasOwnProperty.call(items, 'type') ? items.type : '',
                    lastSeenAt: Object.prototype.hasOwnProperty.call(items, 'lastSeenAt')
                        ? new Date(items.lastSeenAt).getTime()
                        : '',
                    lastKnown: Object.prototype.hasOwnProperty.call(items, 'lastKnown')
                        ? {
                              latitude: Object.prototype.hasOwnProperty.call(items.lastKnown, 'x')
                                  ? items.lastKnown.x
                                  : '',
                              longitude: Object.prototype.hasOwnProperty.call(items.lastKnown, 'y')
                                  ? items.lastKnown.y
                                  : '',
                          }
                        : '',
                    from: Object.prototype.hasOwnProperty.call(items, 'from')
                        ? {
                              latitude: Object.prototype.hasOwnProperty.call(items.from, 'x') ? items.from.x : '',
                              longitude: Object.prototype.hasOwnProperty.call(items.from, 'y') ? items.from.y : '',
                          }
                        : '',
                    to: Object.prototype.hasOwnProperty.call(items, 'to')
                        ? {
                              latitude: Object.prototype.hasOwnProperty.call(items.to, 'x') ? items.to.x : '',
                              longitude: Object.prototype.hasOwnProperty.call(items.to, 'y') ? items.to.y : '',
                          }
                        : '',
                    _created: Object.prototype.hasOwnProperty.call(items, '_created')
                        ? new Date(items._created).getTime()
                        : '',
                    _updated: Object.prototype.hasOwnProperty.call(items, '_updated')
                        ? new Date(items._updated).getTime()
                        : '',
                };
            }
            return {};
        });
        return { status: true, busRecords };
    }
    return { status: false, error: 'No buses nearby at this time. Please wait for sometime.' };
};
