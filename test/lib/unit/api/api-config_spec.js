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
            logger: { error: jasmine.createSpy('error') },
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

        it(`will test if the GET /endpoints route assigned by api/api-config.js is working fine`, function (done) {

           request.get(`/api-package-1-namespace/endpoints`)
                .expect(200)
                .then(res => {
                    expect(res.text).not.toBe(null);
                    done();
                })
                .catch(done.fail);

        });
        
         it(`will test if the POST /endpoints route assigned by api/api-config.js is working fine`, function (done) {

           request.post(`/api-package-1-namespace/endpoints`)
                .expect(200)
                .then(res => {
                    expect(res.body[0].path).toBe("/api-package-1-namespace/:param/_api/hello");
                    expect(res.body[0].httpMethod).toBe("GET");
                    expect(res.body[1].path).toBe("/api-package-1-namespace/:param/_api/settings");
                    expect(res.body[1].httpMethod).toBe("POST");
                    done();
                })
                .catch(done.fail);

         });

         it(`will test if the GET /version route assigned by api/api-config.js is working fine`, function (done) {
           request.get("/api-package-1-namespace/version")
                .expect(200)
                .then(res => {
                    expect(JSON.parse(res.text).name).toBe("api-package-1");
                    expect(JSON.parse(res.text).version).toBe('0.0.1');
                    done();
                })
                .catch(done.fail);
        });


         it(`will test if the POST /version route which is NOT assigned by api/api-config.js throws a 404`, function (done) {
           request.post(`/api-package-1-namespace/version`)
                .expect(404)
                .then(res => {
                    expect(res.error).toBeTruthy();
                    done();
                })
                .catch(done.fail);

        });

});