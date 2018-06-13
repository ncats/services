'use strict';

const supertest = require('supertest');
const express = require('express');
const {Router} = express;
const ApiLoader = require('../../../../lib/api/loader');
const apiConfig = require('../../../../api/api-config');

describe('ApiConfig', () => {

    let apiLoader,
        expressApp,
        router,
        request;

    beforeEach(() => {
        expressApp = express();
        router = Router();

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

        it(`gets all the API endpoints associated with the given LabShare package name`, async () => {
            const res = await request.get(`/api-package-1-namespace/endpoints`);

            expect(res.statusCode).toBe(200);
            expect(res.text).not.toBe(null);
        });

        it(`gets all the API endpoints associated with the given LabShare package name`, async () => {
            const res = await request.post(`/api-package-1-namespace/endpoints`)
                .expect(200);

            expect(res.body[0].path).toBe('/api-package-1-namespace/:param/_api/hello');
            expect(res.body[0].httpMethod).toBe('GET');
            expect(res.body[1].path).toBe('/api-package-1-namespace/:param/_api/settings');
            expect(res.body[1].httpMethod).toBe('POST');
        });

    });

    describe('GET /versions and GET /:name/version', () => {

        it(`gets the package metadata of all LabShare packages that expose HTTP routes`, async () => {
            const res = await request.get('/versions')
                .expect(200);

            expect(res.body.versions).toBeDefined();

            const versions = res.body.versions;

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
        });

        it(`gets the metadata of an individual LabShare package`, async () => {
            const res = await request.get('/api-package-2/version');

            expect(res.statusCode).toBe(200);
            expect(res.body.version).toBeDefined();
            expect(res.body.version.api).toBe('api-package-2');
            expect(res.body.version.apiDetails.version).toBe('0.0.1');
        });

        it(`responds with a 404 when the LabShare package name does not exist`, async () => {
            await request.post(`/api-package-1-namespace/version`).expect(404);
        });

    });
});
