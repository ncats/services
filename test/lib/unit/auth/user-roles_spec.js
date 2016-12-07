'use strict';



describe('userRoles', ()=> {
    let
        accessLevels,
        userRoles,
        buildRolesResult,
        buildAccessLevelsResult;


    beforeEach(() => {
        buildRolesResult =  {
            public : { bitMask : 1, title : 'public' },
            user : { bitMask : 2, title : 'user' },
            staff : { bitMask : 4, title : 'staff' },
            admin : { bitMask : 8, title : 'admin' }
        } ;
        buildAccessLevelsResult = {
            public : { bitMask : 15, title : '*' },
            anon : { bitMask : 1, title : 'public' },
            user : { bitMask : 14, title : 'admin' },
            staff : { bitMask : 12, title : 'admin' },
            admin : { bitMask : 8, title : 'admin' }
        };

        userRoles = require('../../../../lib/auth/user-roles').userRoles;
        accessLevels = require('../../../../lib/auth/user-roles').accessLevels;

    });

    it('success with correct userRoles', ()=> {
        expect(userRoles).toEqual(buildRolesResult);
    });

    it('success with correct accessLevels', ()=> {
        expect(accessLevels).toEqual(buildAccessLevelsResult);
    });

});