'use strict';

const path = require('path'),
    supertest = require('supertest'),
    express = require('express'),
    {Router} = express,
    Q = require('q'),
    _ = require('lodash');

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

        it(`assigns all the valid package routes to the given router and runs the configuration functions
            exposed by package API modules`, function (done) {
           
            apiLoader.initialize();
            apiLoader.setAPIs();           

            var promise = Q.all([
                request.get('/api-package-1-namespace/123/_api/hello').expect('Hello World!'),
                request.post('/api-package-1-namespace/123/_api/settings').expect(200),
                request.post('/api-package-1-namespace/open').expect(200),
                request.post('/api-package-2/list/mylist/items').expect(200),
                request.get('/api-package-2/list/mylist/items/123').expect(200),
                request.put('/api-package-2/list/mylist/items/123').expect(400),
                request.delete('/api-package-2/list/mylist/items/123').expect(200)
            ]);

            promise.then(done).catch(done.fail);
        });


        it(`will test if the end points assigned by api/api-config.json are working fine`, function (done) {

             apiLoader.initialize();
                  apiConfig.config({
                apiLoader: apiLoader,
                app: router
            });
            apiLoader.setAPIs(); 

           request.get(`/api-package-1-namespace/endpoints`)
                .expect(200)
                .then(res => {

                    expect(res.text).not.toBe(null);
                    done();
                })

           request.post(`/api-package-1-namespace/endpoints`)
                .expect(200)
                .then(res => {
                    expect(res.body[0].path).toBe("/api-package-1-namespace/:param/_api/hello");
                    expect(res.body[0].httpMethod).toBe("GET");
                    expect(res.body[1].path).toBe("/api-package-1-namespace/:param/_api/settings");
                    expect(res.body[1].httpMethod).toBe("POST");
                    done();
                })
           request.get(`/api-package-1-namespace/version`)
                .expect(200)
                .then(res => {

                    expect(JSON.parse(res.text).name).toBe("api-package-1");
                    expect(JSON.parse(res.text).version).toBe('0.0.1');
                    done();
                })

           request.post(`/api-package-1-namespace/version`)
                .expect(404)
                .then(res => {
                    expect(res.error).toBeTruthy();
                    done();
                })

        });

        it('calls the `config` functions specified by LabShare packages', done => {
            apiLoader.initialize();
            apiLoader.setAPIs();
            apiLoader.setConfig({
                app: router
            });

            // A route set up by the 'config' package API
            request.get('/custom/api/route').expect(200).then(done).catch(done.fail);
        });

        it('logs errors for invalid routes or duplicates', function () {
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

            request.post(`${apiPackage1Prefix}/open`).expect(200)
                .then(done)
                .catch(done.fail);
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
