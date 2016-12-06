'use strict';


describe('userRoles', function() {
    var userRoles,
        accessLevels,
        bitMask,
        accessLevels,
        title,
        buildRoles;
    beforeEach(function(){
        userRoles = {};
        bitMask = "01";
        accessLevels = {};
        title = {};
        buildRoles = require('./user-roles');
    });
    // toMatch(), may be needs to change
   /* it('fails if the argument is missing or empty', function() {
        buildRoles('',()=> {
            expect(bitMask).toEqual("01");
            done();
        });
        expect(() => {
            buildRoles(userRoles);
        }).toThrow();
    });*/
    //
    it('fails with invalid arguments', done => {
        let userRoles = {
            roles: ['private']
        };
        let bitmask = "01";
        expect(() => {
            buildRoles(userRoles);
        }).toEqual("");
    });
    //
    it('Builds a distinct bit mask for each role', done => {
       let userRoles = {
           roles:['public'],
           accessLevels:{'public': "*"}
       };

        buildRoles(userRoles, (error, data) => {
            expect(error).toBeNull();
            expect(data).toEqual(userRoles);
            done();
        });
    });
    //

});

