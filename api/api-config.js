'use strict';

const _ = require('lodash');



/**
 * @param versionDependencies An apps dependencies and information gathered from their package.json
 * @description Parses package.json to retrieve relevant metadata
 * @returns {Object} Route /version and its information
 */
function addVersionRoutes(versionDependencies) {

    function returnVersion(req, res) {
        res.json({
            versions: versionDependencies
        });
    }

    function returnDependencies(req, res) {
        let name = req.params.name;

        if (!_.find(versionDependencies, {api: name})) {
            res.sendStatus(404);
        } else {
            res.json({
                version: _.find(versionDependencies, {api: name})
            });
        }
    }

    return [
        {
            path: `/versions`,
            httpMethod: 'GET',
            middleware: [returnVersion]
        },
        {
            path: `/:name/version`,
            httpMethod: 'GET',
            middleware: [returnDependencies]
        }
    ];
}


function getMetadata(manifest, key) {
    return {
        api: key,
        apiDetails: {name: manifest.name, version: manifest.version, description: manifest.description}
    };
}

/**
 * @param {Array} routes List of routes exposed for a particular LabShare service
 * @param key Name of the service
 * @description Exposes GET /endpoints to render api as table and POST /endpoints to return table as json
 * @returns {Object} Route /endpoints and its information
 */
function exposeEndPoints(routes, key) {
    let endPointTable = "<table border='2' cellpadding='20'><thead><tr><td>#</td><td>HTTP Method</td><td>Path</td></thead><tbody>";

    routes.forEach((endpoint, index) => {
        if (!endpoint) {
            return;
        }
        endPointTable += `<tr><td>${index}</td><td>${endpoint.httpMethod}</td><td>${endpoint.path}</td></tr>`;
    });

    endPointTable += '</tbody></table>';

    function getReturnEndpoints(req, res) {
        res.send(endPointTable);
    }

    function postReturnEndpoints(req, res) {
        res.json(routes);
    }

    return [
        {
            path: `/${key}/endpoints`,
            httpMethod: 'GET',
            middleware: [getReturnEndpoints]
        },
        {
            path: `/${key}/endpoints`,
            httpMethod: 'POST',
            middleware: [postReturnEndpoints]
        }
    ];
}

exports.config = function (data) {
    const {apiLoader} = data;

    let versionDependencies = _.map(apiLoader.manifest, (manifest, key) => {
        return getMetadata(manifest, key);
    });

    apiLoader.services['services'] = _.concat(apiLoader.services['services'] || [], addVersionRoutes(versionDependencies));

     _.each(apiLoader.services, (routes, key) => {
        if (_.isEmpty(routes)) {
            return;
        }

        apiLoader.services[key] = _.concat(routes, exposeEndPoints(routes, key));
    });
};