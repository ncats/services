'use strict';

const assert = require('assert'),
    https = require('https'),
    http = require('http'),
    fs = require('fs'),
    _ = require('lodash');

/**
 * @description Extremely basic graceful shutdown of the given server.
 * @param server A HTTP server
 * @param {Number} [timeout] The number of milliseconds to wait for the server to close its connections
 * before forcefully shutting down the server.
 */
function shutdown(server, timeout) {
    try {
        server.close(() => {
            process.exit();
        });
        setTimeout(() => {
            process.exit();
        }, timeout || 0);
    } catch (error) {
        process.exit();
    }
}

/**
 *
 * @param {object} expressApp
 * @returns {http.Server|https.Server}
 */
exports.createServer = function (expressApp) {
    // Use 'process.env.PORT' if it is set by iisnode
    let httpsConfig = _.get(global.LabShare, 'Config.services.HTTPS', {}),
        isHTTPS = httpsConfig.Certificate && httpsConfig.PrivateKey,
        server;

    // Use HTTPS when certificates are available
    if (isHTTPS) {
        let credentials = {
            key: fs.readFileSync(httpsConfig.PrivateKey),
            cert: fs.readFileSync(httpsConfig.Certificate)
        };

        server = https.createServer(credentials, expressApp);
    } else {
        server = http.createServer(expressApp);
    }

    return server;
};

/**
 *
 * @param {object} server
 * @param {object} logger
 * @param {Boolean} isHTTPS
 */
exports.startServer = function (server, logger, isHTTPS = false) {
    let port = process.env.PORT || _.get(global.LabShare, 'Config.services.Listen.Port', 8000);

    server.listen(port, () => {
        let host = server.address().address,
            port = server.address().port,
            protocol = isHTTPS ? 'https' : 'http';

        logger.info(`LabShare services listening at ${protocol}://${host}:${port}`);
    });

    server.on('error', error => {
        logger.error(error.message);
    });

    process.on('SIGTERM', () => {
        shutdown(server);
    });
    process.on('SIGINT', () => {
        shutdown(server);
    });
};
