'use strict';

const proxyquire = require('proxyquire'),
    path = require('path');

describe('PackageUtils', function () {

    let packageUtils,
        directory,
        fsMock;

    beforeEach(function () {
        directory = path.join('path', 'to', 'dir');
        fsMock = jasmine.createSpyObj('fs', ['readdirSync', 'lstatSync', 'unlinkSync', 'realpathSync', 'realpath']);
        packageUtils = proxyquire('../../../../lib/api/utils', {
            'fs': fsMock
        });
    });

    describe('.isPackageSync()', function () {

        let packagesPath;

        beforeEach(function () {
            packageUtils = require('../../../../lib/api/utils');
            packagesPath = './test/fixtures';
        });

        it('checks if a directory contains a LabShare package', function () {
            expect(packageUtils.isPackageSync(packagesPath)).toBeFalsy();
            expect(packageUtils.isPackageSync(path.join(packagesPath, 'main-package'))).toBeTruthy();
        });

    });

    describe('.getPackageName', function () {

        it('finds the name of a package from its manifest', function () {
            expect(packageUtils.getPackageName(null)).toBeNull();
            expect(packageUtils.getPackageName()).toBeNull();
            expect(packageUtils.getPackageName({})).toBeNull();

            expect(packageUtils.getPackageName({
                name: 'PACKAGENAME'
            })).toBe('packagename');
            expect(packageUtils.getPackageName({
                namespace: 'package-namespace',
                name: 'PACKAGENAME'
            })).toBe('package-namespace');
        });

    });

    describe('.getPackageDependencies', function () {

        it('returns an object containing the package\'s LabShare package dependencies', function () {
            var manifest = {
                "name": "name",
                "dependencies": {
                    "lodash": "*"
                },
                "packageDependencies": {
                    "foo": "1.5.9"
                }
            };
            expect(packageUtils.getPackageDependencies(manifest)).toEqual({
                "foo": "1.5.9"
            });
        });

        it('returns an empty object if the package does not specify dependencies or the dependencies could not be read', function () {
            var noPackageDeps = {
                    "name": "name",
                    "dependencies": {
                        "lodash": "*"
                    }
                },
                invalidDepDefinition = {
                    "packageDependencies": []

                };
            expect(packageUtils.getPackageDependencies(noPackageDeps)).toEqual({});
            expect(packageUtils.getPackageDependencies(null)).toEqual({});
            expect(packageUtils.getPackageDependencies(invalidDepDefinition)).toEqual({});
        });

    });

    describe('.getPackageManifest', function () {

        beforeEach(function () {
            spyOn(packageUtils, 'readJSON');
        });

        it('throws with invalid arguments', function () {
            expect(function () {
                packageUtils.getPackageManifest(null);
            }).toThrow();
        });

        it('throws if the manifest does not have a name', function () {
            var emptyManifest = {};
            packageUtils.readJSON.and.returnValue(emptyManifest);
            expect(function () {
                packageUtils.getPackageManifest(directory)
            }).toThrow();
        });

        it('retrieves the directory\'s manifest', function () {
            expect(packageUtils.getPackageManifest(directory)).toBeNull();

            var validManifest = {name: 'pack1'};
            packageUtils.readJSON.and.returnValue(validManifest);
            expect(packageUtils.getPackageManifest(directory)).toBe(validManifest);
        });

    });

    describe('.isIgnored', function () {

        it('checks if a package is ignored by its name', function () {
            expect(packageUtils.isIgnored({name: 'pack1'}, ['pack2', 'pack1'])).toBeTruthy();
            expect(packageUtils.isIgnored({name: 'pack1'}, ['pack2', 'pack2'])).toBeFalsy();
            expect(packageUtils.isIgnored({}, ['pack2', 'pack2'])).toBeFalsy();
            expect(packageUtils.isIgnored({namespace: 'pack1'}, ['pack1', 'pack2'])).toBeTruthy();
            expect(packageUtils.isIgnored(null, ['pack1', 'pack2'])).toBeFalsy();
            expect(packageUtils.isIgnored({name: 'pack3', namespace: 'pack2'}, ['pack1', 'pack2'])).toBeTruthy();
        });

    });

});