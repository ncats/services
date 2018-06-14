'use strict';

const path = require('path');
const supertest = require('supertest');
const express = require('express');
const {Router} = express;
const _ = require('lodash');

function allArgs(spy) {
    return _.flatten(_.map(spy.calls.all(), 'args'));
}

describe('ApiLoader', () => {

    let ApiLoader,
        apiLoader,
        expressApp,
        router,
        packagePath,
        request,
        options,
        apiPackage1Prefix,
        loggerMock, apiConfig;

    beforeEach(() => {
        packagePath = './test/fixtures/main-package';
        loggerMock = {
            error: jasmine.createSpy('error')
        };
        options = {
            logger: loggerMock,
            main: packagePath,
            ignore: []
        };
        apiPackage1Prefix = '/api-package-1-namespace';

        expressApp = express();
        router = Router();

        ApiLoader = require('../../../../lib/api/loader');
        apiConfig = require('../../../../api/api-config');
        apiLoader = new ApiLoader(router, options);
        expressApp.use(router);
        request = supertest(expressApp);
    });

    it('throws an exception when invalid arguments and/or options are provided', () => {
        expect(() => {
            new ApiLoader(router, {
                main: [123]
            });
        }).toThrow();
        expect(() => {
            new ApiLoader({})
        }).toThrow();
        expect(() => {
            new ApiLoader(router, {
                logger: {
                    error: null
                }
            });
        }).toThrow();
        expect(() => {
            new ApiLoader(router, {
                directories: ['a/directory', 5]
            });
        }).toThrow();
    });

    it('does not throw if options are not provided', () => {
        expect(() => {
            new ApiLoader(router);
        }).not.toThrow();
    });

    describe('when loading routes', () => {

        it('assigns all the valid package routes to the given router and runs the configuration functions ' +
            'exposed by package API modules', async () => {
            apiLoader.initialize();
            apiLoader.setAPIs();

            await Promise.all([
                request.get('/api-package-1-namespace/123/_api/hello').expect('Hello World!'),
                request.post('/api-package-1-namespace/123/_api/settings').expect(200),
                request.post('/api-package-1-namespace/open').expect(200),
                request.options('/api-package-2/list/mylist/items').expect(200),
                request.post('/api-package-2/list/mylist/items').expect(200),
                request.get('/api-package-2/list/mylist/items/123').expect(200),
                request.put('/api-package-2/list/mylist/items/123').expect(400),
                request.delete('/api-package-2/list/mylist/items/123').expect(200)
            ]);
        });

        it('calls the `config` functions specified by LabShare packages', async () => {
            apiLoader.initialize();
            apiLoader.setAPIs();
            apiLoader.setConfig({
                app: router
            });

            // A route set up by the 'config' package API
            await request.get('/custom/api/route').expect(200);
        });

        it('does not load APIs from "packageDependencies" recursively', async () => {
            apiLoader.initialize();
            apiLoader.setAPIs();

            await request.get('/nested-api-package/nested/api').expect(404);
        });

        it('logs errors for invalid routes or duplicates', () => {
            options.ignore = [];
            apiLoader = new ApiLoader(router, options);

            apiLoader.initialize();
            apiLoader.setAPIs();

            let errors = allArgs(options.logger.error).join(' ');

            expect(errors).toContain('Error: Invalid HTTP method specified for route /invalid-api-package/list/:listName/items/:id from package invalid-api-package');
            expect(errors).toContain('Error: Invalid route "{"httpMethod":"POST","middleware":[null]}" from package "invalid-api-package": path is required');
            expect(errors).toContain('Error: Invalid route "{"path":"/list/:listName/items/:id","httpMethod":"DELETE"}" from package "invalid-api-package": middleware is required');
            expect(errors).toContain('Error: Invalid route "{"path":"/documents","middleware":[null]}" from package "invalid-api-package": httpMethod is required');
        });

        it('throws exceptions for invalid routes if a logger is not provided', () => {
            options.logger = null;
            apiLoader = new ApiLoader(router, options);

            expect(() => {
                apiLoader.initialize();
            }).toThrow();
        });

        it('can load package APIs from directories specified by options.directories', async () => {
            apiLoader = new ApiLoader(router, {
                directories: [path.join(packagePath, 'node_modules', 'api-package1')]
            });

            apiLoader.initialize();
            apiLoader.setAPIs();

            await request.post(`${apiPackage1Prefix}/open`).expect(200);
        });

        it('does not store duplicate routers in the router', () => {
            const apiPackage1Path = path.join(packagePath, 'node_modules', 'api-package1');

            apiLoader = new ApiLoader(router, {
                directories: [apiPackage1Path, apiPackage1Path, apiPackage1Path]
            });

            apiLoader.initialize();
            apiLoader.setAPIs();

            expect(router.stack.length).toBe(1);
        });

    });

});
