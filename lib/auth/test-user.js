/**
 * @exports A fake admin user account for running integration tests.
 */
const _ = require('lodash');

function getFakeAccount() {
    let role = _.get(global.LabShare, 'Config.services.Test.Role'),
        fakeUser;

    if (role) {
        fakeUser = {
            role: role
        }
    }
    else {
        fakeUser = {
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
        }
    }
    return fakeUser
}

module.exports = getFakeAccount();