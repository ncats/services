'use strict';

const revalidator = require('revalidator');

/**
 *
 * @param {Object} schema - The 'revalidator' schema to use when validating the provided object
 * @param {Object} object - The object to check against the schema
 * @param {String} type - The type of object being validated
 * @param {String} packageName - The LabShare package name that created the object
 */
module.exports = function validate({schema, object, type, packageName}) {
    let validation = revalidator.validate(object, schema),
        message = `Invalid ${type} "${JSON.stringify(object)}" from package "${packageName}": `;

    validation.errors.forEach((error, index) => {
        message += `${error.property} ${error.message}${(index < validation.errors.length - 1) ? ', ' : '. '}`;
    });

    if (!validation.valid) {
        throw new TypeError(message);
    }

    return validation.valid;
};
