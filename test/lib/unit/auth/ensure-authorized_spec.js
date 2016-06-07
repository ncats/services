var accessLevels = require('../../../../lib/auth').AccessLevels,
    userRoles = require('../../../../lib/auth').UserRoles;

describe('ensureAuthorized', function () {

    var ensureAuthorized,
        middleware,
        requestMock,
        responseMock,
        route,
        next;

    beforeEach(function () {
        requestMock = jasmine.createSpy('request');
        responseMock = {
            sendStatus: jasmine.createSpy('send')
        };
        next = jasmine.createSpy('next');

        ensureAuthorized = require('../../../../lib/auth/ensure-authorized');
    });

    it('throws with invalid arguments', function () {
        expect(function () {
            ensureAuthorized(null);
        }).toThrow();
    });

    it('allows users to access routes that match their role', function () {
        route = { accessLevel: accessLevels.public };
        middleware = ensureAuthorized(route);
        requestMock.user = {
            role: userRoles.public
        };

        middleware(requestMock, responseMock, next);

        expect(next).toHaveBeenCalled();
    });

    it('prevents users from accessing routes that do not match their role', function () {
        route = { accessLevel: accessLevels.admin };
        middleware = ensureAuthorized(route);
        requestMock.user = null;

        middleware(requestMock, responseMock, next);

        expect(responseMock.sendStatus).toHaveBeenCalledWith(403);
    });

    it('defaults to accessLevel "public" if a route does not define an "accessLevel"', function () {
        route = { accessLevel: null };
        middleware = ensureAuthorized(route);
        requestMock.user = {
            role: userRoles.public
        };

        middleware(requestMock, responseMock, next);

        expect(next).toHaveBeenCalled();
    });

    it('allows userRoles to be aliased as strings (e.g. "public" gets converted to {bitMask: 1, title: "public"})', function () {
        route = { accessLevel: null };
        middleware = ensureAuthorized(route);
        requestMock.user = {
            role: 'public'
        };

        middleware(requestMock, responseMock, next);

        expect(next).toHaveBeenCalled();
    });

});