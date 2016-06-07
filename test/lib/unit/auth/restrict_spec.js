var proxyquire = require('proxyquire');

describe('restrict', function () {

    var restrict,
        requestMock,
        responseMock,
        authUserMock,
        next;

    beforeEach(function () {
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

    it('calls next() immediately if the header does not contain an auth token', function () {
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

    it('stores the user data on the request if authentication succeeds', function () {
        var userData = {
            username: 'smithm',
            email: 'email@example.com'
        };
        authUserMock.andCallFake(function (token, cb) {
            cb(null, userData);
        });
        requestMock.headers = {
            'auth-token': 'an-auth-token'
        };

        restrict(requestMock, responseMock, next);

        expect(requestMock.user).toBe(userData);
        expect(next).toHaveBeenCalled();
    });

    it('responds with an error status if user authentication fails', function () {
        var authError = new Error('auth error');
        authUserMock.andCallFake(function (token, cb) {
            cb(authError);
        });
        requestMock.headers = {
            'auth-token': 'an-auth-token'
        };

        restrict(requestMock, responseMock, next);

        expect(responseMock.sendStatus).toHaveBeenCalledWith(401);
    });

    it('fails if there was an invalid response', function () {
        var authError = new Error('invalid response');
        authError.code = 'INVALID_RESPONSE';

        authUserMock.andCallFake(function (token, cb) {
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