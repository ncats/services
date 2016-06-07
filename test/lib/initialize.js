var supertest = require('supertest-as-promised'),
    socketIOClient = require('socket.io-client');

/*global beforeEach, jasmine, expect, afterEach, describe, spyOn, it*/

module.exports = function initialize(jasmine, callback) {
    jasmine.getEnv().defaultTimeoutInterval = '45000';  // 45 seconds
    var apiURL = _.get(global.LabShare, 'Config.services.Listen.Url', 'http://127.0.0.1') + ':' + _.get(global.LabShare, 'Config.services.Listen.Port', '8000');

    var data = {
        request: supertest(apiURL),
        Socket: socketIOClient,
        apiURL: apiURL
    };

    callback(null, data);
};
