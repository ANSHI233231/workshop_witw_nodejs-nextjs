const path = require('path');

const root = path.join(__dirname, '..');

const nextApp = (name, dir, port) => ({
    name,
    cwd: path.join(root, 'apps', dir),
    script: 'node_modules/next/dist/bin/next',
    args: `start -p ${port} -H 127.0.0.1`,
});

module.exports = {
    apps: [
        {
            name: 'prod-api',
            cwd: path.join(root, 'apps', 'api'),
            script: 'dist/server.js',
            node_args: '--enable-source-maps',
        },
        nextApp('prod-web', 'web', 4200),
        nextApp('prod-manage', 'manage', 4201),
    ],
};
