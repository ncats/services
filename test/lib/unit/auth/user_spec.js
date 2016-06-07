var proxyquire = require('proxyquire'),
    EventEmitter = require('events').EventEmitter;

describe('Auth User', function () {

    var authUser,
        requestMock,
        responseMock,
        restlerMock,
        token;

    beforeEach(function () {
        token = 'a token';

        restlerMock = new EventEmitter();
        restlerMock.get = jasmine.createSpy('get').andReturn(restlerMock);

        requestMock = jasmine.createSpy('request');
        responseMock = {
            statusCode: 200
        };

        authUser = proxyquire('../../../../lib/auth/user', {
            'restler': restlerMock
        });
    });

    it('throws with invalid arguments', function () {
        expect(function () {
            authUser(token, null);
        }).toThrow();
    });

    it('fails if the token is missing or empty', function (done) {
        authUser('', function (error) {
            expect(error.message).toMatch(/Invalid token/i);
            done();
        });
    });

    it('succeeds after successfully authenticating', function (done) {
        var userData = {
            username: 'smithm',
            email: 'email@example.com'
        };
        authUser(token, function (error, data) {
            expect(error).toBeNull();
            expect(data).toBe(userData);
            expect(restlerMock.get).toHaveBeenCalledWith(jasmine.any(String), {headers: {'auth-token': token}});
            done();
        });
        restlerMock.emit('complete', userData, responseMock);
    });

    it('fails if the auth response has an invalid format', function (done) {
        var userData = {
            username: null,
            email: 'notAnEmail'
        };
        authUser(token, function (error, data) {
            expect(error.message).toContain('invalid');
            expect(data).toBeUndefined();
            expect(restlerMock.get).toHaveBeenCalledWith(jasmine.any(String), {headers: {'auth-token': token}});
            done();
        });
        restlerMock.emit('complete', userData, responseMock);
    });

    it('fails if the response status is not 200', function (done) {
        responseMock.statusCode = 500;

        authUser(token, function (error, data) {
            expect(error).toBe(500);
            expect(data).toBeUndefined();
            expect(restlerMock.get).toHaveBeenCalledWith(jasmine.any(String), {headers: {'auth-token': token}});
            done();
        });

        restlerMock.emit('complete', null, responseMock);
    });

    it('fails if the response data is an error', function (done) {
        var authError = new Error('auth error');

        authUser(token, function (error, data) {
            expect(error).toBe(authError);
            expect(data).toBeUndefined();
            expect(restlerMock.get).toHaveBeenCalledWith(jasmine.any(String), {headers: {'auth-token': token}});
            done();
        });

        restlerMock.emit('complete', authError, responseMock);
    });

    describe('when a token cache exists', function () {

        beforeEach(function () {
            global.LabShare = {
                Tokens: {
                    getUserForToken: jasmine.createSpy('getUserForToken')
                }
            }
        });

        afterEach(function () {
            delete global.LabShare;
            expect(global.LabShare).toBeUndefined();  // sanity check
        });

        it('gets the user from a token cache instead', function (done) {
            var user = {id: '12345'};
            global.LabShare.Tokens.getUserForToken.andReturn(user);
            authUser(token, function (error, data) {
                expect(error).toBeNull();
                expect(data).toBe(user);
                expect(restlerMock.get).not.toHaveBeenCalled();
                done();
            });
        });

    });

});
