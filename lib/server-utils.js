'use strict';

const https = require('https'),
    http = require('http'),
    fs = require('fs'),
    _ = require('lodash'),
    ServerShutdown = require('server-shutdown'),
    serverShutdown = new ServerShutdown();

module.exports = {
    /**
     *
     * @param {object} expressApp
     * @returns {http.Server|https.Server}
     */
    createServer(expressApp) {
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
    },
    /**
     * @description Starts Express.js HTTP server
     * @param {object} server
     * @param {object} logger
     * @param {number} port
     */
    startServer({server, logger, port}) {
        // Use 'process.env.PORT' if it is set by iisnode or a local '.env' file, etc.
        let httpPort = process.env.PORT || port;

        server.listen(httpPort, () => {
            let host = server.address().address,
                port = server.address().port,
                protocol = 'http';

            logger.info(`LabShare services listening at ${protocol}://${host}:${port}`);
        });

        serverShutdown.registerServer(server);

        server.on('error', error => {
            logger.error(error.message);
        });

        process.on('SIGTERM', () => {
            serverShutdown.shutdown(() => logger.info('LabShare services shutdown gracefully'));
        });
    }
};
