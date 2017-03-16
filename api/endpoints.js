'use strict';

    /**
     * @param endPoints List of routes exposed for that particular service
     * @param key Name of the service
     * @description Exposes GET /endpoints to render api as table and POST /endpoints to return table as json
     * @returns {Object} Route /endpoints and its information
     */
    exports.exposeEndPoint = function (endPoints, key) {
        let endPointTable = "<table border='2' cellpadding='20'><thead><tr><td>#</td><td>HTTP Method</td><td>Path</td></thead><tbody>";
        for (let i = 0; i < endPoints.length; i++) {
            endPointTable += "<tr><td>" + i + "</td><td>" + endPoints[i].httpMethod + "</td><td>" + endPoints[i].path +"</td></tr>";
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