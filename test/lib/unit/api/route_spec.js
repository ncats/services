'use strict';

const path = require('path');

describe('Route', () => {

    let Route,
        packageName;

    beforeEach(() => {
        packageName = 'session';
        Route = require('../../../../lib/api/route');
    });

    it('throws an exception when it fails validation', () => {
        let packageName = 'session';

        expect(() => {
            new Route(packageName, {})
        }).toThrowError(/Invalid route.*/);

        expect(() => {
            new Route(packageName, {
                httpMethod: 'GET',
                middleware: [() => {}]
            })
        }).toThrowError(/path is required/);

        expect(() => {
            new Route(packageName, {
                middleware: [() => {}],
                path: '/my/api'
            })
        }).toThrowError(/httpMethod is required/);

        expect(() => {
            new Route(packageName, {
                httpMethod: 'GET',
                path: '/my/api'
            })
        }).toThrowError(/middleware is required/);
    });

    it('namespaces the path with the package name', () => {
        let route = new Route(packageName, {
            httpMethod: 'GET',
            middleware: [() => {}],
            path: '/my/api'
        });

        expect(route.path).toBe(`/${packageName}/my/api`);

        route = new Route(packageName, {
            httpMethod: 'GET',
            middleware: [() => {}],
            path: '/sessions/my/api'
        });

        expect(route.path).toBe(`/${packageName}/sessions/my/api`);
    });

    it('does not duplicate the package namespace', () => {
        let route = new Route(packageName, {
            httpMethod: 'GET',
            middleware: [() => {}],
            path: `${packageName}/my/api`  // leading slash intentionally omitted
        });

        expect(route.path).toBe(`/${packageName}/my/api`);
    });

});
