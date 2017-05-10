'use strict';

const Services = require('../lib/services'),
    _ = require('lodash');

exports.usage = [
    'lsc services start      - Start up LabShare API services.',
    ''
];

exports.start = function () {
    this.log.info('Starting LabShare services...');

    let options = _.get(global.LabShare, 'Config.services'),
        services = new Services(options);

    services.start();
};
