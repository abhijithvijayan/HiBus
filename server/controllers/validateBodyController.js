const validator = require('express-validator');
const { validationResult } = require('express-validator');

exports.addBusValidationCriterias = [
    validator
        .body('regId')
        .exists()
        .withMessage('Enter a valid bus registration id'),
    validator
        .body('type')
        .exists()
        .withMessage('Enter a valid bus type'),
    validator
        .body('from')
        .exists()
        .withMessage('Enter a valid bus source route'),
    validator
        .body('from.lat')
        .exists()
        .withMessage('Enter a valid bus source route'),
    validator
        .body('from.lng')
        .exists()
        .withMessage('Enter a valid bus source route'),
    validator
        .body('to')
        .exists()
        .withMessage('Enter a valid bus destination route'),
    validator
        .body('to.lat')
        .exists()
        .withMessage('Enter a valid bus destination route'),
    validator
        .body('to.lng')
        .exists()
        .withMessage('Enter a valid bus destination route'),
];

exports.addBusValidationBody = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorsObj = errors.mapped();
        const regIdError = errorsObj.regId && errorsObj.regId.msg;
        const typeError = errorsObj.type && errorsObj.type.msg;
        const fromError = errorsObj.from && errorsObj.from.msg;
        const toError = errorsObj.to && errorsObj.to.msg;
        const toLatError = errorsObj['to.lat'] && errorsObj['to.lat'].msg;
        const toLngError = errorsObj['to.lng'] && errorsObj['to.lng'].msg;
        const fromLatError = errorsObj['from.lat'] && errorsObj['from.lat'].msg;
        const fromLngError = errorsObj['from.lng'] && errorsObj['from.lng'].msg;

        return res.status(400).json({
            error: {
                msg:
                    regIdError ||
                    typeError ||
                    fromError ||
                    toError ||
                    toLatError ||
                    toLngError ||
                    fromLatError ||
                    fromLngError,
                _reported: new Date().getTime(),
            },
        });
    }
    return next();
};

exports.UpdateBusStatusValidationCriterias = [
    validator
        .body('busId')
        .exists()
        .withMessage('Enter a valid bus id'),
    validator
        .body('lat')
        .exists()
        .withMessage('Latitude missing'),
    validator
        .body('lng')
        .exists()
        .withMessage('Longitude missing'),
    validator
        .body('lastSeenAt')
        .exists()
        .withMessage('Last seen time missing'),
];

exports.UpdateBusStatusValidationBody = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorsObj = errors.mapped();
        const busIdError = errorsObj.busId && errorsObj.busId.msg;
        const latError = errorsObj.lat && errorsObj.lat.msg;
        const lngError = errorsObj.lng && errorsObj.lng.msg;
        const lastSeenAtError = errorsObj.lastSeenAt && errorsObj.lastSeenAt.msg;
        return res.status(400).json({
            error: {
                msg: busIdError || latError || lngError || lastSeenAtError,
                _reported: new Date().getTime(),
            },
        });
    }
    return next();
};

exports.fetchBusesValidationCriterias = [
    validator
        .body('lat')
        .exists()
        .withMessage('Latitude missing'),
    validator
        .body('lng')
        .exists()
        .withMessage('Longitude missing'),
    validator
        .body('requestedAt')
        .exists()
        .withMessage('Requested time missing'),
];

exports.fetchBusesValidationBody = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorsObj = errors.mapped();
        const latError = errorsObj.lat && errorsObj.lat.msg;
        const lngError = errorsObj.lng && errorsObj.lng.msg;
        const requestedAtError = errorsObj.requestedAt && errorsObj.requestedAt.msg;
        return res.status(400).json({
            error: {
                msg: latError || lngError || requestedAtError,
                _reported: new Date().getTime(),
            },
        });
    }
    return next();
};

/**
 *  Sample Validation example
 */
// exports.signUpValidationCriterias = [
//     validator
//         .body('email')
//         .exists()
//         .withMessage('You must provide a valid email address.')
//         .isEmail()
//         .withMessage('Email address you entered is not valid.')
//         .trim()
//         .normalizeEmail(),
//     validator
//         .body('name')
//         .exists()
//         .withMessage('You must provide your name.'),
// ];

// exports.signUpValidationBody = (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         const errorsObj = errors.mapped();
//         const emailError = errorsObj.email && errorsObj.email.msg;
//         const nameError = errorsObj.name && errorsObj.name.msg;
//         return res.status(400).json({
//             error: {
//                 msg: emailError || nameError,
//                 _reported: new Date().getTime(),
//             },
//         });
//     }
//     return next();
// };
