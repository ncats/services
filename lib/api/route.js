'use strict';

const validateRoute = require('./validate-route'),
    _ = require('lodash'),
    assert = require('assert');

function normalize(url) {
    return url
        .replace(/[\/]+/g, '/')
        .replace(/\:\//g, '://');
}

function joinUrl(...args) {
    let url = args.join('/');
    return normalize(url);
}

function toArray(arg) {
    return !_.isArray(arg) ? [arg] : arg;
}

class Route {

    /**
     * @description Creates a new route instance
     * @param {String} packageName - The name of the LabShare package that created the API route
     * @param {Object} options
     * @param {String} options.path - The API endpoint (e.g. '/users/create')
     * @param {String} options.httpMethod - The HTTP verb
     * @param {Array|Function} options.middleware - One or more Express.JS middleware functions
     */
    constructor(packageName, options = {}) {
        assert.ok(_.isString(packageName), 'Route: "packageName" is required');

        let validator = validateRoute(options, packageName);
        if (!validator.isValid) {
            throw new Error(validator.message);
        }

        _.extend(this, options);

        this.middleware = toArray(this.middleware);

        if (!this.path.startsWith('/')) {
            this.path = `/${this.path}`;
        }

        // Namespace the API path with the LabShare package name
        if (!this.path.startsWith(`/${packageName}/`)) {
            this.path = joinUrl('/', packageName, this.path);
        }
    }
}

module.exports = Route;