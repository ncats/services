'use strict';

/**
 * Return basic application status information:
 * Date the application was started and uptime in JSON format.
 * For example:
 * ```js
 * {
 *  "started": "2014-06-05T00:26:49.750Z",
 *  "uptime": 9.394
 * }
 * ```
 */
module.exports = function status() {
    const started = new Date();

    return (req, res) => {
        res.send({
            started: started,
            uptime: (Date.now() - Number(started)) / 1000,
        });
    };
}
