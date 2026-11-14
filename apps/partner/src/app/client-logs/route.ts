// Receives this app's browser logs (src/lib/logger/browser/queue.ts) and writes them to this
// app's logs/ folder. Public by nature, so it only accepts same-origin JSON, bounded in size and
// rate; it never answers with details.

import { z } from 'zod';

import { writeRecord, isLevelSaved } from '@/lib/logger/server/file-writer';
import { clientIp } from '@/lib/logger/server/request-error';
import { redactUrl } from '@/lib/logger/redact';

export const runtime = 'nodejs';

const MAX_BODY_BYTES = 256 * 1024;
const RATE_LIMIT_PER_MINUTE = 600;
const SEEN_IDS_KEPT = 20_000;
const MAX_CLOCK_SKEW_MS = 7 * 24 * 60 * 60 * 1000;

const entrySchema = z.object({
    id: z.string().min(1).max(100),
    time: z.string().max(40),
    level: z.enum(['error', 'warn', 'info', 'debug']),
    category: z.string().regex(/^browser\.[a-z.]{1,40}$|^[a-z][a-z0-9.-]{0,40}$/),
    message: z.string().max(4_000),
    context: z.record(z.string(), z.unknown()).optional(),
    errorStack: z.string().max(16_000).optional(),
    callStack: z.string().max(16_000).optional(),
    page: z.string().max(2_000),
    sessionId: z.string().max(100),
});
const bodySchema = z.object({ entries: z.array(entrySchema).max(100) });

// In-memory, per server process: enough to stop a flood and to drop retried duplicates.
const seenIds = new Set<string>();
const rate = new Map<string, { windowStart: number; count: number }>();

const remember = (id: string): boolean => {
    if (seenIds.has(id)) return false;
    seenIds.add(id);
    if (seenIds.size > SEEN_IDS_KEPT) seenIds.delete(seenIds.values().next().value!);
    return true;
};

const allow = (ip: string, entries: number): boolean => {
    const now = Date.now();
    const bucket = rate.get(ip);
    if (!bucket || now - bucket.windowStart > 60_000) {
        rate.set(ip, { windowStart: now, count: entries });
        if (rate.size > 10_000) rate.delete(rate.keys().next().value!);
        return entries <= RATE_LIMIT_PER_MINUTE;
    }
    bucket.count += entries;
    return bucket.count <= RATE_LIMIT_PER_MINUTE;
};

const isSameOrigin = (request: Request): boolean => {
    const fetchSite = request.headers.get('sec-fetch-site');
    if (fetchSite) return fetchSite === 'same-origin';
    const origin = request.headers.get('origin');
    const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
    return origin !== null && host !== null && new URL(origin).host === host;
};

export async function POST(request: Request): Promise<Response> {
    if (!isSameOrigin(request)) return new Response(null, { status: 403 });
    if (!(request.headers.get('content-type') ?? '').includes('application/json')) return new Response(null, { status: 415 });
    if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) return new Response(null, { status: 413 });

    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return new Response(null, { status: 413 });

    let json: unknown;
    try {
        json = JSON.parse(text);
    } catch {
        return new Response(null, { status: 400 });
    }
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) return new Response(null, { status: 400 });

    const headers = Object.fromEntries(request.headers.entries());
    const ip = clientIp(headers);
    if (!allow(ip, parsed.data.entries.length)) return new Response(null, { status: 429 });

    for (const entry of parsed.data.entries) {
        if (!remember(entry.id) || !isLevelSaved(entry.level)) continue;
        const time = Date.parse(entry.time);
        writeRecord({
            level: entry.level,
            category: entry.category,
            message: entry.message,
            context: { page: redactUrl(entry.page), ...(entry.context ?? {}) },
            errorStack: entry.errorStack,
            callStack: entry.callStack,
            time: Number.isFinite(time) && Math.abs(Date.now() - time) < MAX_CLOCK_SKEW_MS ? new Date(time).toISOString() : undefined,
            ip,
            id: entry.sessionId,
        });
    }
    return new Response(null, { status: 204 });
}
