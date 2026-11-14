// Browser-side logging, started before React hydrates: console.*, uncaught errors, unhandled
// rejections and navigations are queued for this app's own /client-logs. See src/lib/logger.

import { logNavigation, startBrowserLogging } from './lib/logger/browser/start';

startBrowserLogging();

export function onRouterTransitionStart(url: string, navigationType: 'push' | 'replace' | 'traverse'): void {
    logNavigation(url, navigationType);
}
