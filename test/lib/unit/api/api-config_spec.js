'use strict';

const path = require('path'),
    supertest = require('supertest'),
    express = require('express'),
    {Router} = express;

describe('ApiConfig', () => {
    let ApiLoader,
        apiLoader,
        expressApp,
        router,
        request,
        apiPackage1Prefix,
        apiConfig;

    beforeEach(() => {
        apiPackage1Prefix = '/api-package-1-namespace';

        expressApp = express();
        router = Router();

        ApiLoader = require('../../../../lib/api/loader');
        apiConfig = require('../../../../api/api-config');
        apiLoader = new ApiLoader(router, {
            logger: {error: jasmine.createSpy('error')},
            main: './test/fixtures/main-package',
            ignore: []
        });
        expressApp.use(router);
        request = supertest(expressApp);

        apiLoader.initialize();
        apiConfig.config({
            apiLoader: apiLoader,
            app: router
        });
        apiLoader.setAPIs();
    });

    describe('GET/POST /endpoints', () => {

        it(`gets all the API endpoints associated with the given LabShare package name`, done => {
            request.get(`/api-package-1-namespace/endpoints`)
                .expect(200)
                .then(res => {
                    expect(res.text).not.toBe(null);
                    done();
                })
                .catch(done.fail);
        });

        it(`gets all the API endpoints associated with the given LabShare package name`, done => {
            request.post(`/api-package-1-namespace/endpoints`)
                .expect(200)
                .then(res => {
                    expect(res.body[0].path).toBe('/api-package-1-namespace/:param/_api/hello');
                    expect(res.body[0].httpMethod).toBe('GET');
                    expect(res.body[1].path).toBe('/api-package-1-namespace/:param/_api/settings');
                    expect(res.body[1].httpMethod).toBe('POST');
                    done();
                })
                .catch(done.fail);
        });

    });

    describe('GET /versions and GET /:name/version', () => {

        it(`gets the package metadata of all LabShare packages that expose HTTP routes`, done => {
            request.get('/versions')
                .expect(200)
                .then(res => {
                    expect(res.body.versions).toBeDefined();

                    let versions = res.body.versions;

                    expect(versions).toEqual(jasmine.arrayContaining([
                        {
                            api: 'api-package-1-namespace',
                            apiDetails: {
                                name: 'api-package-1',
                                version: '0.0.1',
                                description: 'Api package name space'
                            }
                        },
                        {
                            api: 'api-package-2',
                            apiDetails: {
                                name: 'api-package-2',
                                version: '0.0.1'
                            }
                        }
                    ]));

                    done();
                })
                .catch(done.fail);
        });

        it(`gets the metadata of an individual LabShare package`, done => {
            request.get('/api-package-2/version')
                .expect(200)
                .then(res => {
                    expect(res.body.version.api).toBe('api-package-2');
                    expect(res.body.version.apiDetails.version).toBe('0.0.1');
                    done();
                })
                .catch(done.fail);
        });

        it(`responds with a 404 when the LabShare package name does not exist`, done => {
            request.post(`/api-package-1-namespace/version`).expect(404, done);
        });

    });
});
