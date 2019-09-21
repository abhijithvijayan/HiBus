const validator = require('express-validator');
const { validationResult } = require('express-validator');

/* Sample Validation example */
exports.signUpValidationCriterias = [
    validator
        .body('email')
        .exists()
        .withMessage('You must provide a valid email address.')
        .isEmail()
        .withMessage('Email address you entered is not valid.')
        .trim()
        .normalizeEmail(),
    validator
        .body('name')
        .exists()
        .withMessage('You must provide your name.'),
];

exports.signUpValidationBody = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorsObj = errors.mapped();
        const emailError = errorsObj.email && errorsObj.email.msg;
        const nameError = errorsObj.name && errorsObj.name.msg;
        return res.status(400).json({
            error: {
                msg: emailError || nameError,
                _reported: new Date().getTime(),
            },
        });
    }
    return next();
};

/* Sample Validation example */
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
