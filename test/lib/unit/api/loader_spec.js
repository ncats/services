'use strict';

const path = require('path'),
    proxyquire = require('proxyquire'),
    supertest = require('supertest-as-promised'),
    express = require('express'),
    {Router} = express,
    Q = require('q'),
    _ = require('lodash');

require('promise-matchers');

function allArgs(spy) {
    return _.flatten(_.map(spy.calls, 'args'));
}

describe('ApiLoader', function () {

    var ApiLoader,
        apiLoader,
        expressApp,
        router,
        packagePath,
        request,
        options,
        apiPackage1Prefix,
        loggerMock,
        ensureAuthorizedMock;

    beforeEach(function () {
        packagePath = './test/fixtures/main-package';
        loggerMock = {
            error: jasmine.createSpy('error')
        };
        ensureAuthorizedMock = jasmine.createSpy('ensureAuthorized').andCallFake(function () {
            return function (req, res, next) {
                next();
            }
        });
        options = {
            logger: loggerMock,
            main: packagePath
        };
        apiPackage1Prefix = '/api-package-1-namespace';

        expressApp = express();
        router = Router();

        ApiLoader = proxyquire('../../../../lib/api/loader', {
            '../auth': {
                EnsureAuthorized: ensureAuthorizedMock
            }
        });
        apiLoader = new ApiLoader(router, options);
        expressApp.use(router);
        request = supertest(expressApp);
    });

    it('throws an exception when invalid arguments and/or options are provided', function () {
        expect(function () {
            new ApiLoader(router, {
                main: [123]
            });
        }).toThrow();
        expect(function () {
            new ApiLoader({})
        }).toThrow();
        expect(function () {
            new ApiLoader(router, {
                logger: {
                    error: null
                }
            });
        }).toThrow();
        expect(function () {
            new ApiLoader(router, {
                directories: ['a/directory', 5]
            });
        }).toThrow();
    });

    it('does not throw if options are not provided', function () {
        expect(function () {
            new ApiLoader(router);
        }).not.toThrow();
    });

    describe('when loading routes', function () {

        it('assigns all the valid package routes to the given router and runs the configuration functions ' +
            'exposed by package API modules', function (done) {
            apiLoader.initialize();
            apiLoader.setAPIs();

            var promise = Q.all([
                request.get('/api-package-1-namespace/123/_api/hello').expect('Hello World!'),
                request.post('/api-package-1-namespace/123/_api/settings').expect(200),
                request.post('/api-package-1-namespace/open').expect(200),
                request.post('/api-package-2/list/mylist/items').expect(200),
                request.get('/api-package-2/list/mylist/items/123').expect(200),
                request.put('/api-package-2/list/mylist/items/123').expect(400),
                request.delete('/api-package-2/list/mylist/items/123').expect(200),
            ]);

            expect(promise).toHaveBeenResolvedWith(done, function () {
                expect(ensureAuthorizedMock).toHaveBeenCalled();
            });
        });

        it('calls the `config` functions specified by LabShare packages', done => {
            apiLoader.initialize();
            apiLoader.setAPIs();
            apiLoader.setConfig({
                app: router
            });

            // A route set up by the 'config' package API
            expect(request.get('/custom/api/route').expect(200)).toHaveBeenResolvedWith(done, () => {
                expect(ensureAuthorizedMock).toHaveBeenCalled();
            });
        });

        it('logs errors for invalid routes or duplicates', function () {
            apiLoader.initialize();
            apiLoader.setAPIs();

            var errors = allArgs(options.logger.error).join(' ');

            expect(errors).toContain('Error: Invalid HTTP method specified for route /list/:listName/items/:id from package api-package-2');
            expect(errors).toContain('Error: Invalid route "{"httpMethod":"POST","middleware":[null]}" from package "api-package-2": path is required');
            expect(errors).toContain('Error: Invalid route "{"path":"/list/:listName/items/:id","httpMethod":"DELETE"}" from package "api-package-2": middleware is required');
            expect(errors).toContain('Error: Invalid route "{"path":"/documents","middleware":[null]}" from package "api-package-2": httpMethod is required');
        });

        it('throws exceptions for invalid routes if a logger is not provided', function () {
            options.logger = null;
            apiLoader = new ApiLoader(router, options);

            expect(function () {
                apiLoader.initialize();
            }).toThrow();
        });

        it('can ignore packages by name', function (done) {
            options.ignore = ['api-package-1'];

            apiLoader = new ApiLoader(router, options);
            apiLoader.initialize();
            apiLoader.setAPIs();

            request.post(apiPackage1Prefix + '/open').expect(404, done);
        });

        it('can load package APIs from directories specified by options.directories', function (done) {
            apiLoader = new ApiLoader(router, {
                directories: [path.join(packagePath, 'node_modules', 'api-package1')]
            });
            apiLoader.initialize();
            apiLoader.setAPIs();

            expect(Q.all([
                request.post('/api-package-1-namespace/open').expect(200),
                request.post('/api-package-1-namespace/list/mylist/items').expect(404)
            ])).toHaveBeenResolved(done);
        });

        it('does not store duplicate routers in the router', function () {
            var apiPackage1Path = path.join(packagePath, 'node_modules', 'api-package1');
            apiLoader = new ApiLoader(router, {
                directories: [apiPackage1Path, apiPackage1Path, apiPackage1Path]
            });

            apiLoader.initialize();
            apiLoader.setAPIs();

            expect(router.stack.length).toBe(1);
        });

    });

});
