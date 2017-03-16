'use strict';

const version = require('./version'),
    endpoints = require('./endpoints');

exports.config = function(data) {
    const { apiLoader, app } = data;

    // Update the routes for each services
    for (var key in apiLoader.services) {
        if (apiLoader.services.hasOwnProperty(key)) {
            apiLoader.services[key].push(version.exposeVersionRoute(apiLoader.manifest[key], key));
            apiLoader.services[key] = apiLoader.services[key].concat(endpoints.exposeEndPoint(apiLoader.services[key], key));
        }
    }
};