'use strict';

const _ = require('lodash');

/**
 * @param versionDependencies An apps dependencies and information gathered from their package.json
 * @param key Name of the service
 * @description Parses package.json to retrieve relevent fields and exposes them on package.json
 * @returns {Object} Route /version and its information
 */
exports.addVersionRoutes = function (versionDependencies, key) {

    function returnVersion(req,res){
        res.json(versionDependencies);
    }

    function returnDependencies(req, res){
        if (!_.find(versionDependencies, {api: req.params.name})){
            res.sendStatus(404);
        } else {
            res.json(_.find(versionDependencies, {api: req.params.name}));
        }
    }

    return [
    {
        path: `/version`,
        httpMethod: 'GET',
        middleware: [returnVersion]
    },
    {
        path: `/:name/version`,
        httpMethod: 'GET',
        middleware: [returnDependencies]
    }
        ];

    
};


exports.versionDependencies = function(manifest, key){
    return { api: key, apiDetails: { "name": manifest.name, "version": manifest.version, "description": manifest.description} } ;
}