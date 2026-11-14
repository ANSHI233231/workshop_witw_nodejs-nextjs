// The browser's outbox. Every entry is stored in localStorage BEFORE it is sent, so nothing is
// lost when this app's server is down, the network drops or the tab closes:
//   - batches go to this app's own /client-logs (never the API) every 5 s, or at 20 entries;
//   - a failed send keeps the entries and retries with backoff, on `online`, and on next page load;
//   - on page hide the rest go out with sendBeacon (still stored until a normal send succeeds);
//   - the server ignores ids it has already written, so a retry never duplicates;
//   - at most 500 stored entries, oldest dropped first.

import type { ClientLogEntry } from '../types';

const ENDPOINT = '/client-logs';
const STORAGE_KEY = 'app-log-queue';
const MAX_STORED = 500;
const BATCH_SIZE = 100;
const FLUSH_DELAY_MS = 5_000;
const MAX_BACKOFF_MS = 60_000;
const SEND_NOW_AT = 20;
const BEACON_MAX_BYTES = 60_000;

let queue: ClientLogEntry[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let backoffMs = FLUSH_DELAY_MS;
let sending = false;

const load = (): ClientLogEntry[] => {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? (parsed as ClientLogEntry[]) : [];
    } catch {
        return [];
    }
};

const save = (): void => {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    } catch {
        // Storage full or blocked (private mode): keep the in-memory queue, still sent while open.
    }
};

const schedule = (delayMs: number): void => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void flush(), delayMs);
};

export function enqueue(entry: ClientLogEntry): void {
    queue.push(entry);
    if (queue.length > MAX_STORED) queue.splice(0, queue.length - MAX_STORED);
    save();
    schedule(queue.length >= SEND_NOW_AT ? 0 : FLUSH_DELAY_MS);
}

export async function flush(): Promise<void> {
    if (sending || queue.length === 0) return;
    sending = true;
    const batch = queue.slice(0, BATCH_SIZE);
    try {
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entries: batch }),
            credentials: 'same-origin',
        });
        // 4xx other than 429: the server will never accept this batch (too large, malformed);
        // drop it so it can't block everything queued behind it. Anything else is retried.
        const permanent = response.status >= 400 && response.status < 500 && response.status !== 429;
        if (!response.ok && !permanent) throw new Error(`HTTP ${response.status}`);
        const sent = new Set(batch.map((entry) => entry.id));
        queue = queue.filter((entry) => !sent.has(entry.id));
        save();
        backoffMs = FLUSH_DELAY_MS;
        if (queue.length > 0) schedule(0);
    } catch {
        // Server down, offline, restarting: keep everything and try again later.
        backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF_MS);
        schedule(backoffMs);
    } finally {
        sending = false;
    }
}

/** Last chance before the page goes away. Entries stay stored; the server dedupes retries. */
function beacon(): void {
    if (queue.length === 0 || typeof navigator.sendBeacon !== 'function') return;
    let batch = queue.slice(0, BATCH_SIZE);
    let body = JSON.stringify({ entries: batch });
    while (body.length > BEACON_MAX_BYTES && batch.length > 1) {
        batch = batch.slice(0, Math.ceil(batch.length / 2));
        body = JSON.stringify({ entries: batch });
    }
    navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
}

export function startQueue(): void {
    queue = [...load(), ...queue];
    if (queue.length > MAX_STORED) queue.splice(0, queue.length - MAX_STORED);
    save();
    window.addEventListener('online', () => void flush());
    window.addEventListener('pagehide', beacon);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') beacon();
    });
    // Whatever an earlier visit couldn't deliver goes out now.
    schedule(queue.length > 0 ? 0 : FLUSH_DELAY_MS);
}
