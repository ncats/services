'use strict';

/**
 * This module defines utility functions for working with LabShare packages.
 */

const glob = require('glob'),
    path = require('path'),
    assert = require('assert'),
    fs = require('fs'),
    Q = require('q'),
    _ = require('lodash');

/**
 * @param manifest A LabShare package package.json
 * @returns {Object} Containing LabShare package dependencies or an empty object
 */
exports.getPackageDependencies = function getPackageDependencies(manifest) {
    return (_.isObject(manifest) && _.isObject(manifest.packageDependencies))
        ? manifest.packageDependencies
        : {};
};

/**
 * Throws an exception if the pattern is empty or glob.sync has an error.
 *
 * @param {String} directory
 * @param {String} pattern A glob pattern
 * @returns {Array} of absolute file paths
 */
exports.getMatchingFilesSync = function (directory, pattern) {
    return glob.sync(pattern, {cwd: directory}).map((file) => {
        return path.resolve(directory, file);
    });
};

/**
 * @param {Object} manifest A parsed package.json
 * @param {Array} ignored A list of ignored LabShare package names
 * @returns {Boolean} True if the given package is ignored by the loader, otherwise false
 */
exports.isIgnored = function (manifest, ignored) {
    return manifest && exports.getPackageName(manifest)
        && _.some(ignored, function isIgnored(name) {
            return manifest.name === name || manifest.namespace === name;
        })
};

/**
 * @description Checks if the directory contains a LabShare package.
 * @param {string} directory
 * @returns {Boolean}
 */
exports.isPackageSync = function isPackageSync(directory) {
    try {
        var manifest = exports.getPackageManifest(directory);
        return !!manifest;
    } catch (e) {
        return false;
    }
};

/**
 * @Throws Error when the parsed manifest does not contain a 'name' property.
 *
 * @param {String} directory - A path to a directory
 * @returns {Object} containing parsed package.json data, otherwise null/undefined
 */
exports.getPackageManifest = function (directory) {
    assert.ok(_.isString(directory), 'getPackageManifest: `directory` must be a non-empty string');

    let manifestPath = path.resolve(directory, 'package.json'),
        manifest = exports.readJSON(manifestPath);

    if (!manifest) {
        return null;
    } else if (!exports.getPackageName(manifest)) {
        throw new Error(manifestPath + ' is missing a `name` property');
    }

    return manifest;
};

/**
 * @description Helper function for reading JSON files. It returns undefined if the JSON file does not
 * exist.
 * @throws Error if the JSON file could not be parsed
 * @param {string} filePath - The path to a JSON file
 * @returns {Object|undefined}
 */
exports.readJSON = function (filePath) {
    assert.ok(_.isString(filePath) && !_.isEmpty(filePath), 'readJSON: `filePath` must be a non-empty string');

    filePath = path.resolve(filePath);
    try {
        return JSON.parse(fs.readFileSync(filePath, {encoding: 'utf8'}));
    } catch (error) {
        if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') {
            if (error.name === 'SyntaxError') {
                error.message = `Failed to parse: "${filePath}". ${error.message}`;
            }
            throw error;
        }
    }
};

/**
 * @description Retrieves the LabShare package's name
 * @param {Object} manifest - A package.json parsed into a JS object
 */
exports.getPackageName = function (manifest) {
    if (!manifest || !(manifest.namespace || manifest.name))
        return null;
    return (manifest.namespace || manifest.name).toLowerCase();
};

/**
 * @description Synchronously applies the given function to each LabShare package inside the given directory.
 * If one of the packages is a symlink, it will locate the original symlink source directory
 * and call the function on it instead.
 * @throws Error if the given root is not a LabShare package, or when a package dependency was not found in the top level Node Modules directory
 * @param {String} directory - A path to a directory containing LabShare package.
 * @param {Function} func - A function that accepts a path to a LabShare project
 * @param thisArg The context of `func`
 */
exports.applyToNodeModulesSync = function applyToNodeModulesSync(directory, func, thisArg) {
    assert.ok(_.isString(directory), 'applyToNodeModulesSync: `root` must be a non-empty string');
    assert.ok(_.isFunction(func), 'applyToNodeModulesSync: `func` must be a function');

    let loadedDependencies = {};

    if (!exports.isPackageSync(directory)) {
        throw new Error(`${directory} must contain a LabShare package!`);
    }

    function getDependenciesRecursively(packagePath) {
        let manifest = exports.getPackageManifest(packagePath),
            dependencies = exports.getPackageDependencies(manifest),
            dependencyPaths = [],
            id = path.basename(packagePath);

        func.call(thisArg, packagePath);
        loadedDependencies[id] = true;

        _.each(dependencies, (version, dependencyName) => {
            let dependencyPath = path.join(directory, 'node_modules', dependencyName);
            if (!exports.isPackageSync(dependencyPath)) {
                throw new Error(`Package dependency: "${dependencyName}" does not exist in "${dependencyPath}". Make sure it is installed!`);
            }
            dependencyPaths.push(dependencyPath);
        });

        // Recursively search for any other dependencies
        _.map(dependencyPaths, dependencyPath => {
            var id = path.basename(dependencyPath);
            if (!_.has(loadedDependencies, id)) {
                return getDependenciesRecursively(dependencyPath);
            }
        });
    }

    getDependenciesRecursively(directory);
};

/**
 * @description Asynchronously applies the given function to each LabShare package inside the given directory's Node Modules.
 * @param {String} directory - A path to a directory containing a LabShare package.
 * @param {Function} func A function that accepts a directory path
 * @param thisArg The context of `func`
 * @returns {Promise} It resolves after successfully applying the function to each element otherwise it rejects.
 */
exports.applyToNodeModules = function applyToNodeModules(directory, func, thisArg) {
    try {
        assert.ok(_.isString(directory), 'applyToNodeModules: `root` must be a non-empty string');
        assert.ok(_.isFunction(func), 'applyToNodeModules: `func` must be a function');
    } catch (error) {
        return Q.reject(error);
    }

    let loadedDependencies = {},
        promises = [];

    if (!exports.isPackageSync(directory)) {
        return Q.reject(new Error(`${directory} must contain a LabShare package!`));
    }

    function getDependenciesRecursively(packagePath) {
        let manifest = exports.getPackageManifest(packagePath),
            dependencies = exports.getPackageDependencies(manifest),
            dependencyPaths = [],
            id = path.basename(packagePath);

        promises.push(func.call(thisArg, packagePath));

        loadedDependencies[id] = true;

        _.each(dependencies, (version, dependencyName) => {
            let dependencyPath = path.join(directory, 'node_modules', dependencyName);
            if (!exports.isPackageSync(dependencyPath)) {
                promises.push(Q.reject(new Error(`Package dependency: "${dependencyName}" does not exist in "${dependencyPath}". Make sure it is installed!`)));
            }
            dependencyPaths.push(dependencyPath);
        });

        // Recursively search for any other dependencies
        _.map(dependencyPaths, dependencyPath => {
            var id = path.basename(dependencyPath);
            if (!_.has(loadedDependencies, id)) {
                process.nextTick(() => {
                    getDependenciesRecursively(dependencyPath);
                });
            }
        });
    }

    getDependenciesRecursively(directory);

    return Q.all(promises);
};

exports.wrapInArray = function (value) {
    return _.isArray(value) ? value : [value];
};
