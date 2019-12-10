'use strict';

const builders = require('../lib/build');
const utils = require('../lib/utils');
const  _ = require('lodash'); 
exports.usage = [
    'lsc services start      - Start up LabShare API services.',
    ''
];
exports.start = async function () {
    this.log.info('Starting LabShare services...');
    const labShareConfig = utils.LabShareConfig.loadLabShareConfig();
    const lbOptions = require('config');
    const mode  =  _.get(labShareConfig, 'mode' , 'services');
    let builder;
    switch(mode){
        case 'services':
                builder = new builders.ServicesBuilder(labShareConfig ,this.config , lbOptions);
            break;
        case 'lb':
                builder = new builders.LbBuilder(labShareConfig , lbOptions);
            break;
    }
    await builder.build();
    return  
  }