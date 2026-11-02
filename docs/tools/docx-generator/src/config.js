const fs = require('fs');
const path = require('path');

const PACKAGE_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(PACKAGE_ROOT, '../../..');

const config = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'docs.config.json'), 'utf8'));

const resolveFromConfig = (configPath) => path.resolve(PACKAGE_ROOT, configPath);

const repoPath = (absolutePath) => path.relative(REPO_ROOT, absolutePath);

module.exports = { config, REPO_ROOT, resolveFromConfig, repoPath };
