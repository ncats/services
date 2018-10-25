'use strict';

const https = require('https');
const http = require('http');
const fs = require('fs');
const _ = require('lodash');
const ServerShutdown = require('server-shutdown');
const serverShutdown = new ServerShutdown();

module.exports = {
    /**
     *
     * @param {object} expressApp
     * @returns {http.Server|https.Server}
     */
    createServer(expressApp) {
        // TODO: access config using @labshare/lsc ConfigLoader instead a global
        let httpsConfig = _.get(global.LabShare, 'Config.services.HTTPS', {});
        let isHTTPS = httpsConfig.certificate && httpsConfig.privateKey;
        let server;

        // Use HTTPS when certificates are available
        if (isHTTPS) {
            let credentials = {
                key: fs.readFileSync(httpsConfig.privateKey),
                cert: fs.readFileSync(httpsConfig.certificate)
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
