'use strict';

module.exports = function init(done) {
    global.LabShare.UserRoles = require('../lib/auth').UserRoles;
    global.LabShare.AccessLevels = require('../lib/auth').AccessLevels;

    done();
};
