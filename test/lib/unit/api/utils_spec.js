'use strict';

const path = require('path'),
    packageUtils = require('../../../../lib/api/utils');

describe('PackageUtils', () => {

    const packagesPath = './test/fixtures';

    describe('.isPackageSync()', () => {

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

        it('throws with invalid arguments', () => {
            expect(() => {
                packageUtils.getPackageManifest(null);
            }).toThrow();
        });

        it('throws if the manifest does not have a name', () => {
            expect(() => {
                packageUtils.getPackageManifest(path.join(packagesPath, 'files'));
            }).toThrow();
        });

        it('retrieves the directory\'s manifest', () => {
            expect(packageUtils.getPackageManifest('not/a/real/path')).toBeNull();
            expect(packageUtils.getPackageManifest(
                path.join(packagesPath, 'main-package')
            ))
                .toEqual(jasmine.objectContaining({
                    name: 'main-package'
                }));
        });

    });

});