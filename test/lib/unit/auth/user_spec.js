'use strict';

const proxyquire = require('proxyquire'),
    nock = require('nock');

describe('Auth User', () => {

    let authUser,
        authMe,
        token;

    beforeEach(() => {
        token = 'a token';
        authMe = nock('https://a.labshare.org').get('/_api/auth/me');
        authUser = require('../../../../lib/auth/user');
    });

    afterEach(() => {
        nock.cleanAll();
    });

    it('throws with invalid arguments', () => {
        expect(() => {
            authUser(token, null);
        }).toThrow();
    });

    it('fails if the token is missing or empty', done => {
        authUser('', error => {
            expect(error.message).toMatch(/Invalid token/i);
            done();
        });
    });

    it('succeeds after successfully authenticating', done => {
        let userData = {
            username: 'smithm',
            email: 'email@example.com'
        };

        authMe.reply(200, () => {
            expect(authMe.req.headers['auth-token']).toBe(token);
            return userData;
        });

        authUser(token, (error, data) => {
            expect(error).toBeNull();
            expect(data).toEqual(userData);
            done();
        });
    });

    it('fails if the auth response has an invalid format', done => {
        let userData = {
            username: null,
            email: 'notAnEmail'
        };

        authMe.reply(200, userData);

        authUser(token, (error, data) => {
            expect(error.message).toContain('invalid');
            expect(data).toBeUndefined();
            done();
        });
    });

    it('fails if the response status is not 200', done => {
        authMe.reply(500, {});

        authUser(token, (error, data) => {
            expect(error).toBe(500);
            expect(data).toBeUndefined();
            done();
        });
    });

    describe('when a global token cache exists', () => {

        beforeEach(() => {
            global.LabShare = {
                Tokens: {
                    getUserForToken: jasmine.createSpy('getUserForToken')
                }
            }
        });

        afterEach(() => {
            delete global.LabShare;
            expect(global.LabShare).toBeUndefined();  // sanity check
        });

        it('gets the user from a token cache instead', done => {
            var user = {id: '12345'};

            global.LabShare.Tokens.getUserForToken.andReturn(user);

            authUser(token, (error, data) => {
                expect(error).toBeNull();
                expect(data).toBe(user);
                done();
            });
        });

    });

});
