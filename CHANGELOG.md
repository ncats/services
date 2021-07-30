## [4.10.5](https://github.com/LabShare/services/compare/v4.10.4...v4.10.5) (2021-07-30)


### Bug Fixes

* updated @labshare/services-cache version ([cadaaf2](https://github.com/LabShare/services/commit/cadaaf2df01e78db3e815d4af6b2520077c2acec))

## [4.10.4](https://github.com/LabShare/services/compare/v4.10.3...v4.10.4) (2021-02-09)


### Bug Fixes

* add test coverage ([28e33a7](https://github.com/LabShare/services/commit/28e33a75af04ff7feb37ca648c61e54ef83aeba8))
* ahsr 1715 updated the const name to corsSettings ([a84de36](https://github.com/LabShare/services/commit/a84de36186eb6c773ab085987968e2574f96c3f1))

## [4.10.3](https://github.com/LabShare/services/compare/v4.10.2...v4.10.3) (2020-08-17)


### Bug Fixes

* package.json & package-lock.json to reduce vulnerabilities ([7e30bb1](https://github.com/LabShare/services/commit/7e30bb1592018841970ccd3a6436bf1c35965d26))

## [4.10.2](https://github.com/LabShare/services/compare/v4.10.1...v4.10.2) (2020-08-13)


### Bug Fixes

* **config:** remove invalid default audience value ([c4ea1d8](https://github.com/LabShare/services/commit/c4ea1d81c0001019a59c613734ee00bebd21f872))

## [4.10.1](https://github.com/LabShare/services/compare/v4.10.0...v4.10.1) (2020-07-16)


### Bug Fixes

* set request.user ([900bd0a](https://github.com/LabShare/services/commit/900bd0afd20befae1ce2c02b66065db80e6a5ae1))

# [4.10.0](https://github.com/LabShare/services/compare/v4.9.1...v4.10.0) (2020-06-26)


### Features

* add body from request to logger - FCS-250 ([bb1677d](https://github.com/LabShare/services/commit/bb1677dcd2bfd1b0aa89e57c95b677a19e257319))

## [4.9.1](https://github.com/LabShare/services/compare/v4.9.0...v4.9.1) (2020-06-26)


### Bug Fixes

* skip setting user info for unauthenticated routes ([a5cc2b8](https://github.com/LabShare/services/commit/a5cc2b885ecdcc59096700490805a7099423caa5))
* skip setting userInfo for external routes ([b4d5c9c](https://github.com/LabShare/services/commit/b4d5c9c78d9cba308d1a1a6280df5414fa543e16))

# [4.9.0](https://github.com/LabShare/services/compare/v4.8.0...v4.9.0) (2020-06-19)


### Features

* add userInfo to logger - FCS-324 ([59dd721](https://github.com/LabShare/services/commit/59dd7210a55c00699d65ea386fd0c8225218a5ef))

# [4.8.0](https://github.com/LabShare/services/compare/v4.7.0...v4.8.0) (2020-06-10)


### Features

* add logger for successful API responses - FCS-301 ([f40bb13](https://github.com/LabShare/services/commit/f40bb13eb02356c5e81c1b5d22205f3abc5e2e24))

# [4.7.0](https://github.com/LabShare/services/compare/v4.6.0...v4.7.0) (2020-05-21)


### Features

* add LabShare Logger as a global module - FCS-161 ([72648f6](https://github.com/LabShare/services/commit/72648f6d7f502827f3d20a0c60075dde4ebeea44))
* use LabShare Logger as main logger in services ([e17d5b3](https://github.com/LabShare/services/commit/e17d5b3ad873b26e48d4bc1cd9a3e2d9a153c9f3))

# [4.6.0](https://github.com/LabShare/services/compare/v4.5.5...v4.6.0) (2020-05-21)


### Features

* export cli functions ([5c0e0a8](https://github.com/LabShare/services/commit/5c0e0a8d25f52dd4e06db4f517e4b0668e35a118))

## [4.5.5](https://github.com/LabShare/services/compare/v4.5.4...v4.5.5) (2020-05-11)


### Bug Fixes

* added CORS middleware ([a8ed0b3](https://github.com/LabShare/services/commit/a8ed0b3fd9bb70a06a183e3e2646a18e168d12c3))

## [4.5.4](https://github.com/LabShare/services/compare/v4.5.3...v4.5.4) (2020-05-01)


### Bug Fixes

* base docker image ([bd2cfe6](https://github.com/LabShare/services/commit/bd2cfe6409bd667c33a1962784873957da2f90d2))

## [4.5.3](https://github.com/LabShare/services/compare/v4.5.2...v4.5.3) (2020-05-01)


### Bug Fixes

* apm issue for stating services command ([1042482](https://github.com/LabShare/services/commit/10424829e7fd58fa4385e13dac06cd4b5b63415d))

## [4.5.2](https://github.com/LabShare/services/compare/v4.5.1...v4.5.2) (2020-04-14)


### Bug Fixes

* check if notification settings are present ([071993a](https://github.com/LabShare/services/commit/071993a6d750bf68d58024be6cd98490b6ce00be))
* update test for notification service ([f811446](https://github.com/LabShare/services/commit/f811446dda3198a6bee3a7df72cbda61b44ac896))
* use this._options to create notification service - FCS-188 ([91f53df](https://github.com/LabShare/services/commit/91f53dfb37b8caa931a22fe686186fbf5150ff5e))

## [4.5.1](https://github.com/LabShare/services/compare/v4.5.0...v4.5.1) (2020-04-09)


### Bug Fixes

* path parameters get lower-cased ([71ed923](https://github.com/LabShare/services/commit/71ed92319ea93b4fe61efe0fa5208caf40ba84f4))

# [4.5.0](https://github.com/LabShare/services/compare/v4.4.0...v4.5.0) (2020-04-08)


### Features

* added options to disable authentication and set user info ([6a017b5](https://github.com/LabShare/services/commit/6a017b5c6952cb7e1c0d0cfc117be585e345f9c7))

# [4.4.0](https://github.com/LabShare/services/compare/v4.3.0...v4.4.0) (2020-04-01)


### Features

* add services-notifications - FCS-188 ([ee5e850](https://github.com/LabShare/services/commit/ee5e8505299c4a1402f20837d39d3c3d6820af2d))

# [4.3.0](https://github.com/LabShare/services/compare/v4.2.0...v4.3.0) (2020-03-24)


### Features

* documentation ([1f12a1d](https://github.com/LabShare/services/commit/1f12a1df936d6f75a9b0b45bd4b6db5bbc23d64a))
* support for loading loopback apis ([36a0f82](https://github.com/LabShare/services/commit/36a0f824413703bdf54eee49980c2e0bc2bb0672))
* support for loobpack apis ([a01547b](https://github.com/LabShare/services/commit/a01547bf276d4afa3378e97f07c1480b60061825))
* test for loading loopback apps ([e8ecc60](https://github.com/LabShare/services/commit/e8ecc600f2587e61ed95dfdbba9fc7c1e6d46c4b))

# [4.2.0](https://github.com/LabShare/services/compare/v4.1.1...v4.2.0) (2020-03-11)


### Bug Fixes

* updated to @labshare/services-auth v3 ([198776f](https://github.com/LabShare/services/commit/198776f4179f99b71463ae20517337d9df936cf3))


### Features

* add applyAuthMetadata() method ([7b50402](https://github.com/LabShare/services/commit/7b504024038d69f646fba7d4002c6414f0fe29fd))

## [4.1.1](https://github.com/LabShare/services/compare/v4.1.0...v4.1.1) (2020-03-06)


### Bug Fixes

* read auth url from services.auth.url config setting ([1c808f7](https://github.com/LabShare/services/commit/1c808f7df56158d3c7d0c9428fe139c1301ebfbb))

# [4.1.0](https://github.com/LabShare/services/compare/v4.0.11...v4.1.0) (2020-03-05)


### Features

* added build cli command ([941c082](https://github.com/LabShare/services/commit/941c0826249cf83f0567323ce6a8b822cce660d0))

## [4.0.11](https://github.com/LabShare/services/compare/v4.0.10...v4.0.11) (2020-03-03)


### Bug Fixes

* make sure controller class name does not start with a number ([8248a7c](https://github.com/LabShare/services/commit/8248a7cb6839383b8c758f2345629a860828ba07))

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
