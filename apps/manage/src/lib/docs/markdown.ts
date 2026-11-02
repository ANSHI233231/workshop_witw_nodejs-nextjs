export type InlineNode =
    | { readonly kind: 'text'; readonly text: string }
    | { readonly kind: 'code'; readonly text: string }
    | { readonly kind: 'strong'; readonly children: readonly InlineNode[] }
    | { readonly kind: 'em'; readonly children: readonly InlineNode[] }
    | { readonly kind: 'del'; readonly children: readonly InlineNode[] }
    | { readonly kind: 'link'; readonly href: string; readonly children: readonly InlineNode[] }
    | { readonly kind: 'image'; readonly src: string; readonly alt: string }
    | { readonly kind: 'break' };

export type TableAlign = 'left' | 'center' | 'right' | undefined;

export type Block =
    | { readonly type: 'heading'; readonly level: number; readonly text: string; readonly id: string }
    | { readonly type: 'paragraph'; readonly text: string }
    | { readonly type: 'code'; readonly lang: string; readonly text: string }
    | { readonly type: 'quote'; readonly blocks: readonly Block[] }
    | {
          readonly type: 'list';
          readonly ordered: boolean;
          readonly start: number;
          readonly items: readonly (readonly Block[])[];
      }
    | {
          readonly type: 'table';
          readonly align: readonly TableAlign[];
          readonly head: readonly string[];
          readonly rows: readonly (readonly string[])[];
      }
    | { readonly type: 'rule' }
    | { readonly type: 'details'; readonly summary: string; readonly blocks: readonly Block[] };

const FENCE_OPEN = /^( {0,3})(`{3,}|~{3,})[ \t]*([^`\s]*)[^`]*$/;
const FENCE_CLOSE = /^ {0,3}(`{3,}|~{3,})[ \t]*$/;
const HEADING = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?(?:[ \t]+#+)?[ \t]*$/;
const RULE = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;
const QUOTE = /^ {0,3}> ?(.*)$/;
const LIST_ITEM = /^( *)([-*+]|\d{1,9}[.)])( +|$)(.*)$/;
const TABLE_DELIMITER = /^ *\|? *:?-+:? *(\| *:?-+:? *)*\|? *$/;
const DETAILS_OPEN = /^ {0,3}<details>\s*(?:<summary>(.*?)<\/summary>)?\s*$/i;
const DETAILS_CLOSE = /^ {0,3}<\/details>\s*$/i;
const COMMENT_OPEN = /^ {0,3}<!--/;
const COMMENT_CLOSE = '-->';
const ASCII_PUNCTUATION = /[!-/:-@[-`{-~]/;
const BREAK_TAG = /^<br\s*\/?>/i;
const AUTOLINK = /^<(https?:\/\/[^>\s]+)>/i;
const BARE_URL = /^https?:\/\/[^\s<]*[^\s<.,:;"')\]*_]/i;
const WORD_CHARACTER = /[\p{L}\p{N}]/u;
const SLUG_DROPPED = /[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu;

const isBlank = (line: string): boolean => line.trim() === '';

const indentOf = (line: string): number => line.length - line.trimStart().length;

const stripIndent = (line: string, count: number): string => {
    const remove = Math.min(count, indentOf(line));
    return line.slice(remove);
};

export const headingSlug = (text: string): string => text.toLowerCase().replace(SLUG_DROPPED, '').replace(/ /g, '-');

export type Slugger = (text: string) => string;

export const createSlugger = (): Slugger => {
    const seen = new Map<string, number>();
    return (text) => {
        const base = headingSlug(text);
        let result = base;
        while (seen.has(result)) {
            const next = (seen.get(base) ?? 0) + 1;
            seen.set(base, next);
            result = `${base}-${next}`;
        }
        seen.set(result, 0);
        return result;
    };
};

const startsBlock = (line: string): boolean =>
    FENCE_OPEN.test(line) ||
    HEADING.test(line) ||
    RULE.test(line) ||
    QUOTE.test(line) ||
    DETAILS_OPEN.test(line) ||
    DETAILS_CLOSE.test(line);

const interruptsParagraph = (line: string): boolean => {
    if (startsBlock(line)) return true;
    const item = LIST_ITEM.exec(line);
    return item !== null && (item[4] ?? '').trim() !== '';
};

const splitRow = (line: string): string[] => {
    let row = line.trim();
    if (row.startsWith('|')) row = row.slice(1);
    if (row.endsWith('|') && !row.endsWith('\\|')) row = row.slice(0, -1);
    const cells: string[] = [];
    let current = '';
    for (let index = 0; index < row.length; index += 1) {
        const character = row[index];
        if (character === '\\' && row[index + 1] === '|') {
            current += '|';
            index += 1;
        } else if (character === '|') {
            cells.push(current.trim());
            current = '';
        } else {
            current += character;
        }
    }
    cells.push(current.trim());
    return cells;
};

const alignOf = (cell: string): TableAlign => {
    const left = cell.startsWith(':');
    const right = cell.endsWith(':');
    if (left && right) return 'center';
    if (right) return 'right';
    if (left) return 'left';
    return undefined;
};

const isTableStart = (lines: readonly string[], index: number): boolean => {
    const header = lines[index] ?? '';
    const delimiter = lines[index + 1] ?? '';
    return header.includes('|') && delimiter.includes('|') && TABLE_DELIMITER.test(delimiter);
};

type Parsed = { readonly block: Block; readonly next: number };

const parseFence = (lines: readonly string[], index: number, match: RegExpExecArray): Parsed => {
    const indent = (match[1] ?? '').length;
    const marker = match[2] ?? '```';
    const content: string[] = [];
    let cursor = index + 1;
    while (cursor < lines.length) {
        const line = lines[cursor] ?? '';
        const close = FENCE_CLOSE.exec(line);
        if (close && close[1]?.[0] === marker[0] && (close[1]?.length ?? 0) >= marker.length) {
            cursor += 1;
            break;
        }
        content.push(stripIndent(line, indent));
        cursor += 1;
    }
    return { block: { type: 'code', lang: (match[3] ?? '').toLowerCase(), text: content.join('\n') }, next: cursor };
};

const parseDetails = (lines: readonly string[], index: number, summary: string, slugger: Slugger): Parsed => {
    const inner: string[] = [];
    let depth = 1;
    let cursor = index + 1;
    while (cursor < lines.length) {
        const line = lines[cursor] ?? '';
        if (DETAILS_OPEN.test(line)) depth += 1;
        if (DETAILS_CLOSE.test(line)) {
            depth -= 1;
            if (depth === 0) {
                cursor += 1;
                break;
            }
        }
        inner.push(line);
        cursor += 1;
    }
    return { block: { type: 'details', summary, blocks: parseLines(inner, slugger) }, next: cursor };
};

const parseQuote = (lines: readonly string[], index: number, slugger: Slugger): Parsed => {
    const inner: string[] = [];
    let cursor = index;
    while (cursor < lines.length) {
        const match = QUOTE.exec(lines[cursor] ?? '');
        if (!match) break;
        inner.push(match[1] ?? '');
        cursor += 1;
    }
    return { block: { type: 'quote', blocks: parseLines(inner, slugger) }, next: cursor };
};

const parseTable = (lines: readonly string[], index: number): Parsed => {
    const head = splitRow(lines[index] ?? '');
    const align = splitRow(lines[index + 1] ?? '').map(alignOf);
    const rows: string[][] = [];
    let cursor = index + 2;
    while (cursor < lines.length) {
        const line = lines[cursor] ?? '';
        if (isBlank(line) || !line.includes('|')) break;
        const cells = splitRow(line);
        rows.push(head.map((_, column) => cells[column] ?? ''));
        cursor += 1;
    }
    return { block: { type: 'table', align: head.map((_, column) => align[column]), head, rows }, next: cursor };
};

type ListMarker = { readonly indent: number; readonly content: number; readonly ordered: boolean };

const listMarkerOf = (line: string): (ListMarker & { readonly first: string; readonly number: number }) | null => {
    const match = LIST_ITEM.exec(line);
    if (!match) return null;
    const indent = (match[1] ?? '').length;
    const marker = match[2] ?? '-';
    const gap = (match[3] ?? '').length;
    const ordered = /\d/.test(marker);
    return {
        indent,
        ordered,
        content: indent + marker.length + (gap === 0 || gap > 4 ? 1 : gap),
        first: match[4] ?? '',
        number: ordered ? Number.parseInt(marker, 10) : 1,
    };
};

const parseList = (lines: readonly string[], index: number, slugger: Slugger): Parsed => {
    const first = listMarkerOf(lines[index] ?? '');
    const ordered = first?.ordered ?? false;
    const items: string[][] = [];
    let cursor = index;
    while (cursor < lines.length) {
        const marker = listMarkerOf(lines[cursor] ?? '');
        if (!marker || marker.ordered !== ordered || (first && marker.indent >= first.content)) break;
        const itemLines = [marker.first];
        cursor += 1;
        let previousBlank = false;
        while (cursor < lines.length) {
            const line = lines[cursor] ?? '';
            if (isBlank(line)) {
                itemLines.push('');
                previousBlank = true;
                cursor += 1;
                continue;
            }
            const indent = indentOf(line);
            const nested = listMarkerOf(line);
            if (indent >= marker.content || (nested && indent > marker.indent)) {
                itemLines.push(stripIndent(line, marker.content));
            } else if (!previousBlank && !nested && !startsBlock(line)) {
                itemLines.push(line.trimStart());
            } else {
                break;
            }
            previousBlank = false;
            cursor += 1;
        }
        while (itemLines.length > 0 && isBlank(itemLines[itemLines.length - 1] ?? '')) itemLines.pop();
        items.push(itemLines);
        const following = lines[cursor] ?? '';
        if (cursor < lines.length && !listMarkerOf(following)) break;
    }
    return {
        block: {
            type: 'list',
            ordered,
            start: first?.number ?? 1,
            items: items.map((item) => parseLines(item, slugger)),
        },
        next: cursor,
    };
};

const parseParagraph = (lines: readonly string[], index: number): Parsed => {
    const content = [(lines[index] ?? '').trimStart()];
    let cursor = index + 1;
    while (cursor < lines.length) {
        const line = lines[cursor] ?? '';
        if (isBlank(line) || interruptsParagraph(line) || isTableStart(lines, cursor)) break;
        content.push(line.trimStart());
        cursor += 1;
    }
    return { block: { type: 'paragraph', text: content.join('\n') }, next: cursor };
};

const parseBlock = (lines: readonly string[], index: number, slugger: Slugger): Parsed => {
    const line = lines[index] ?? '';
    const fence = FENCE_OPEN.exec(line);
    if (fence) return parseFence(lines, index, fence);
    const heading = HEADING.exec(line);
    if (heading) {
        const text = (heading[2] ?? '').trim();
        return {
            block: {
                type: 'heading',
                level: (heading[1] ?? '#').length,
                text,
                id: slugger(plainText(parseInline(text))),
            },
            next: index + 1,
        };
    }
    if (RULE.test(line)) return { block: { type: 'rule' }, next: index + 1 };
    const details = DETAILS_OPEN.exec(line);
    if (details) return parseDetails(lines, index, details[1] ?? '', slugger);
    if (QUOTE.test(line)) return parseQuote(lines, index, slugger);
    if (isTableStart(lines, index)) return parseTable(lines, index);
    if (listMarkerOf(line)) return parseList(lines, index, slugger);
    return parseParagraph(lines, index);
};

const skipComment = (lines: readonly string[], index: number): number => {
    let cursor = index;
    let text = (lines[cursor] ?? '').slice((lines[cursor] ?? '').indexOf('<!--') + 4);
    while (!text.includes(COMMENT_CLOSE) && cursor + 1 < lines.length) {
        cursor += 1;
        text = lines[cursor] ?? '';
    }
    return cursor + 1;
};

const parseLines = (lines: readonly string[], slugger: Slugger): Block[] => {
    const blocks: Block[] = [];
    let index = 0;
    while (index < lines.length) {
        if (isBlank(lines[index] ?? '')) {
            index += 1;
            continue;
        }
        if (COMMENT_OPEN.test(lines[index] ?? '')) {
            index = skipComment(lines, index);
            continue;
        }
        const { block, next } = parseBlock(lines, index, slugger);
        blocks.push(block);
        index = next;
    }
    return blocks;
};

export const parseMarkdown = (source: string): Block[] =>
    parseLines(source.replace(/\r\n|\r/g, '\n').split('\n'), createSlugger());

const codeSpanEnd = (text: string, start: number): { readonly end: number; readonly length: number } | null => {
    let length = 0;
    while (text[start + length] === '`') length += 1;
    let search = start + length;
    while (search < text.length) {
        const found = text.indexOf('`'.repeat(length), search);
        if (found < 0) return null;
        let run = 0;
        while (text[found + run] === '`') run += 1;
        if (run === length) return { end: found, length };
        search = found + run;
    }
    return null;
};

const matchingBracket = (text: string, start: number, open: string, close: string): number => {
    let depth = 0;
    for (let index = start; index < text.length; index += 1) {
        const character = text[index];
        if (character === '\\') {
            index += 1;
        } else if (character === '`') {
            const span = codeSpanEnd(text, index);
            if (span) index = span.end + span.length - 1;
        } else if (character === open) {
            depth += 1;
        } else if (character === close) {
            depth -= 1;
            if (depth === 0) return index;
        }
    }
    return -1;
};

const linkTarget = (raw: string): string => {
    const trimmed = raw.trim();
    if (trimmed.startsWith('<')) {
        const end = trimmed.indexOf('>');
        return end > 0 ? trimmed.slice(1, end) : trimmed;
    }
    return trimmed.split(/\s+/)[0] ?? '';
};

const closingDelimiter = (text: string, from: number, delimiter: string): number => {
    for (let index = from; index < text.length; index += 1) {
        const character = text[index];
        if (character === '\\') {
            index += 1;
            continue;
        }
        if (character === '`') {
            const span = codeSpanEnd(text, index);
            if (span) index = span.end + span.length - 1;
            continue;
        }
        if (delimiter.length === 1 && text.startsWith(delimiter + delimiter, index)) {
            index += 1;
            continue;
        }
        if (!text.startsWith(delimiter, index) || index === from) continue;
        if (/\s/.test(text[index - 1] ?? '')) continue;
        const after = text[index + delimiter.length] ?? '';
        if (delimiter.startsWith('_') && WORD_CHARACTER.test(after)) continue;
        return index;
    }
    return -1;
};

const EMPHASIS: readonly { readonly delimiter: string; readonly kind: 'strong' | 'em' | 'del' }[] = [
    { delimiter: '**', kind: 'strong' },
    { delimiter: '__', kind: 'strong' },
    { delimiter: '~~', kind: 'del' },
    { delimiter: '*', kind: 'em' },
    { delimiter: '_', kind: 'em' },
];

export const parseInline = (text: string): InlineNode[] => {
    const nodes: InlineNode[] = [];
    let buffer = '';
    const flush = () => {
        if (buffer) nodes.push({ kind: 'text', text: buffer });
        buffer = '';
    };
    let index = 0;
    while (index < text.length) {
        const character = text[index] ?? '';
        const rest = text.slice(index);
        if (character === '\\') {
            const next = text[index + 1] ?? '';
            if (next === '\n') {
                flush();
                nodes.push({ kind: 'break' });
                index += 2;
                continue;
            }
            if (ASCII_PUNCTUATION.test(next)) {
                buffer += next;
                index += 2;
                continue;
            }
        }
        if (character === '`') {
            const span = codeSpanEnd(text, index);
            if (span) {
                let code = text.slice(index + span.length, span.end).replace(/\n/g, ' ');
                if (code.length > 2 && code.startsWith(' ') && code.endsWith(' ') && code.trim()) {
                    code = code.slice(1, -1);
                }
                flush();
                nodes.push({ kind: 'code', text: code });
                index = span.end + span.length;
                continue;
            }
            let run = 0;
            while (text[index + run] === '`') run += 1;
            buffer += '`'.repeat(run);
            index += run;
            continue;
        }
        if (character === '\n') {
            if (buffer.endsWith('  ')) {
                buffer = buffer.trimEnd();
                flush();
                nodes.push({ kind: 'break' });
            } else {
                buffer = `${buffer.trimEnd()} `;
            }
            index += 1;
            continue;
        }
        if (character === '<') {
            const commentEnd = rest.startsWith('<!--') ? rest.indexOf(COMMENT_CLOSE, 4) : -1;
            if (commentEnd >= 0) {
                index += commentEnd + COMMENT_CLOSE.length;
                continue;
            }
            const lineBreak = BREAK_TAG.exec(rest);
            if (lineBreak) {
                flush();
                nodes.push({ kind: 'break' });
                index += lineBreak[0].length;
                continue;
            }
            const autolink = AUTOLINK.exec(rest);
            if (autolink) {
                flush();
                const href = autolink[1] ?? '';
                nodes.push({ kind: 'link', href, children: [{ kind: 'text', text: href }] });
                index += autolink[0].length;
                continue;
            }
        }
        if (character === '[' || (character === '!' && text[index + 1] === '[')) {
            const image = character === '!';
            const open = image ? index + 1 : index;
            const close = matchingBracket(text, open, '[', ']');
            if (close > 0 && text[close + 1] === '(') {
                const end = matchingBracket(text, close + 1, '(', ')');
                if (end > 0) {
                    const label = text.slice(open + 1, close);
                    const href = linkTarget(text.slice(close + 2, end));
                    flush();
                    nodes.push(
                        image
                            ? { kind: 'image', src: href, alt: plainText(parseInline(label)) }
                            : { kind: 'link', href, children: parseInline(label) },
                    );
                    index = end + 1;
                    continue;
                }
            }
        }
        if (character === 'h' && !WORD_CHARACTER.test(text[index - 1] ?? '')) {
            const url = BARE_URL.exec(rest);
            if (url) {
                flush();
                nodes.push({ kind: 'link', href: url[0], children: [{ kind: 'text', text: url[0] }] });
                index += url[0].length;
                continue;
            }
        }
        const emphasis = EMPHASIS.find(({ delimiter }) => rest.startsWith(delimiter));
        if (emphasis) {
            const { delimiter, kind } = emphasis;
            const after = text[index + delimiter.length] ?? '';
            const leftFlanking =
                after !== '' &&
                !/\s/.test(after) &&
                (!delimiter.startsWith('_') || !WORD_CHARACTER.test(text[index - 1] ?? ''));
            const close = leftFlanking ? closingDelimiter(text, index + delimiter.length, delimiter) : -1;
            if (close > 0) {
                flush();
                nodes.push({ kind, children: parseInline(text.slice(index + delimiter.length, close)) });
                index = close + delimiter.length;
                continue;
            }
            buffer += delimiter;
            index += delimiter.length;
            continue;
        }
        buffer += character;
        index += 1;
    }
    flush();
    return nodes;
};

export const plainText = (nodes: readonly InlineNode[]): string =>
    nodes
        .map((node) => {
            switch (node.kind) {
                case 'text':
                case 'code':
                    return node.text;
                case 'image':
                    return node.alt;
                case 'break':
                    return ' ';
                default:
                    return plainText(node.children);
            }
        })
        .join('');

export const firstHeadingTitle = (source: string): string | undefined => {
    let fenced = false;
    for (const line of source.split('\n')) {
        if (FENCE_OPEN.test(line) || (fenced && FENCE_CLOSE.test(line))) {
            fenced = !fenced;
            continue;
        }
        if (fenced) continue;
        const match = /^# +(.+?)[ \t]*$/.exec(line);
        if (match) return plainText(parseInline(match[1] ?? '')).trim() || undefined;
    }
    return undefined;
};

export const headingsOf = (blocks: readonly Block[]): Extract<Block, { type: 'heading' }>[] =>
    blocks.flatMap((block) => {
        if (block.type === 'heading') return [block];
        if (block.type === 'quote' || block.type === 'details') return headingsOf(block.blocks);
        if (block.type === 'list') return block.items.flatMap(headingsOf);
        return [];
    });

export const codeBlocksOf = (blocks: readonly Block[]): Extract<Block, { type: 'code' }>[] =>
    blocks.flatMap((block) => {
        if (block.type === 'code') return [block];
        if (block.type === 'quote' || block.type === 'details') return codeBlocksOf(block.blocks);
        if (block.type === 'list') return block.items.flatMap(codeBlocksOf);
        return [];
    });
