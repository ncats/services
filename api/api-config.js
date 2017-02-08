exports.config = function(data) {
    const { apiLoader, app } = data;

    // Update the routes for each services
    for (var key in apiLoader.services) {
        if (apiLoader.services.hasOwnProperty(key)) {
            apiLoader.services[key].push(exposeVersionRoute(apiLoader.manifest[key], key));
            apiLoader.services[key] = apiLoader.services[key].concat(exposeEndPoint(apiLoader.services[key], key));
        }
    }



    /**
     * @param packageDirectory A LabShare package directory
     * @description Parses package.json to retrieve relevent fields and exposes them on package.json
     * @returns {Object} Route /version and its information
     */
    function exposeVersionRoute(manifest, key) {

        function returnPackage(req, res) {
            res.json(sanitizemanifest(manifest));
        }

        function sanitizemanifest(manifest) {
            return {"name":manifest.name, "version":manifest.version, "description": manifest.description, "dependencies": [{"dependencies": manifest.dependencies},{"devDependencies": manifest.devDependencies},{"packageDependencies": manifest.packageDependencies}]};
        }

        return {
            path: "/" + key + "/version",
            httpMethod: 'GET',
            middleware: [returnPackage]
        };
    };

    /**
     * @param directory A LabShare package directory
     * @description Exposes GET /endpoints to render api as table and POST /endpoints to return table as json
     * @returns {Object} Route /endpoints and its information
     */
    function exposeEndPoint(endPoints, name) {
        let endPointTable = "<table border='2' cellpadding='20'><thead><tr><td>#</td><td>Path</td><td>HTTP Method</td></thead><tbody>";
        for (let i = 0; i < endPoints.length; i++) {
            endPointTable += "<tr><td>" + i + "</td><td>" + endPoints[i].path + "</td><td>" + endPoints[i].httpMethod + "</td></tr>";
        }
        let finishendPointTable = "</tbody></table>"

        function getReturnEndpoints(req, res) {
            res.send(endPointTable + finishendPointTable);
        }

        function postReturnEndpoints(req, res) {
            res.json(endPoints);
        }

        let getendPointRoute = {
            path: "/" + key + "/endpoints",
            httpMethod: 'GET',
            middleware: [getReturnEndpoints]
        };

        let postendPointRoute = {
            path: "/" + key + "/endpoints",
            httpMethod: 'POST',
            middleware: [postReturnEndpoints]
        };

        return [getendPointRoute, postendPointRoute];
    }

};