#!/usr/bin/env node
const { randomBytes } = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const readline = require('node:readline');
const { spawnSync } = require('node:child_process');

const ROOT = __dirname;
const APPS = ['api', 'manage', 'web'];
const ENVIRONMENTS = ['development', 'staging', 'production'];
const PROJECT_STEPS = 'init-project.js';
const PROTOTYPE_TEMPLATE = 'git@github.com:aayush-cmd/starter_prototype.git';
const PROTOTYPE_PATH = 'docs/prototype';
const PROTOTYPE_SYNC = 'docs/PROTOTYPE-SYNC.md';
const DB_NAME_PATTERN = /^[a-z][a-z0-9_]{1,63}$/;
const MOBILE_PATTERN = /^[6-9]\d{9}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SERVER_PORTS = {
    staging: { web: 4100, manage: 4101, api: 4110, prefix: 'stag_', host: (domain) => `stag.${domain}`, manageHost: (domain) => `stag-manage.${domain}`, apiHost: (domain) => `stag-api.${domain}` },
    production: { web: 4200, manage: 4201, api: 4210, prefix: '', host: (domain) => domain, manageHost: (domain) => `manage.${domain}`, apiHost: (domain) => `api.${domain}` },
};

const LOCAL_PORTS = { web: 3040, manage: 3041, api: 8030 };

const parseFlags = (argv) =>
    Object.fromEntries(
        argv
            .filter((argument) => argument.startsWith('--'))
            .map((argument) => {
                const [key, ...rest] = argument.slice(2).split('=');
                return [key, rest.length > 0 ? rest.join('=') : 'yes'];
            }),
    );

const flags = parseFlags(process.argv.slice(2));
const dryRun = flags['dry-run'] === 'yes';
const force = flags.force === 'yes';
const acceptDefaults = flags.yes === 'yes' || !process.stdin.isTTY;

const say = (text = '') => process.stdout.write(`${text}\n`);
const heading = (text) => say(`\n== ${text}`);
const planned = (text) => say(`  ${dryRun ? '[dry run] would ' : ''}${text}`);

const rl = acceptDefaults ? null : readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });

const ask = (question, fallback, { secret = false } = {}) =>
    new Promise((resolve) => {
        if (!rl) {
            resolve(fallback);
            return;
        }
        const shown = fallback && !secret ? ` [${fallback}]` : '';
        if (secret) {
            const write = rl._writeToOutput.bind(rl);
            rl._writeToOutput = (text) => (text.startsWith(question) ? write(text) : write(''));
            rl.question(`${question}: `, (answer) => {
                rl._writeToOutput = write;
                process.stdout.write('\n');
                resolve(answer === '' ? fallback : answer);
            });
            return;
        }
        rl.question(`${question}${shown}: `, (answer) => resolve(answer.trim() === '' ? fallback : answer.trim()));
    });

const askValid = async (question, fallback, isValid, problem) => {
    for (;;) {
        const answer = await ask(question, fallback);
        if (isValid(answer)) return answer;
        say(`  ${problem}`);
        if (!rl) throw new Error(`${question}: ${problem}`);
    }
};

const askYesNo = async (question, fallback) => {
    const answer = await ask(`${question} (y/n)`, fallback ? 'y' : 'n');
    return /^y(es)?$/i.test(String(answer));
};

const choice = (value, fallback) => (value === undefined ? fallback : value);
const yesNoFlag = (name) => (flags[name] === undefined ? undefined : /^(y|yes|true|1)$/i.test(flags[name]));

const secret = () => randomBytes(32).toString('hex');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(ROOT, file));

const writeFile = (file, content) => {
    if (!dryRun) fs.writeFileSync(path.join(ROOT, file), content);
};

const setValues = (content, values) =>
    Object.entries(values).reduce((text, [key, value]) => {
        const line = new RegExp(`^${key}=.*$`, 'm');
        return line.test(text) ? text.replace(line, `${key}=${value}`) : `${text.trimEnd()}\n${key}=${value}\n`;
    }, content);

const unquoted = (value) =>
    value.length >= 2 && value.startsWith('"') && value.endsWith('"') ? value.slice(1, -1).replace(/\\(["\\])/g, '$1') : value;

const existingApiSettings = () => {
    if (!exists('apps/api/.env')) return {};
    return Object.fromEntries(
        [...read('apps/api/.env').matchAll(/^([A-Z_]+)=(.*)$/gm)].map(([, key, value]) => [key, unquoted(value.trim())]),
    );
};

const quoted = (value) => (value === '' || /^[\w./:@,-]*$/.test(value) ? value : `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`);

const run = (command, args, options = {}) => {
    const result = spawnSync(command, args, { cwd: ROOT, encoding: 'utf8', ...options });
    return { ok: result.status === 0, output: `${result.stdout ?? ''}${result.stderr ?? ''}`.trim(), status: result.status, error: result.error };
};

const urlsOf = (environment, domain) => {
    if (environment === 'development') {
        return {
            api: `http://localhost:${LOCAL_PORTS.api}/api`,
            web: `http://localhost:${LOCAL_PORTS.web}`,
            manage: `http://localhost:${LOCAL_PORTS.manage}`,
        };
    }
    const server = SERVER_PORTS[environment];
    return { api: `https://${server.apiHost(domain)}/api`, web: `https://${server.host(domain)}`, manage: `https://${server.manageHost(domain)}` };
};

const apiValues = (settings, keys) => {
    const { environment, domain, db, urls } = settings;
    const common = {
        DB_HOST: db.host,
        DB_PORT: db.port,
        DB_USER: db.user,
        DB_PASSWORD: quoted(db.password),
        DB_NAME: db.name,
        JWT_SECRET: keys.jwt,
        JWT_REFRESH_SECRET: keys.jwtRefresh,
        LOG_INGEST_KEY: keys.ingest,
        CORS_ORIGIN: `${urls.manage},${urls.web}`,
        APP_URL_MANAGE: urls.manage,
        APP_URL_WEB: urls.web,
    };
    if (environment === 'development') return { ...common, NODE_ENV: 'development', PORT: String(LOCAL_PORTS.api) };
    const server = SERVER_PORTS[environment];
    return {
        ...common,
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: String(server.api),
        AUTH_COOKIE_DOMAIN: `.${domain}`,
        AUTH_COOKIE_PREFIX: server.prefix,
        LOG_LEVELS: environment === 'production' ? 'error,warning' : 'error,warning,info',
    };
};

const appValues = (settings, keys) => {
    const { environment, domain, urls } = settings;
    const common = { NEXT_PUBLIC_API_URL: urls.api, LOG_INGEST_KEY: keys.ingest };
    if (environment === 'development') return common;
    return {
        ...common,
        NEXT_PUBLIC_AUTH_COOKIE_PREFIX: SERVER_PORTS[environment].prefix,
        NEXT_PUBLIC_LOCALE_COOKIE_DOMAIN: `.${domain}`,
        LOG_LEVELS: environment === 'production' ? 'error,warning' : 'error,warning,info',
    };
};

const writeEnvFiles = (settings) => {
    heading(`Settings (.env) for ${settings.environment}`);
    const keys = { jwt: secret(), jwtRefresh: secret(), ingest: secret() };
    const existing = APPS.filter((app) => exists(`apps/${app}/.env`));
    if (existing.length > 0 && !force) {
        say(`  Kept the existing .env of ${existing.join(', ')} (run again with --force to write new ones; new secrets sign everyone out).`);
        if (existing.length === APPS.length) return false;
        const apiEnv = exists('apps/api/.env') ? read('apps/api/.env') : '';
        const ingest = apiEnv.match(/^LOG_INGEST_KEY=(.*)$/m)?.[1];
        if (ingest) keys.ingest = ingest;
    }
    for (const app of APPS) {
        const file = `apps/${app}/.env`;
        if (exists(file) && !force) continue;
        const example = read(`apps/${app}/.env.example`);
        const values = app === 'api' ? apiValues(settings, keys) : appValues(settings, keys);
        planned(`write ${file}${app === 'api' ? ' (database, new JWT secrets, log key)' : ' (API address, log key)'}`);
        writeFile(file, setValues(example, values));
    }
    say('  The .env files are ignored by git: never commit them.');
    return true;
};

const writeLocalProcessFile = () => {
    heading('Local process file (pm2)');
    const file = 'environments/ecosystem.local.config.js';
    if (exists(file)) {
        say(`  ${file} already exists: kept.`);
        return;
    }
    planned(`copy environments/ecosystem.local.config.example.js to ${file} (your own ports, ignored by git)`);
    writeFile(file, read('environments/ecosystem.local.config.example.js'));
};

const mysql = (db, args, input) =>
    run('mysql', ['-h', db.host, '-P', db.port, '-u', db.user, ...args], { env: { ...process.env, MYSQL_PWD: db.password }, input });

const setUpDatabase = (db) => {
    heading(`Database ${db.name}`);
    const probe = mysql(db, ['-N', '-e', 'SELECT 1']);
    if (probe.error) {
        say('  The mysql command was not found: create the database and apply the migrations by hand (apps/api/src/database/migrations/README.md).');
        return false;
    }
    if (!probe.ok) {
        say(`  Could not connect to MySQL as ${db.user}@${db.host}:${db.port}: ${probe.output.split('\n')[0]}`);
        return false;
    }
    const count = mysql(db, ['-N', '-e', `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '${db.name}'`]);
    const tables = Number(count.output.trim() || 0);
    if (tables > 0) {
        say(`  ${db.name} already has ${tables} tables: no migration applied (apply new ones by hand, in date order).`);
        return true;
    }
    planned(`create the database ${db.name} (utf8mb4)`);
    if (!dryRun) {
        const created = mysql(db, ['-e', `CREATE DATABASE IF NOT EXISTS \`${db.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`]);
        if (!created.ok) throw new Error(`Creating the database failed: ${created.output}`);
    }
    const folder = 'apps/api/src/database/migrations';
    const files = fs.readdirSync(path.join(ROOT, folder)).filter((file) => file.endsWith('.sql')).sort();
    for (const file of files) {
        planned(`apply ${file}`);
        if (dryRun) continue;
        const applied = mysql(db, [db.name], read(`${folder}/${file}`));
        if (!applied.ok) throw new Error(`${file} failed: ${applied.output}`);
    }
    return true;
};

const installPackages = () => {
    heading('Packages');
    for (const app of APPS) {
        planned(`npm ci in apps/${app}`);
        if (dryRun) continue;
        const installed = run('npm', ['ci', '--no-audit', '--no-fund'], { cwd: path.join(ROOT, 'apps', app), stdio: 'inherit' });
        if (!installed.ok) throw new Error(`npm ci failed in apps/${app}`);
    }
};

const createSuperAdmin = (admin) => {
    heading('First Super Admin');
    if (!exists('apps/api/node_modules')) {
        say('  The API packages are not installed: run "npm ci" in apps/api, then');
        say(`  npm run cli user/create-super-admin "${admin.name}" ${admin.email} ${admin.mobile} confirm`);
        return;
    }
    planned(`create the Super Admin "${admin.name}" (${admin.email}); the password is printed once`);
    if (dryRun) return;
    const created = run('npm', ['run', '-s', 'cli', 'user/create-super-admin', admin.name, admin.email, admin.mobile, 'confirm'], {
        cwd: path.join(ROOT, 'apps', 'api'),
        stdio: 'inherit',
    });
    if (!created.ok) say('  The Super Admin was not created (see the message above). Fix it and run the same command in apps/api.');
};

const setUpGit = (remote) => {
    heading('Git');
    if (exists('.git')) {
        const origin = run('git', ['remote', 'get-url', 'origin']);
        const warning = origin.ok && projectSteps ? projectSteps.originWarning(origin.output) : [];
        if (warning.length > 0) {
            warning.forEach((line) => say(`  ${line}`));
        } else {
            say(`  Already a git repository${origin.ok ? ` (origin ${origin.output})` : ''}: left as it is.`);
        }
        return;
    }
    planned('git init -b main');
    if (!dryRun) run('git', ['init', '-b', 'main']);
    if (remote) {
        planned(`git remote add origin ${remote}`);
        if (!dryRun) run('git', ['remote', 'add', 'origin', remote]);
    }
};

const prototypeUrl = () =>
    exists('.gitmodules') ? read('.gitmodules').match(/path = docs\/prototype\s*\n\s*url = (.+)/)?.[1]?.trim() : undefined;

const hasPrototype = () => prototypeUrl() !== undefined;

const NOT_ADDED = `| Prototype | not added yet (\`${PROTOTYPE_PATH}\`) |`;

const dropStarterPrototype = (template) => {
    if (prototypeUrl() !== template) return;
    planned(`remove the starter's own prototype link (${PROTOTYPE_PATH} → ${template}): the project gets its own`);
    if (dryRun) return;
    const kept = read('.gitmodules').replace(/\[submodule "docs\/prototype"\][^[]*/, '').trim();
    if (kept) fs.writeFileSync(path.join(ROOT, '.gitmodules'), `${kept}\n`);
    else fs.unlinkSync(path.join(ROOT, '.gitmodules'));
    if (exists('.git')) run('git', ['rm', '-q', '--cached', PROTOTYPE_PATH]);
    const folder = path.join(ROOT, PROTOTYPE_PATH);
    if (fs.existsSync(folder) && fs.readdirSync(folder).length === 0) fs.rmdirSync(folder);
    if (exists(PROTOTYPE_SYNC)) writeFile(PROTOTYPE_SYNC, read(PROTOTYPE_SYNC).replace(/^\| Prototype \| .*\|$/m, NOT_ADDED));
};

const laterCommand = 'node init.js --prototype=<your prototype repository URL>';

const remoteState = (url) => {
    const listed = run('git', ['ls-remote', url]);
    return { reachable: listed.ok, empty: listed.ok && listed.output === '', output: listed.output };
};

const copyTemplate = (template, url) => {
    planned(`copy the starter prototype (${template}) into ${url} as its first commit, and push it`);
    if (dryRun) return true;
    const work = fs.mkdtempSync(path.join(os.tmpdir(), 'prototype-'));
    const copy = path.join(work, 'prototype');
    try {
        const cloned = run('git', ['clone', '--depth', '1', template, copy], { cwd: work });
        if (!cloned.ok) {
            say(`  Could not read the starter prototype: ${cloned.output.split('\n').pop()}`);
            return false;
        }
        if (!run('git', ['rev-parse', 'HEAD'], { cwd: copy }).ok) {
            say('  The starter prototype has no content yet: nothing to copy.');
            return false;
        }
        fs.rmSync(path.join(copy, '.git'), { recursive: true, force: true });
        const steps = [
            ['init', '-b', 'main'],
            ['add', '-A'],
            ['commit', '-q', '-m', 'Start from the starter prototype'],
            ['push', '-q', url, 'main'],
        ];
        for (const step of steps) {
            const done = run('git', step, { cwd: copy });
            if (!done.ok) {
                say(`  git ${step[0]} failed: ${done.output.split('\n').pop()}`);
                return false;
            }
        }
        return true;
    } finally {
        fs.rmSync(work, { recursive: true, force: true });
    }
};

const recordPin = (url) => {
    const commit = run('git', ['rev-parse', '--short', 'HEAD'], { cwd: path.join(ROOT, PROTOTYPE_PATH) }).output;
    if (exists(PROTOTYPE_SYNC)) {
        writeFile(PROTOTYPE_SYNC, read(PROTOTYPE_SYNC).replace(/^\| Prototype \| .*\|$/m, `| Prototype | \`${PROTOTYPE_PATH}\` at ${commit} (${url}) |`));
    }
    return commit;
};

const setUpPrototype = (url, template, replacesStarter = false) => {
    heading('Prototype');
    if (replacesStarter) dropStarterPrototype(template);
    if (!url) {
        say('  No prototype repository yet. Create an empty one, then run:');
        say(`  ${laterCommand}`);
        say('  It copies the starter prototype into it and adds it as docs/prototype.');
        return;
    }
    if (url === template) {
        say('  That is the starter prototype itself: give your project\'s own (empty) repository.');
        return;
    }
    if (hasPrototype() && !(replacesStarter && dryRun)) {
        say(`  ${PROTOTYPE_PATH} is already a submodule: left as it is.`);
        return;
    }
    if (exists(PROTOTYPE_PATH) && fs.readdirSync(path.join(ROOT, PROTOTYPE_PATH)).length > 0) {
        say(`  ${PROTOTYPE_PATH} already exists and is not empty: move it away, then run ${laterCommand}`);
        return;
    }
    if (!dryRun && !exists('.git')) {
        say(`  This folder is not a git repository yet: run git init, then ${laterCommand}`);
        return;
    }
    const remote = remoteState(url);
    if (!remote.reachable) {
        say(`  Could not reach ${url}: ${remote.output.split('\n').pop()}`);
        say(`  Check the address and your access, then run ${laterCommand}`);
        return;
    }
    if (remote.empty) {
        if (!copyTemplate(template, url)) {
            say(`  Nothing was added. When it can be copied, run ${laterCommand}`);
            return;
        }
    } else {
        say('  The repository already has content: added as it is, nothing copied into it.');
    }
    planned(`git submodule add ${url} ${PROTOTYPE_PATH}`);
    if (dryRun) return;
    const added = run('git', ['submodule', 'add', url, PROTOTYPE_PATH]);
    if (!added.ok) {
        say(`  git submodule add failed: ${added.output.split('\n').pop()}`);
        return;
    }
    const commit = recordPin(url);
    say(`  Added ${PROTOTYPE_PATH} at ${commit}; ${PROTOTYPE_SYNC} records the pin.`);
    say(`  Commit it with the project: git add .gitmodules ${PROTOTYPE_PATH} ${PROTOTYPE_SYNC}`);
};

const checkOutPrototype = () => {
    heading('Prototype');
    if (!hasPrototype()) {
        say(`  No prototype yet: ${laterCommand}`);
        return;
    }
    planned(`git submodule update --init ${PROTOTYPE_PATH}`);
    if (dryRun) return;
    const checked = run('git', ['submodule', 'update', '--init', PROTOTYPE_PATH]);
    say(checked.ok ? `  ${PROTOTYPE_PATH} checked out at the pinned commit.` : `  Could not check it out: ${checked.output.split('\n').pop()}`);
};

const projectSteps = exists(PROJECT_STEPS) ? require(path.join(ROOT, PROJECT_STEPS)) : null;

const DB_SUFFIX = '_db';

const databaseBaseOf = (name) => (name.endsWith(DB_SUFFIX) ? name.slice(0, -DB_SUFFIX.length) : name);

const exampleDatabaseName = () => databaseBaseOf(read('apps/api/.env.example').match(/^DB_NAME=(.*)$/m)?.[1]?.trim() || 'app');

const databaseNameFor = (base, environment) =>
    `${base}${environment === 'development' ? '' : environment === 'staging' ? '_stag' : '_prod'}${DB_SUFFIX}`;

const alreadySetUp = () => exists('apps/api/.env');

const HELP = `Sets up this copy of the project on this machine: node init.js [options]

  --env=development|staging|production   which copy this is (default development)
  --name=<slug>                          only when creating a project from the starter: its name; renames "starter"
                                         and writes the project's own README
  --title=<text>                         only when creating a project: display name (default from the name)
  --domain=<example.com>                 staging / production: the domain the apps run on
  --db-host= --db-port= --db-user= --db-password= --db-name=
                                         database connection (defaults: apps/api/.env when it exists)
  --database=yes|no                      create the database and apply the migrations
  --install=yes|no                       npm ci in every app
  --admin=yes|no                         create the first Super Admin
  --admin-name= --admin-email= --admin-mobile=
  --git-remote=<url>                     your repository, added as origin after git init
  --prototype=<url>                      your prototype repository: an empty one gets a copy of the starter
                                         prototype; then added as docs/prototype. On a copy already set up,
                                         does only this step
  --prototype-template=<url>             the prototype copied into an empty repository (default: the starter's)
  --yes                                  no questions: flags, then defaults
  --dry-run                              show what would happen, write nothing
  --force                                set up again a copy that is already set up: writes new .env files
                                         (new secrets sign everyone out)
  --help                                 this text
`;

const main = async () => {
    if (flags.help === 'yes') {
        say(HELP);
        rl?.close();
        return;
    }
    const template = flags['prototype-template'] ?? PROTOTYPE_TEMPLATE;
    if (flags.prototype !== undefined && alreadySetUp() && !force) {
        say(`Prototype setup${dryRun ? ' (dry run: nothing is written)' : ''}`);
        setUpPrototype(flags.prototype === 'yes' ? '' : flags.prototype, template);
        rl?.close();
        return;
    }
    if (alreadySetUp() && !force) {
        say('This copy is already set up on this machine (apps/api/.env exists): nothing to do.');
        say('To set it up again, run: node init.js --force (writes new .env files; new secrets sign everyone out).');
        say('New migrations are applied by hand, in date order: apps/api/src/database/migrations/README.md');
        rl?.close();
        return;
    }
    say(`${projectSteps ? 'Project setup' : 'Machine setup'}${dryRun ? ' (dry run: nothing is written)' : ''}`);
    say('Answers in [brackets] are the defaults: press Enter to keep them.');

    const environment = await askValid(
        `Environment: ${ENVIRONMENTS.join(', ')}`,
        choice(flags.env, 'development'),
        (value) => ENVIRONMENTS.includes(value),
        `Choose one of ${ENVIRONMENTS.join(', ')}.`,
    );
    const project = projectSteps ? await projectSteps.askName({ flags, askValid }) : null;
    const baseName = project?.isNewProject ? project.slug.replace(/-/g, '_') : exampleDatabaseName();
    const domain =
        environment === 'development'
            ? ''
            : await askValid('Domain (e.g. example.com)', choice(flags.domain, ''), (value) => /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(value), 'Enter a domain such as example.com.');

    const current = existingApiSettings();
    say(`\nDatabase connection (MySQL 8)${current.DB_NAME ? ', defaults from apps/api/.env' : ''}:`);
    const db = {
        host: await ask('  Host', choice(flags['db-host'], current.DB_HOST || 'localhost')),
        port: await ask('  Port', choice(flags['db-port'], current.DB_PORT || '3306')),
        user: await ask('  User', choice(flags['db-user'], current.DB_USER || (environment === 'development' ? 'root' : baseName))),
        password: await ask(`  Password (hidden${current.DB_PASSWORD ? ', Enter = keep the one in apps/api/.env' : ''})`, choice(flags['db-password'], current.DB_PASSWORD || ''), { secret: true }),
        name: await askValid(
            '  Database name',
            choice(flags['db-name'], current.DB_NAME || databaseNameFor(baseName, environment)),
            (value) => DB_NAME_PATTERN.test(value),
            'Use lowercase letters, digits and _, starting with a letter.',
        ),
    };

    const isLocal = environment === 'development';
    const createDatabase = yesNoFlag('database') ?? (await askYesNo('Create the database and apply the migrations now?', isLocal));
    const install = yesNoFlag('install') ?? (await askYesNo('Install the packages (npm ci in every app) now?', isLocal));
    const wantsAdmin = yesNoFlag('admin') ?? (createDatabase && (await askYesNo('Create the first Super Admin now?', true)));
    const admin = wantsAdmin
        ? {
              name: await askValid('  Name', choice(flags['admin-name'], 'Super Admin'), (value) => value.length >= 2, 'Enter at least 2 characters.'),
              email: await askValid('  Email', choice(flags['admin-email'], ''), (value) => EMAIL_PATTERN.test(value), 'Enter a valid email.'),
              mobile: await askValid('  Mobile (10 digits)', choice(flags['admin-mobile'], ''), (value) => MOBILE_PATTERN.test(value), 'Enter a 10-digit mobile starting 6–9.'),
          }
        : null;
    const remote = flags['git-remote'] ?? (exists('.git') ? '' : await ask('Your own git repository URL (empty = add it later)', ''));
    const replacesStarterPrototype = Boolean(project?.isNewProject) && prototypeUrl() === template;
    const asksPrototype = flags.prototype !== undefined || replacesStarterPrototype || (project !== null && !hasPrototype());
    const prototype = asksPrototype
        ? flags.prototype ?? (await ask('Your prototype repository URL: an empty one gets the starter prototype (empty = add it later)', ''))
        : '';
    rl?.close();

    const settings = { environment, domain, db, urls: urlsOf(environment, domain) };
    if (project) {
        projectSteps.createProject({ heading, say, read, exists, writeFile, planned, ports: LOCAL_PORTS }, project);
        if (project.isNewProject) {
            planned(`remove ${PROJECT_STEPS}: the project is created, init.js now only sets up machines`);
            if (!dryRun) fs.unlinkSync(path.join(ROOT, PROJECT_STEPS));
        }
    }
    writeEnvFiles(settings);
    if (isLocal) writeLocalProcessFile();
    const databaseReady = createDatabase ? setUpDatabase(db) : false;
    if (install) installPackages();
    if (admin && databaseReady) createSuperAdmin(admin);
    setUpGit(remote);
    if (asksPrototype) setUpPrototype(prototype === 'yes' ? '' : prototype, template, replacesStarterPrototype);
    else if (isLocal) checkOutPrototype();

    heading('Next');
    if (isLocal) {
        say('  Run each app: npm run dev in apps/api, apps/manage and apps/web');
        say('  (or pm2 start environments/ecosystem.local.config.js).');
        say(`  Open ${settings.urls.web} (web) and ${settings.urls.manage} (console).`);
    } else {
        say(`  Build and start: docs/how-it-works/workflows/${environment === 'staging' ? 'staging' : 'production'}-deployment.md`);
        say(`  Addresses: ${settings.urls.web}, ${settings.urls.manage}, ${settings.urls.api}`);
    }
    if (dryRun) say('\nDry run: nothing was written. Run again without --dry-run to apply.');
};

main().catch((error) => {
    rl?.close();
    process.stderr.write(`\nSetup stopped: ${error.message}\n`);
    process.exitCode = 1;
});
