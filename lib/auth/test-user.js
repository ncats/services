/**
 * @exports A fake admin user account for running integration tests.
 */
const _ = require('lodash');

function getFakeAccount() {

    const defaultFakeAccount = {
        id: 9001,
        username: 'axleinfo\\qaadmin1',
        DisplayName: 'FirstLast',
        email: "qaadmin1@mail.com",
        ini: '',
        created: '2015-06-09T05:55:11.000Z',
        count: 0,
        role: 'admin',
        Manager: null,
        ManagerID: null,
        googleId: null
    };

    return _.get(global.LabShare, 'Config.services.Test.User') || defaultFakeAccount;

}

module.exports = getFakeAccount();