'use strict';

const supertest = require('supertest-as-promised'),
    _ = require('lodash');

describe('Services', () => {

    let packagesPath,
        Services,
        services,
        loggerMock,
        options;

    beforeEach(() => {
        packagesPath = './test/fixtures/main-package';
        loggerMock = jasmine.createSpyObj('logger', ['error', 'info', 'warn']);
        options = {
            logger: loggerMock,
            loaderOptions: {
                main: packagesPath,
                logger: loggerMock
            },
            morgan: {
                enable: false
            }
        };

        Services = require('../../../../lib/services');
        services = new Services(options);
    });

    afterEach(() => {
        delete global.LabShare;
    });

    it('sets default configuration', done => {
        services.config(({services, app}) => {
            expect(_.values(services).length).toBeGreaterThan(0);
            expect(app).toBeDefined();
        });

        expect(_.get(global, 'LabShare.IO')).toBeUndefined();

        let server = services.start(),
            request = supertest(server);

        expect(global.LabShare.IO).toBeDefined();

        request.get('/api-package-1-namespace/123/_api/hello')
            .expect('Hello World!')
            .then(data => {
                // Check default security headers
                expect(data.headers['x-powered-by']).toBeUndefined();
                expect(data.headers['access-control-allow-origin']).toBe('*');
                expect(data.headers['x-dns-prefetch-control']).toBe('off');
                expect(data.headers['referrer-policy']).toBe('no-referrer');
                expect(data.headers['x-xss-protection']).toBe('1; mode=block');

                done();
            })
            .catch(done.fail);
    });

    it('throws if configuration is applied after the server is started', () => {
        let services = new Services(options);

        services.start();

        expect(() => {
            services.config();
        }).toThrowError(/cannot modify the LabShare API services after starting up the server/i);
    });

});
