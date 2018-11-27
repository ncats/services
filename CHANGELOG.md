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
