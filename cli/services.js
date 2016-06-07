'use strict';

const Services = require('../lib/services');

exports.usage = [
    'lsc services start      - Start LabShare API services',
    ''
];

exports.start = function () {
    this.log.info('Starting LabShare services...');

    let services = new Services();
    services.start();
};
