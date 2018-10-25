'use strict';

const supertest = require('supertest'),
    clientio = require('socket.io-client'),
    portfinder = require('portfinder'),
    Services = require('../../../../lib/services'),
    _ = require('lodash');

describe('Services', () => {

    const packagesPath = './test/fixtures/main-package',
        apiPackage1Prefix = '/socket-api-package-1-namespace';

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

            options = {
                logger: loggerMock,
                main: packagesPath,
                morgan: {
                    enable: false
                },
                listen: {
                    port
                },
                connections: []
            };

            services = new Services(options);

            done();
        });
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

        server = services.start();

        let request = supertest(server),
            clientSocket = clientio.connect(`http://localhost:${port}${apiPackage1Prefix}`);

        expect(global.LabShare.IO).toBeDefined();

        request.get('/api-package-1-namespace/123/_api/hello')
            .expect(200, 'Hello World!')
            .then(data => {
                // Check default security headers
                expect(data.headers['x-powered-by']).toBeUndefined();
                expect(data.headers['x-dns-prefetch-control']).toBe('off');
                expect(data.headers['referrer-policy']).toBe('no-referrer');
                expect(data.headers['x-xss-protection']).toBe('1; mode=block');

                // Test socket connections
                clientSocket.once('connect', () => {
                    clientSocket.emit('process-something', 'Data', (error, data) => {
                        expect(data).toBe('data');

                        clientSocket.disconnect();
                        done();
                    });
                });
            })
            .catch(done.fail);
    });

    it('supports Redis as a Session backing store', () => {
        options.security = {
            sessionOptions: {
                store: 'connect-redis'
            }
        };

        const services = new Services(options);

        services.start();
    });

    it('throws if configuration is applied after the server is started', () => {
        let services = new Services(options);

        server = services.start();

        expect(() => {
            services.config();
        }).toThrowError(/cannot modify the LabShare API services after starting up the server/i);
    });

    it('throws if an unsupported session store is set in the configuration', () => {
        let services = new Services({
            security: {
                sessionOptions: {
                    store: 'INVALID STORE'
                }
            }
        });

        expect(() => {
            services.start();
        }).toThrowError(/Session store "INVALID STORE" is not supported/i);
    });

});
