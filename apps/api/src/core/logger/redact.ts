// What must never reach a log file: values of keys that look like credentials or card data.

const SENSITIVE_KEY = /pass(word)?|token|secret|authori[sz]ation|cookie|api[-_]?key|card[-_]?number|cvv|cvc|^otp$|^pin$|^mpin$/i;
const MAX_DEPTH = 6;

export const REDACTED = '[REDACTED]';

export function redact(value: unknown, depth = 0): unknown {
    if (value === null || typeof value !== 'object') return value;
    if (depth >= MAX_DEPTH) return '[…]';
    if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1));

    return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([key, item]) => [
            key,
            SENSITIVE_KEY.test(key) ? REDACTED : redact(item, depth + 1),
        ]),
    );
}

/** A URL with credential-like query values replaced: /x?token=abc&page=2 → /x?token=[REDACTED]&page=2 */
export function redactUrl(url: string): string {
    const queryStart = url.indexOf('?');
    if (queryStart === -1) return url;
    const params = new URLSearchParams(url.slice(queryStart + 1));
    for (const key of [...params.keys()]) if (SENSITIVE_KEY.test(key)) params.set(key, REDACTED);
    return `${url.slice(0, queryStart)}?${params.toString().replaceAll('%5BREDACTED%5D', REDACTED)}`;
}

/** JSON for a log dump: redacted, pretty, and cut at `maxChars`. */
export function toLogJson(value: unknown, maxChars = 10_240): string {
    const json = JSON.stringify(redact(value), null, 4) ?? 'undefined';
    return json.length > maxChars ? `${json.slice(0, maxChars)}\n… [truncated, ${json.length} chars]` : json;
}
