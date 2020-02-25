## [4.0.10](https://github.com/LabShare/services/compare/v4.0.9...v4.0.10) (2020-02-25)


### Bug Fixes

* prevent path parameters from being lower cased ([0305a39](https://github.com/LabShare/services/commit/0305a399842660fdde4b44b51caebc02901a8230))

## [4.0.9](https://github.com/LabShare/services/compare/v4.0.8...v4.0.9) (2020-02-24)


### Bug Fixes

* avoid name clash between services with same names ([47cdcbe](https://github.com/LabShare/services/commit/47cdcbee993e41f5a0f5efb8398d93e7ef12fcf8))

## [4.0.8](https://github.com/LabShare/services/compare/v4.0.7...v4.0.8) (2020-02-20)


### Bug Fixes

* added ability to specify multiple mount points ([2aa73c3](https://github.com/LabShare/services/commit/2aa73c31a7c4ac4b8bf92ac8f779272e79ee0a7a))

## [4.0.7](https://github.com/LabShare/services/compare/v4.0.6...v4.0.7) (2020-02-18)


### Bug Fixes

* make mounthPath configurable ([002b0fa](https://github.com/LabShare/services/commit/002b0fa9e7a2505c1be06d280fff6282afa00ba7))

## [4.0.6](https://github.com/LabShare/services/compare/v4.0.5...v4.0.6) (2020-02-14)


### Bug Fixes

* implement case-insensitive routing ([54168b7](https://github.com/LabShare/services/commit/54168b7484f4fcb9472159e58183584ea2d0f09a))

## [4.0.5](https://github.com/LabShare/services/compare/v4.0.4...v4.0.5) (2020-02-13)


### Bug Fixes

* revert forcing routes to be lower case ([0f1fed3](https://github.com/LabShare/services/commit/0f1fed3997bf098bde4acb0ee301a33370c6215b))

## [4.0.4](https://github.com/LabShare/services/compare/v4.0.3...v4.0.4) (2020-02-13)


### Bug Fixes

* force routes to be lower case ([2a5bbcf](https://github.com/LabShare/services/commit/2a5bbcfa32bcd9bd5075fe8b5888a0efde6af909))

## [4.0.3](https://github.com/LabShare/services/compare/v4.0.2...v4.0.3) (2020-02-13)


### Bug Fixes

* prefix each path with facilityId ([b9f5741](https://github.com/LabShare/services/commit/b9f57415af97c63425f9852d2a9cae019ce197cc))

## [4.0.2](https://github.com/LabShare/services/compare/v4.0.1...v4.0.2) (2020-02-07)


### Bug Fixes

* dashes in API file names ([da13376](https://github.com/LabShare/services/commit/da133760abe0a7620dc1f4f561199eeddc07eceb))

# [3.4.0](https://github.com/LabShare/services/compare/v3.3.3...v3.4.0) (2019-08-29)


### Bug Fixes

* readme typo ([f62db6b](https://github.com/LabShare/services/commit/f62db6b))


### Features

* add Elastic APM integration ([86139d6](https://github.com/LabShare/services/commit/86139d6))

## [3.3.3](https://github.com/LabShare/services/compare/v3.3.2...v3.3.3) (2019-02-13)


### Bug Fixes

* **pkg:** use memorystore to prevent memory leaks in default session ([558f00d](https://github.com/LabShare/services/commit/558f00d))

## [3.3.2](https://github.com/LabShare/services/compare/v3.3.1...v3.3.2) (2018-11-27)


### Bug Fixes

* codacy issue ([586e018](https://github.com/LabShare/services/commit/586e018))
* server-shutdown removal , stoppable used instead ([4ca10a3](https://github.com/LabShare/services/commit/4ca10a3))

## [3.3.1](https://github.com/LabShare/services/compare/v3.3.0...v3.3.1) (2018-11-27)


### Bug Fixes

* **package:** update server-shutdown to version 2.0.0 ([86bc672](https://github.com/LabShare/services/commit/86bc672))

# [3.3.0](https://github.com/LabShare/services/compare/v3.2.1...v3.3.0) (2018-10-31)


### Features

* add basic health check route on restApiRoot ([aabe483](https://github.com/LabShare/services/commit/aabe483))

## [3.2.1](https://github.com/LabShare/services/compare/v3.2.0...v3.2.1) (2018-10-25)


### Bug Fixes

* **config:** resolve default value for restApiRoot ([e47e807](https://github.com/LabShare/services/commit/e47e807))

# [3.2.0](https://github.com/LabShare/services/compare/v3.1.0...v3.2.0) (2018-10-25)


### Features

* **config:** provide mountpoint for APIs as "restApiRoot" SHELL-1623 ([9d12f0b](https://github.com/LabShare/services/commit/9d12f0b))

# [3.1.0](https://github.com/LabShare/services/compare/v3.0.0...v3.1.0) (2018-09-07)


### Features

* **docker:** install "tzdata" for customizing the timezone from UTC ([c5e748e](https://github.com/LabShare/services/commit/c5e748e)), closes [/github.com/gliderlabs/docker-alpine/issues/136#issuecomment-272703023](https://github.com//github.com/gliderlabs/docker-alpine/issues/136/issues/issuecomment-272703023)

# [3.0.0](https://github.com/LabShare/services/compare/v2.0.0...v3.0.0) (2018-06-15)


### Bug Fixes

* **package:** add missing semantic-release dependencies ([4023752](https://github.com/LabShare/services/commit/4023752))
* **travis:** remove --pro flag to support open source Travis CI ([2d8d3d8](https://github.com/LabShare/services/commit/2d8d3d8))


### Features

* **api:** remove recursive dependency resolution SHELL-1402 ([beead4e](https://github.com/LabShare/services/commit/beead4e))
* **npm:** integrate with semantic-release SHELL-1528 ([248fe9f](https://github.com/LabShare/services/commit/248fe9f))


### BREAKING CHANGES

* **api:** Remove recursive “packageDependency” resolution for HTTP and Web Socket APIs to resolve Node module versioning conflicts when multiple LabShare versions of LabShare dependencies exist in the dependency tree.

# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="2.0.0"></a>
# 2.0.0 (2018-05-22)


* Merge pull request #60 from LabShare/new-socket-api ([d4d625b](https://github.com/LabShare/services/commit/d4d625b)), closes [#60](https://github.com/LabShare/services/issues/60)
* Merge pull request #30 from LabShare/remove-auth ([9e74f60](https://github.com/LabShare/services/commit/9e74f60)), closes [#30](https://github.com/LabShare/services/issues/30)


### Bug Fixes

* package.json & .snyk to reduce vulnerabilities ([43d0ed4](https://github.com/LabShare/services/commit/43d0ed4))
* **npm:** Fix NPM version for publishing compatibility ([bbaf817](https://github.com/LabShare/services/commit/bbaf817))
* **npm:** NPM does not allow leading zeros in version ([0dde1a5](https://github.com/LabShare/services/commit/0dde1a5))
* **package:** Fix typo ([0474a9a](https://github.com/LabShare/services/commit/0474a9a))


### Features

* **git:** Enforce commit format ([36c67cc](https://github.com/LabShare/services/commit/36c67cc))
* **services:** Replace custom forced shutdown with NPM's server-shutdown ([3175c53](https://github.com/LabShare/services/commit/3175c53))


### BREAKING CHANGES

* new Socket API system
* move route authentication out of LabShare/Services



<a name=""></a>
#  (2018-05-21)

### Bug Fixes

* package.json & .snyk to reduce vulnerabilities ([43d0ed4](https://github.com/LabShare/services/commit/43d0ed4))
* **npm:** Fix NPM version for publishing compatibility ([bbaf817](https://github.com/LabShare/services/commit/bbaf817))
* **package:** Fix typo ([0474a9a](https://github.com/LabShare/services/commit/0474a9a))


### Features

* **services:** Replace custom forced shutdown with NPM's server-shutdown ([3175c53](https://github.com/LabShare/services/commit/3175c53))
