'use strict';

const proxyquire = require('proxyquire');

describe('restrict', () => {

    let restrict,
        requestMock,
        responseMock,
        authUserMock,
        next,
        userData;

    beforeEach(function () {
        userData = {
            username: 'smithm',
            email: 'email@example.com'
        };
        authUserMock = jasmine.createSpy('authUser');
        requestMock = jasmine.createSpy('request');
        responseMock = {
            sendStatus: jasmine.createSpy('sendStatus'),
            send: jasmine.createSpy('send'),
            status: jasmine.createSpy('status')
        };
        next = jasmine.createSpy('next');

        restrict = proxyquire('../../../../lib/auth/restrict', {
            './user': authUserMock
        });
    });

    it('calls next() immediately if the header does not contain an auth token', () => {
        requestMock.headers = {
            'auth-token': null
        };
        restrict(requestMock, responseMock, next);

        requestMock.headers = {
            'auth-token': ''
        };
        restrict(requestMock, responseMock, next);

        requestMock.headers = null;
        restrict(requestMock, responseMock, next);

        expect(requestMock.user).toBeUndefined();
        expect(next.calls.length).toBe(3);
    });

    it('stores the user data on the request and session if authentication succeeds', () => {
        authUserMock.andCallFake((token, cb) => {
            cb(null, userData);
        });
        requestMock = {
            headers: {
                'auth-token': 'an-auth-token'
            },
            session: {}
        };

        restrict(requestMock, responseMock, next);

        expect(requestMock.user).toBe(userData);
        expect(requestMock.session.user).toBe(userData);
        expect(next).toHaveBeenCalled();
    });

    it('does not make another auth request if the user is already logged in', () => {
        requestMock = {
            headers: {
                'auth-token': 'an-auth-token'
            },
            session: {
                user: userData
            }
        };

        restrict(requestMock, responseMock, next);

        expect(authUserMock).not.toHaveBeenCalled();
        expect(requestMock.user).toBe(userData);
        expect(next).toHaveBeenCalled();
    });

    it('responds with an error status if user authentication fails', () => {
        let authError = new Error('auth error');
        authUserMock.andCallFake((token, cb) => {
            cb(authError);
        });
        requestMock.headers = {
            'auth-token': 'an-auth-token'
        };

        restrict(requestMock, responseMock, next);

        expect(responseMock.sendStatus).toHaveBeenCalledWith(401);
    });

    it('fails if there was an invalid response', () => {
        let authError = new Error('invalid response');
        authError.code = 'INVALID_RESPONSE';

        authUserMock.andCallFake((token, cb) => {
            cb(authError);
        });
        requestMock.headers = {
            'auth-token': 'an-auth-token'
        };

        restrict(requestMock, responseMock, next);

        expect(responseMock.send).toHaveBeenCalledWith({error: 'invalid response'});
        expect(responseMock.status).toHaveBeenCalledWith(401);
    });

});