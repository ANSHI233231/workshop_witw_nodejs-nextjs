'use server';

import { requireConsoleArea } from '@/lib/console-session';
import type { DocSearchResult } from '@/types/docs.types';

import { searchDocs } from './docs-files';

export async function searchDocumentation(query: string): Promise<DocSearchResult> {
    await requireConsoleArea('platform');
    return searchDocs(typeof query === 'string' ? query : '');
}
