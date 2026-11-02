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
            name: 'stag-api',
            cwd: path.join(root, 'apps', 'api'),
            script: 'dist/server.js',
            node_args: '--enable-source-maps',
        },
        nextApp('stag-web', 'web', 4100),
        nextApp('stag-manage', 'manage', 4101),
    ],
};
