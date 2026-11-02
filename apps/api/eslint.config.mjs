// The architecture, enforced by `npm run lint` rather than by review.
//
//   routes/index.ts → module index.ts → routes → controllers → services → repositories → sql
//
// • A module's folders are PRIVATE: anything outside a module imports only its `index.ts`.
// • Controllers never reach a repository, sql or the database; repositories never reach a service.
// • `core/` never depends on modules. `process.env` is read only in `config/`. No console.*.
import boundaries from 'eslint-plugin-boundaries';
import tseslint from 'typescript-eslint';

// A module's internal layers may be reached only from inside the SAME module (the captured
// `module` folder name must match). Anything outside reaches a module through its index.ts.
const sameModule = (...types) =>
    types.map((type) => ({
        to: { element: { type, captured: { module: '{{ from.element.captured.module }}' } } },
    }));

// An adapter's providers/ (vendor code) is private to its own capability: everything else goes
// through the capability's contract and factory.
const sameCapability = (...types) =>
    types.map((type) => ({
        to: { element: { type, captured: { capability: '{{ from.element.captured.capability }}' } } },
    }));

const RESPOND_MESSAGE =
    'Respond through core/http: ok(), created(), noContent(), paginated(), sendDownload(); errors are thrown. Never write to res directly.';
const ROUTE_MESSAGE = 'Add routes through apiRouter() from core/http and mount them with mountApi(): every route states its access.';
const ROUTE_METHODS = 'get|post|put|patch|delete|all|head|options|route';
const ROUTE_METHODS_AND_USE = `${ROUTE_METHODS}|use`;

const responseRules = [
    {
        selector:
            "CallExpression[callee.object.name=/^(res|response)$/][callee.property.name=/^(json|jsonp|send|sendStatus|sendFile|status|end|write|writeHead|redirect|download|attachment|render|type|format)$/]",
        message: RESPOND_MESSAGE,
    },
    { selector: "CallExpression[callee.property.name='pipe'][arguments.0.name=/^(res|response)$/]", message: RESPOND_MESSAGE },
];

const routeRules = (methods) => [
    { selector: "MemberExpression[object.name='express'][property.name='Router']", message: ROUTE_MESSAGE },
    {
        selector: `CallExpression[callee.object.name=/^(app|router)$/][callee.property.name=/^(${methods})$/]`,
        message: ROUTE_MESSAGE,
    },
];

const expressRouterImport = { name: 'express', importNames: ['Router'], message: ROUTE_MESSAGE };

export default tseslint.config(
    {
        ignores: ['dist/**', 'node_modules/**', 'logs/**', 'eslint.config.mjs'],
    },
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-misused-promises': 'error',
            // Express recognises an error handler only by its four-argument signature, so an
            // unused trailing parameter is sometimes structural. `_`-prefixed only.
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            // core/logger is the only writer of application output.
            'no-console': 'error',
        },
    },
    {
        files: ['src/**/*.ts'],
        ignores: ['src/config/**'],
        rules: {
            'no-restricted-properties': [
                'error',
                {
                    object: 'process',
                    property: 'env',
                    message: 'Read configuration from `config/` (validated at boot), never process.env directly.',
                },
            ],
        },
    },
    {
        files: ['src/**/*.ts'],
        ignores: ['src/core/**', 'src/app.ts'],
        rules: {
            'no-restricted-syntax': ['error', ...responseRules, ...routeRules(ROUTE_METHODS_AND_USE)],
            'no-restricted-imports': ['error', { paths: [expressRouterImport] }],
        },
    },
    {
        files: ['src/app.ts'],
        rules: {
            'no-restricted-syntax': ['error', ...responseRules, ...routeRules(ROUTE_METHODS)],
            'no-restricted-imports': ['error', { paths: [expressRouterImport] }],
        },
    },
    {
        // The CLI framework discovers controllers at runtime and calls their actions by name;
        // that dynamic dispatch cannot be typed, so `any` is allowed in its lib/ only.
        files: ['src/cli/lib/**/*.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unsafe-function-type': 'off',
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
    {
        files: ['src/**/*.ts'],
        plugins: { boundaries },
        settings: {
            // Without this, extensionless relative imports resolve as `unknown` and every
            // boundaries rule silently allows them.
            'import/resolver': { node: { extensions: ['.js', '.ts'] } },
            'boundaries/include': ['src/**/*.ts'],
            // Matched in ORDER, most specific first: reordering changes what a file resolves to.
            'boundaries/elements': [
                { type: 'app', mode: 'file', pattern: 'src/app.ts' },
                { type: 'entry', mode: 'file', pattern: 'src/*.ts' },
                { type: 'config', pattern: 'src/config' },
                { type: 'core', pattern: 'src/core/*' },
                { type: 'database', pattern: 'src/database/*' },
                // Above `infrastructure`: e.g. src/infrastructure/payment/providers.
                { type: 'infrastructure-internal', pattern: 'src/infrastructure/*/*', capture: ['capability'] },
                { type: 'infrastructure', pattern: 'src/infrastructure/*', capture: ['capability'] },
                { type: 'cli', pattern: 'src/cli' },
                { type: 'controllers', pattern: 'src/modules/*/controllers', capture: ['module'] },
                { type: 'services', pattern: 'src/modules/*/services', capture: ['module'] },
                { type: 'repositories', pattern: 'src/modules/*/repositories', capture: ['module'] },
                { type: 'sql', pattern: 'src/modules/*/sql', capture: ['module'] },
                // Above `module-internal`: a module's contracts may name a sibling's contract.
                { type: 'module-contracts', pattern: 'src/modules/*/contracts', capture: ['module'] },
                // routes/, validators/, dto/, mappers/, types/, middlewares/
                { type: 'module-internal', pattern: 'src/modules/*/*', capture: ['module'] },
                { type: 'module', pattern: 'src/modules/*', capture: ['module'] },
                { type: 'routes', pattern: 'src/routes' },
            ],
        },
        rules: {
            'boundaries/dependencies': [
                'error',
                {
                    default: 'disallow',
                    policies: [
                        { allow: [{ to: { module: { origin: 'external' } } }] },
                        {
                            // server.ts wires everything together.
                            from: { element: { type: 'entry' } },
                            allow: [{ to: { element: { type: ['app', 'config', 'core', 'database', 'infrastructure', 'routes'] } } }],
                        },
                        {
                            // Never `config`: the app receives configuration, it doesn't read it.
                            from: { element: { type: 'app' } },
                            allow: [{ to: { element: { type: ['core', 'routes'] } } }],
                        },
                        {
                            from: { element: { type: 'routes' } },
                            allow: [{ to: { element: { type: ['module', 'core', 'database', 'infrastructure'] } } }],
                        },
                        {
                            // core never depends on modules, config or the database.
                            from: { element: { type: 'core' } },
                            allow: [{ to: { element: { type: ['core'] } } }],
                        },
                        {
                            from: { element: { type: 'database' } },
                            allow: [{ to: { element: { type: ['database', 'core'] } } }],
                        },
                        {
                            from: { element: { type: 'infrastructure' } },
                            allow: [
                                { to: { element: { type: ['infrastructure', 'core'] } } },
                                ...sameCapability('infrastructure-internal'),
                            ],
                        },
                        {
                            // A provider implements its own capability's contract; nothing wider.
                            from: { element: { type: 'infrastructure-internal' } },
                            allow: [{ to: { element: { type: ['core'] } } }, ...sameCapability('infrastructure', 'infrastructure-internal')],
                        },
                        {
                            // The CLI is an entry point that calls module SERVICES through index.ts.
                            from: { element: { type: 'cli' } },
                            allow: [{ to: { element: { type: ['cli', 'config', 'core', 'database', 'infrastructure', 'module', 'routes'] } } }],
                        },
                        {
                            // index.ts is the composition root: it builds repositories, services
                            // and controllers, and exports only what others may use.
                            from: { element: { type: 'module' } },
                            allow: [
                                { to: { element: { type: ['core', 'database', 'infrastructure'] } } },
                                ...sameModule('controllers', 'services', 'repositories', 'sql', 'module-internal', 'module-contracts'),
                            ],
                        },
                        {
                            // Never services directly (the contract instead), never repositories/sql/database.
                            from: { element: { type: 'controllers' } },
                            allow: [{ to: { element: { type: ['core'] } } }, ...sameModule('module-internal', 'module-contracts')],
                        },
                        {
                            // Only services may call another module, and only through its index.ts.
                            from: { element: { type: 'services' } },
                            allow: [
                                { to: { element: { type: ['module', 'core', 'database', 'infrastructure'] } } },
                                ...sameModule('repositories', 'module-internal', 'module-contracts'),
                            ],
                        },
                        {
                            // Nothing upward: never a service, never another repository's module.
                            from: { element: { type: 'repositories' } },
                            allow: [{ to: { element: { type: ['database', 'core'] } } }, ...sameModule('sql', 'module-internal', 'module-contracts')],
                        },
                        {
                            from: { element: { type: 'sql' } },
                            allow: [],
                        },
                        {
                            from: { element: { type: 'module-contracts' } },
                            allow: [
                                // A sibling's contract is named through its index.ts (`module`).
                                { to: { element: { type: ['module', 'core', 'database', 'infrastructure'] } } },
                                ...sameModule('module-internal', 'module-contracts'),
                            ],
                        },
                        {
                            // routes/ needs the controller type; none of these reach data access.
                            from: { element: { type: 'module-internal' } },
                            allow: [
                                { to: { element: { type: ['core', 'database'] } } },
                                ...sameModule('controllers', 'module-internal', 'module-contracts'),
                            ],
                        },
                    ],
                },
            ],
        },
    },
);
