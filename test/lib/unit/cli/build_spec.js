const {readdirSync, readFileSync} = require('fs')
const {resolve} = require('path')
const execa = require('execa')
const project = resolve(__dirname, '../../../fixtures', 'main-package')
const {getBuildDate} = require('../../../../lib/cli/build-service')
const lscPath = execa.commandSync('which lsc').stdout

describe('build', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000
  describe('with default version', function () {
    let output
    let buildVersion
    let distFolder

    beforeAll(async () => {
      const result = await execa.command(`node ${lscPath} services build --source=${project}`)
      output = result.stdout
    })

    it('should output expected build version', async () => {
      const expectedBuildVersion = getBuildDate()
      expect(output).toContain(`service.${expectedBuildVersion}`)
      buildVersion = expectedBuildVersion
    })

    it('should create node_modules sub directory', () => {
      distFolder = resolve(process.cwd(), 'dist', `service.${buildVersion}`)
      const distFiles = readdirSync(distFolder)
      expect(distFiles).toContain('node_modules')
    })

    it('should create .env file', () => {
      const distFiles = readdirSync(distFolder)
      expect(distFiles).toContain('.env')
    })

    it('should include LABSHARE_BUILD_VERSION in the .env file', () => {
      expect(readFileSync(resolve(distFolder, '.env')).toString())
        .toContain(`LABSHARE_BUILD_VERSION=${buildVersion}`)
    })
  })

  describe('with a custom build version', function () {
    const buildVersion = '0.1.2'
    let output

    beforeAll(async () => {
      const result = await execa.command(`node ${lscPath} services build --source=${project} --buildVersion=${buildVersion}`)
      output = result.stdout
    })

    it('should output expected build version', async () => {
      expect(output).toContain(`service.${buildVersion}`)
    })

    it('should include LABSHARE_BUILD_VERSION in the .env file', () => {
      const distFolder = resolve(process.cwd(), 'dist', `service.${buildVersion}`)
      expect(readFileSync(resolve(distFolder, '.env')).toString())
        .toContain(`LABSHARE_BUILD_VERSION=${buildVersion}`)
    })
  })
})
