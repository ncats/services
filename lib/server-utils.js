'use strict';

const assert = require('assert'),
    _ = require('lodash');

/**
 * @description Extremely basic graceful shutdown of the given server.
 * @param server A HTTP server
 * @param {Number} [timeout] The number of milliseconds to wait for the server to close its connections
 * before forcefully shutting down the server.
 */
function shutdown(server, timeout) {
    try {
        server.close(function () {
            process.exit();
        });
        setTimeout(function () {
            process.exit();
        }, timeout || 0);
    } catch (error) {
        process.exit();
    }
}

exports.isDevMode = function () {
    return !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
};

/**
 *
 * @param {object} expressApp
 * @param {object} logger
 * @returns {http.Server}
 */
exports.startServer = function (expressApp, logger) {
    assert.ok(expressApp && _.isFunction(expressApp.listen), 'startServer: `expressApp` must be able to create an HTTP server');
    assert.ok(logger && _.isFunction(logger.error) && _.isFunction(logger.info),
        '`logger` must define info and error functions');

    // Use 'process.env.PORT' if it is set by iisnode
    var port = process.env.PORT || _.get(global.LabShare, 'Config.services.Listen.Port', 8000),
        server = expressApp.listen(port, () => {
            let host = server.address().address,
                port = server.address().port;
            logger.info(`LabShare services listening at http://${host}:${port}`);
        });

    server.on('error', function (error) {
        logger.error(error.message);
    });

    process.on('SIGTERM', function () {
        shutdown(server);
    });
    process.on('SIGINT', function () {
        shutdown(server);
    });

    return server;
};
