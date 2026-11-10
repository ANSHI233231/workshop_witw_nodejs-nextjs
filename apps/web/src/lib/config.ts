// The ONLY reader of process.env in this app. Validated when first imported, so a missing or
// malformed value fails the build / dev server with a clear message instead of a broken page.
//
// Each NEXT_PUBLIC_* variable must be written out literally (process.env.NEXT_PUBLIC_X): Next.js
// inlines them at build time and cannot see a dynamic lookup.

import { z } from 'zod';

const optionalLink = z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))
    .refine((value) => value === undefined || /^https?:\/\/\S+$/.test(value) || /^\/(?!\/)\S*$/.test(value), {
        message: 'Use a full http(s):// URL, a path starting with /, or leave it empty.',
    });

const schema = z.object({
    NEXT_PUBLIC_API_URL: z.string().url(),
    NEXT_PUBLIC_SUPPORT_URL: optionalLink,
    NEXT_PUBLIC_LOCALE_COOKIE_DOMAIN: z
        .string()
        .trim()
        .optional()
        .transform((value) => (value ? value : undefined)),
    NEXT_PUBLIC_AUTH_COOKIE_PREFIX: z
        .string()
        .trim()
        .max(20)
        .regex(/^[a-z0-9_]*$/, 'Use lowercase letters, digits and _ only.')
        .default(''),
});

const parsed = schema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SUPPORT_URL: process.env.NEXT_PUBLIC_SUPPORT_URL,
    NEXT_PUBLIC_LOCALE_COOKIE_DOMAIN: process.env.NEXT_PUBLIC_LOCALE_COOKIE_DOMAIN,
    NEXT_PUBLIC_AUTH_COOKIE_PREFIX: process.env.NEXT_PUBLIC_AUTH_COOKIE_PREFIX,
});

if (!parsed.success) {
    const problems = parsed.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${problems}\nSee .env.example for the full variable list.`);
}

export const config = Object.freeze({
    /** e.g. http://localhost:8030/api, no trailing slash. */
    apiUrl: parsed.data.NEXT_PUBLIC_API_URL.replace(/\/+$/, ''),
    supportUrl: parsed.data.NEXT_PUBLIC_SUPPORT_URL,
    localeCookieDomain: parsed.data.NEXT_PUBLIC_LOCALE_COOKIE_DOMAIN,
});

export const ACCESS_TOKEN_COOKIE = `${parsed.data.NEXT_PUBLIC_AUTH_COOKIE_PREFIX}web_access_token`;
