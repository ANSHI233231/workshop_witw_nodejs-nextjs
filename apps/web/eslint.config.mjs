// The app's layer rules, enforced by `npm run lint`:
// • Only src/services/ may import the api-client: pages, components and hooks call a service.
// • process.env is read only in src/lib/config.ts and src/lib/server-config.ts (plus the
//   NEXT_RUNTIME check in src/instrumentation.ts).
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
    ...nextVitals,
    ...nextTs,
    globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
    {
        rules: {
            'no-console': ['error', { allow: ['warn', 'error'] }],
        },
    },
    {
        // The logger wraps console.* to capture it; nowhere else may touch console directly.
        files: ['src/lib/logger/**/*.ts'],
        rules: { 'no-console': 'off' },
    },
    {
        files: ['src/components/console/**/*.tsx', 'src/components/docs/**/*.tsx', 'src/components/website/**/*.tsx', 'src/components/layout/**/*.tsx', 'src/components/shared-safari/**/*.tsx'],
        rules: { '@next/next/no-img-element': 'off' },
    },
    {
        files: ['src/**/*.{ts,tsx}'],
        ignores: ['src/lib/config.ts', 'src/lib/server-config.ts', 'src/instrumentation.ts'],
        rules: {
            'no-restricted-properties': [
                'error',
                {
                    object: 'process',
                    property: 'env',
                    message: 'Read configuration from src/lib/config.ts, never process.env directly.',
                },
            ],
        },
    },
    {
        files: ['src/**/*.{ts,tsx}'],
        ignores: ['src/services/**'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['@/services/api-client', '**/services/api-client'],
                            message: 'Only src/services/ calls the API. Use (or add) a function in src/services/<feature>.service.ts.',
                        },
                    ],
                },
            ],
        },
    },
]);
