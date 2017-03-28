'use strict';

const version = require('./version'),
    endpoints = require('./endpoints'),
    _ = require('lodash');

exports.config = function (data) {
    const {apiLoader, app} = data;
    const versionDependencies = [];
    // console.log(apiLoader.services)
    for (let key in apiLoader.services) {
        if (apiLoader.services.hasOwnProperty(key) && !_.isEmpty(apiLoader.services[key])) {
                versionDependencies.push(version.versionDependencies(apiLoader.manifest[key], key));
                apiLoader.services[key] = _.concat(apiLoader.services[key],endpoints.exposeEndPoint(apiLoader.services[key], key));
        }
    }
    
    apiLoader.services[_.head(_.head([versionDependencies])).api] = _.concat((apiLoader.services[_.head(_.head([versionDependencies])).api]), version.addVersionRoutes(versionDependencies, _.head(_.head([versionDependencies])).api));
};
