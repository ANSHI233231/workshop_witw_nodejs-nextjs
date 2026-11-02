const path = require('path');

const root = path.join(__dirname, '..');

const devApp = (name, dir, port) => ({
    name,
    cwd: path.join(root, 'apps', dir),
    script: 'npm',
    args: `run dev -- -p ${port}`,
});

module.exports = {
    apps: [
        devApp('api.workshop-witw', 'api', 8030),
        devApp('web.workshop-witw', 'web', 3040),
        devApp('manage.workshop-witw', 'manage', 3041),
    ],
};
