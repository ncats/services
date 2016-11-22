'use strict';

describe('ensureAuthorized', () => {

    var ensureAuthorized,
        middleware,
        requestMock,
        responseMock,
        route,
        next;

    beforeEach(() => {
        requestMock = jasmine.createSpy('request');
        responseMock = {
            sendStatus: jasmine.createSpy('send')
        };
        next = jasmine.createSpy('next');

        ensureAuthorized = require('../../../../lib/auth/ensure-authorized');
    });

    it('throws with invalid arguments', () => {
        expect(() => {
            ensureAuthorized(null);
        }).toThrow();
    });

    it('allows users to access routes that match their role', () => {
        route = { accessLevel: 'public' };
        middleware = ensureAuthorized(route);
        requestMock.user = {
            role: 'public'
        };

        middleware(requestMock, responseMock, next);

        expect(next).toHaveBeenCalled();
    });

    it('prevents users from accessing routes that do not match their role', () => {
        route = { accessLevel: 'admin' };
        middleware = ensureAuthorized(route);
        requestMock.user = null;

        middleware(requestMock, responseMock, next);

        expect(responseMock.sendStatus).toHaveBeenCalledWith(403);
    });

    it('defaults to accessLevel "public" if a route does not define an "accessLevel"', () => {
        route = { accessLevel: null };
        middleware = ensureAuthorized(route);
        requestMock.user = {
            role: 'public'
        };

        middleware(requestMock, responseMock, next);

        expect(next).toHaveBeenCalled();
    });

    it('allows userRoles to be aliased as strings', () => {
        route = { accessLevel: null };
        middleware = ensureAuthorized(route);
        requestMock.user = {
            role: 'public'
        };

        middleware(requestMock, responseMock, next);

        expect(next).toHaveBeenCalled();
    });

});