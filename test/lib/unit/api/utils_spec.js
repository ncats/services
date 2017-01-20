'use strict';

const proxyquire = require('proxyquire'),
    path = require('path');

describe('PackageUtils', () => {

    let packageUtils,
        directory,
        fsMock;

    beforeEach(() => {
        directory = path.join('path', 'to', 'dir');
        fsMock = jasmine.createSpyObj('fs', ['readdirSync', 'lstatSync', 'unlinkSync', 'realpathSync', 'realpath']);
        packageUtils = proxyquire('../../../../lib/api/utils', {
            'fs': fsMock
        });
    });

    describe('.isPackageSync()', () => {

        let packagesPath;

        beforeEach(() => {
            packageUtils = require('../../../../lib/api/utils');
            packagesPath = './test/fixtures';
        });

        it('checks if a directory contains a LabShare package', () => {
            expect(packageUtils.isPackageSync(packagesPath)).toBeFalsy();
            expect(packageUtils.isPackageSync(path.join(packagesPath, 'main-package'))).toBeTruthy();
        });

    });

    describe('.getPackageName', () => {

        it('finds the name of a package from its manifest', () => {
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

    describe('.getPackageDependencies', () => {

        it('returns an object containing the package\'s LabShare package dependencies', () => {
            let manifest = {
                "name": "name",
                "dependencies": {
                    "lodash": "*"
                },
                "packageDependencies": [
                    'foo'
                ]

            };
            expect(packageUtils.getPackageDependencies(manifest)).toEqual(['foo']);
        });

        it('returns an empty object if the package does not specify dependencies or the dependencies could not be read', () => {
            let noPackageDeps = {
                    "name": "name",
                    "dependencies": {
                        "lodash": "*"
                    }
                },
                invalidDepDefinition = {
                    "packageDependencies": 123

                };
            expect(packageUtils.getPackageDependencies(noPackageDeps)).toEqual([]);
            expect(packageUtils.getPackageDependencies(null)).toEqual([]);
            expect(packageUtils.getPackageDependencies(invalidDepDefinition)).toEqual([]);
        });

    });

    describe('.getPackageManifest', () => {

        beforeEach(() => {
            spyOn(packageUtils, 'readJSON');
        });

        it('throws with invalid arguments', () => {
            expect(() => {
                packageUtils.getPackageManifest(null);
            }).toThrow();
        });

        it('throws if the manifest does not have a name', () => {
            let emptyManifest = {};
            packageUtils.readJSON.and.returnValue(emptyManifest);
            expect(() => {
                packageUtils.getPackageManifest(directory)
            }).toThrow();
        });

        it('retrieves the directory\'s manifest', () => {
            expect(packageUtils.getPackageManifest(directory)).toBeNull();

            let validManifest = {name: 'pack1'};
            packageUtils.readJSON.and.returnValue(validManifest);
            expect(packageUtils.getPackageManifest(directory)).toBe(validManifest);
        });

    });

    describe('.isIgnored', () => {

        it('checks if a package is ignored by its name', () => {
            expect(packageUtils.isIgnored({name: 'pack1'}, ['pack2', 'pack1'])).toBeTruthy();
            expect(packageUtils.isIgnored({name: 'pack1'}, ['pack2', 'pack2'])).toBeFalsy();
            expect(packageUtils.isIgnored({}, ['pack2', 'pack2'])).toBeFalsy();
            expect(packageUtils.isIgnored({namespace: 'pack1'}, ['pack1', 'pack2'])).toBeTruthy();
            expect(packageUtils.isIgnored(null, ['pack1', 'pack2'])).toBeFalsy();
            expect(packageUtils.isIgnored({name: 'pack3', namespace: 'pack2'}, ['pack1', 'pack2'])).toBeTruthy();
        });

    });

});