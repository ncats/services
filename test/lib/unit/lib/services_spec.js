'use strict';

const supertest = require('supertest'),
    clientio = require('socket.io-client'),
    portfinder = require('portfinder'),
    Services = require('../../../../lib/services'),
    _ = require('lodash');

describe('Services', () => {

    const packagesPath = './test/fixtures/main-package'
    const apiPackage1Prefix = '/socket-api-package-1-namespace'

    let services,
        port,
        loggerMock,
        server,
        options;

    beforeEach(done => {
        loggerMock = jasmine.createSpyObj('logger', ['error', 'info', 'warn']);

        portfinder.getPort((error, unusedPort) => {
            if (error) {
                done.fail(error);
                return;
            }

            port = unusedPort;

            options = {services: {
                    logger: loggerMock,
                    mountPoints: ['/:facilityId'],
                    main: packagesPath,
                    morgan: {
                        enable: false
                    },
                    listen: {
                        port
                    },
                    connections: []
                }} ;

            services = new Services(options);
            done();
        });
    });

    afterEach(() => {
        delete global.LabShare;
    });

    it('sets default configuration', async () => {
        services.config(({app}) => {
            expect(app).toBeDefined();
        });

        expect(_.get(global, 'LabShare.IO')).toBeUndefined();

        server = await services.start();

        let request = supertest(server)

        const data = await request.get('/test-facility/api-package-1-namespace/123/_api/hello')
            .expect(200, 'Hello World!');
        // Check default security headers
        expect(data.headers['x-powered-by']).toBeUndefined();
        expect(data.headers['x-dns-prefetch-control']).toBe('off');
        expect(data.headers['referrer-policy']).toBe('no-referrer');
        expect(data.headers['x-xss-protection']).toBe('1; mode=block');
   });

   it('provides status endpoint', async () => {
     services.config(({app}) => {
       expect(app).toBeDefined();
     });
     server = await services.start();
     let request = supertest(server);
     const res = await request.get('/');
     expect(res.text).toContain('started');
     expect(res.text).toContain('uptime');
   });

   it('supports Redis as a Session backing store', () => {
        options.services.security = {
            sessionOptions: {
                store: 'connect-redis'
            }
        };

        const services = new Services(options);

        services.start();
    });

    it('throws if configuration is applied after the server is started', async () => {
        let services = new Services(options);

        server = await services.start();

        expect(() => {
            services.config();
        }).toThrowError(/cannot modify the LabShare API services after starting up the server/i);
    });

    it('throws if an unsupported session store is set in the configuration', async () => {
        let services = new Services({services: {
            security: {
                sessionOptions: {
                    store: 'INVALID STORE'
                }
            }
        }});
        await expectAsync(services.start()).toBeRejected();
    });
});
