'use strict';

/**
 * @param manifest package.json of a service
 * @param key Name of the service
 * @description Parses package.json to retrieve relevent fields and exposes them on package.json
 * @returns {Object} Route /version and its information
 */
exports.exposeVersionRoute = function (manifest, key) {

    function returnPackage(req, res) {
        res.json(sanitizeManifest(manifest));
    }

    function sanitizeManifest(manifest) {
        return {"name": manifest.name, "version": manifest.version, "description": manifest.description};
    }

    return {
        path: `/${key}/version`,
        httpMethod: 'GET',
        middleware: [returnPackage]
    };
};
