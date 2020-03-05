const path = require('path');
const gulp = require('gulp');
const util = require('util');
const del = require('del');
const pipeline = util.promisify(require('stream').pipeline);
const log = require('fancy-log');
const {execSync} = require('child_process');
const {writeFileSync} = require('fs');
const _ = require('lodash');

async function buildService({
  source,
  destination,
  buildVersion,
  npmCache = null
}) {
  const localCache = npmCache || path.join(destination, 'local-npm-cache');
  const envFilePath = path.join(destination, '.env');
  await cleanDir(destination);

  log('Copy server files to distribution...');
  await copyServerFiles({destination, cwd: source});

  const cmd = `npm i -progress=false --cache=${localCache}`;

  log(`Installing server dependencies in ${destination}...`);
  log(`Command: ${cmd}`);

  execSync(cmd, {cwd: destination});

  // Remove dev dependencies
  log('Removing extraneous dependencies with "npm prune"...');
  execSync(`npm prune`, {cwd: destination});

  // Store build version in the .env file
  writeFileSync(envFilePath, `LABSHARE_BUILD_VERSION=${buildVersion}`);

  // Remove local npm caches.
  log(`Removing local cache directories in ${localCache} and ${path.join(destination, path.basename(localCache))}...`);
  await Promise.all([
    cleanDir(localCache),
    cleanDir(path.join(destination, path.basename(localCache)))
  ]);

  return destination;
}

/**
 * @returns {string} A build date formatted as 'v<year>.<month><day>'. For example: 'v17.1127' for November, 27th 2017.
 */
function getBuildDate() {
  const today = new Date();
  const year = today.getFullYear().toString().slice(2);
  const month = padLeft((today.getMonth() + 1).toString());
  const day = padLeft(today.getDate().toString());
  return `v${year}.${padLeft(month + day)}`;
}

/**
 * @param {String} dateValue
 * @returns {String} A single digit date value changed from '9' to '09'. Multiple digit
 * values are left unchanged.
 * @private
 */
function padLeft(dateValue) {
  return _.padStart(dateValue, 2, '0');
}

/**
 * @description
 * @param {string} dist - The directory to copy the LabShare service source files to
 * @param {String} cwd - The current working directory
 * @returns {*}
 * @private
 */
async function copyServerFiles({destination, cwd = process.cwd()}) {
  const source = gulp.src([
    './*.*',
    './!(node_modules|packages|docs|dist|test)/**/*',
    '!./node_modules/*/test/**/*',
    '!package-lock.json'
  ], {follow: true, base: cwd, cwd});
  return await pipeline(source, gulp.dest(destination));
}

async function cleanDir(directory) {
  return del([
    path.join(directory, '**/*')
  ], {cwd: process.cwd(), force: true});
}

module.exports = {buildService, getBuildDate};
