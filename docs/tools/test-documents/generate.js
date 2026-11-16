#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const planningDir = path.join(repoRoot, 'docs', 'planning', 'features');
const outDir = path.join(repoRoot, 'docs', 'testing');
const areas = JSON.parse(fs.readFileSync(path.join(__dirname, 'areas.json'), 'utf8')).areas;
const check = process.argv.includes('--check');

const STATUS = '(PASS|FAIL|NOT RUN|BLOCKED)';
const NUM = '\\d+(?:\\s*(?:\\.\\.|–|—)\\s*\\d+)?';
const ITEM = 'TC-[A-Z0-9]+-' + NUM;
const IDLIST = `${ITEM}(?:\\s*(?:,|/|\\+|and)\\s*(?:${ITEM}|${NUM}))*`;
const RESULT_LINE = new RegExp(
    `^(?:(\\d{4}-\\d{2}-\\d{2})(?:\\s*\\((.*?)\\))?\\s*[:—–-]\\s*)?\\**\\s*(${IDLIST})(?:\\s*\\([^)]*\\))?\\s*:?\\s*${STATUS}\\b(.*)$`,
);

const EMBEDDED_LINE = new RegExp(`[.;]\\s+(${IDLIST})(?:\\s*\\([^)]*\\))?\\s*:?\\s*${STATUS}\\b(.*)$`);

function planningFiles() {
    return fs
        .readdirSync(planningDir)
        .filter((name) => name.endsWith('.md') && name !== 'README.md' && name !== 'TEMPLATE.md')
        .sort();
}

function sectionOf(lines, number) {
    const start = lines.findIndex((line) => line.startsWith(`## ${number}.`));
    if (start < 0) return [];
    let end = lines.findIndex((line, index) => index > start && line.startsWith('## '));
    if (end < 0) end = lines.length;
    return lines.slice(start + 1, end);
}

function splitCells(line) {
    const cells = [];
    let current = '';
    let inCode = false;
    const body = line.trim().replace(/^\|/, '').replace(/\|$/, '');
    for (let i = 0; i < body.length; i++) {
        const char = body[i];
        if (char === '\\' && body[i + 1] === '|') {
            current += '|';
            i++;
        } else if (char === '`') {
            inCode = !inCode;
            current += char;
        } else if (char === '|' && !inCode) {
            cells.push(current.trim());
            current = '';
        } else current += char;
    }
    cells.push(current.trim());
    return cells;
}

function expandIds(text) {
    const ids = [];
    const regex = new RegExp(`(TC-[A-Z0-9]+-)?(\\d+)(?:\\s*(?:\\.\\.|–|—)\\s*(?:TC-[A-Z0-9]+-)?(\\d+))?`, 'g');
    let prefix = null;
    let match;
    const source = text.replace(/\band\b/g, ',');
    while ((match = regex.exec(source))) {
        if (match[1]) prefix = match[1];
        if (!prefix) continue;
        const width = match[2].length;
        const from = Number(match[2]);
        const to = match[3] ? Number(match[3]) : from;
        for (let n = from; n <= to; n++) ids.push(prefix + String(n).padStart(width, '0'));
    }
    return ids;
}

function readDetails(rest) {
    let text = rest.trim();
    let details = '';
    if (text.startsWith('(')) {
        let depth = 0;
        let end = -1;
        for (let i = 0; i < text.length; i++) {
            if (text[i] === '(') depth++;
            if (text[i] === ')') depth--;
            if (depth === 0) {
                end = i;
                break;
            }
        }
        if (end > 0) {
            details = text.slice(1, end);
            text = text.slice(end + 1);
        }
    }
    text = text.replace(/^\**/, '').trim();
    let date = null;
    const dated = text.match(/^(\d{4}-\d{2}-\d{2})\s*/);
    if (dated) {
        date = dated[1];
        text = text.slice(dated[0].length);
    }
    text = text.replace(/^\**\s*[:—–-]?\s*/, '').trim();
    return { details, date, text };
}

function parsePlanning(file) {
    const lines = fs.readFileSync(path.join(planningDir, file), 'utf8').split('\n');
    const started = (lines.join('\n').match(/\|\s*Started\s*\|\s*(\d{4}-\d{2}-\d{2})/) || [])[1] || null;
    const cases = [];
    let header = null;
    for (const line of sectionOf(lines, 3)) {
        if (!line.trim().startsWith('|')) continue;
        const cells = splitCells(line);
        if (/^TC-ID$/i.test(cells[0])) {
            header = cells.map((cell) => cell.toLowerCase());
            continue;
        }
        if (!/^TC-[A-Z0-9]+-\d+$/.test(cells[0]) || !header) continue;
        const pick = (name) => {
            const index = header.findIndex((h) => h.startsWith(name));
            return index >= 0 ? cells[index] || '' : '';
        };
        let title = pick('title');
        const retired = /\bretired\b/i.test(title) || /\bretired\b/i.test(line.slice(0, 400));
        let role = null;
        let ref = null;
        const note = title.match(/\s*\(((?:role|ref):[^)]*)\)\s*$/);
        if (note) {
            title = title.slice(0, note.index).trim();
            for (const part of note[1].split(';')) {
                const [key, ...value] = part.split(':');
                if (key.trim() === 'role') role = value.join(':').trim();
                if (key.trim() === 'ref') ref = value.join(':').trim();
            }
        }
        cases.push({
            id: cells[0],
            title,
            precondition: pick('pre'),
            steps: pick('steps'),
            expected: pick('expected'),
            priority: pick('priority'),
            checkedIn: pick('checked'),
            retired,
            titleRole: role,
            titleRef: ref,
            file,
        });
    }

    const results = [];
    let noteDate = null;
    const unparsed = [];
    const section = sectionOf(lines, 5);
    section.forEach((raw, index) => {
        if (!raw.trim() || raw.trim().startsWith('|') || raw.startsWith('#')) return;
        let text = raw.trim().replace(/^[-*]\s+/, '');
        const lead = text.match(/^(\d{4}-\d{2}-\d{2})/);
        if (lead && /^[-*]\s/.test(raw.trim())) noteDate = lead[1];
        text = text.replace(/^\*\*/, '');
        let match = text.match(RESULT_LINE);
        if (!match) {
            const embedded = text.match(EMBEDDED_LINE);
            if (embedded) match = [embedded[0], lead ? lead[1] : null, '', embedded[1], embedded[2], embedded[3]];
        }
        if (!match) {
            if (/^TC-[A-Z0-9]+-\d+/.test(text) && /\b(PASS|FAIL|NOT RUN|BLOCKED)\b/.test(text)) unparsed.push(`${file}: ${raw.trim().slice(0, 100)}`);
            return;
        }
        const { details, date, text: actual } = readDetails(match[5]);
        const detailMap = {};
        for (const part of details.split(';')) {
            const m = part.match(/^\s*(role|screenshots?)\s*:\s*(.*)$/i);
            if (m) detailMap[m[1].toLowerCase().replace(/s$/, '')] = m[2].trim();
        }
        const resultDate = date || match[1] || noteDate || started;
        for (const id of expandIds(match[3])) {
            results.push({
                id,
                status: match[4],
                date: resultDate,
                details,
                role: detailMap.role || null,
                screenshots: detailMap.screenshot || null,
                actual,
                context: match[2] || '',
                file,
                order: index,
                raw: raw.trim(),
            });
        }
    });
    return { file, started, cases, results, unparsed };
}

function pickLatest(list) {
    let best = null;
    for (const item of list) {
        if (!best) {
            best = item;
            continue;
        }
        const newer = item.date > best.date;
        const same = item.date === best.date;
        const finalOverPlaceholder = item.status !== 'NOT RUN' && best.status === 'NOT RUN';
        const placeholderOverFinal = item.status === 'NOT RUN' && best.status !== 'NOT RUN';
        if (newer || (same && (finalOverPlaceholder || !placeholderOverFinal))) best = item;
    }
    return best;
}

function parseSpec(spec) {
    const range = spec.match(/^([A-Z0-9]+)-(\d+)\.\.(\d+)$/);
    if (range) return { kind: 'range', prefix: range[1], from: Number(range[2]), to: Number(range[3]) };
    if (/^[A-Z0-9]+-\d+$/.test(spec)) return { kind: 'id', id: spec };
    return { kind: 'prefix', prefix: spec };
}

function claimants(id, specificity) {
    const [, prefix, number] = id.match(/^TC-([A-Z0-9]+)-(\d+)$/);
    const found = [];
    for (const area of areas) {
        for (const raw of area.ids) {
            const spec = parseSpec(raw);
            if (specificity === 'specific') {
                if (spec.kind === 'id' && `${prefix}-${number}` === spec.id) found.push(area);
                if (spec.kind === 'range' && spec.prefix === prefix && Number(number) >= spec.from && Number(number) <= spec.to) found.push(area);
            } else if (spec.kind === 'prefix' && spec.prefix === prefix) found.push(area);
        }
    }
    return found;
}

function assign(ids) {
    const owner = new Map();
    const problems = [];
    for (const id of ids) {
        let found = claimants(id, 'specific');
        if (!found.length) found = claimants(id, 'prefix');
        if (found.length === 1) owner.set(id, found[0]);
        else problems.push(found.length ? `${id} is in several areas: ${found.map((a) => a.slug).join(', ')}` : `${id} is in no area`);
    }
    return { owner, problems };
}

function cell(value) {
    return String(value === null || value === undefined || value === '' ? '—' : value)
        .replace(/\|/g, '\\|')
        .replace(/\s*\n\s*/g, ' ');
}

function refLabel(ref) {
    return `${path.basename(ref.doc, '.md')} ${ref.sections}`;
}


const files = planningFiles().map(parsePlanning);
const definitions = new Map();
const duplicateProblems = [];
for (const parsed of files) {
    for (const testCase of parsed.cases) {
        if (definitions.has(testCase.id)) duplicateProblems.push(`${testCase.id} is defined in ${definitions.get(testCase.id).file} and ${parsed.file}`);
        else definitions.set(testCase.id, testCase);
    }
}
const resultsById = new Map();
for (const parsed of files) {
    for (const result of parsed.results) {
        if (!resultsById.has(result.id)) resultsById.set(result.id, []);
        resultsById.get(result.id).push(result);
    }
}
const undefinedIds = [...resultsById.keys()].filter((id) => !definitions.has(id));
const allIds = [...new Set([...definitions.keys(), ...resultsById.keys()])];
const { owner, problems } = assign(allIds);
problems.push(...duplicateProblems);
if (problems.length) {
    console.error('Test document generation failed:\n' + problems.map((p) => '  ' + p).join('\n'));
    process.exit(1);
}
const unparsed = files.flatMap((parsed) => parsed.unparsed);
if (unparsed.length) console.error('Result lines not parsed:\n' + unparsed.map((l) => '  ' + l).join('\n'));
if (undefinedIds.length) console.error('Result lines for IDs with no §3 row: ' + undefinedIds.join(', '));

function buildCase(id) {
    const definition = definitions.get(id) || { id, title: '—', steps: '', expected: '', retired: false, file: (resultsById.get(id)[0] || {}).file };
    const history = (resultsById.get(id) || []).slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.file < b.file ? -1 : a.file > b.file ? 1 : a.order - b.order));
    const latest = pickLatest(history);
    return { ...definition, history, latest };
}

function render(area) {
    const ids = allIds.filter((id) => owner.get(id) === area);
    const order = files.flatMap((parsed) => parsed.cases.map((c) => c.id)).concat(undefinedIds);
    const cases = ids.sort((a, b) => order.indexOf(a) - order.indexOf(b)).map(buildCase);
    const counts = { PASS: 0, FAIL: 0, 'NOT RUN': 0, BLOCKED: 0, none: 0, retired: 0 };
    for (const c of cases) {
        if (c.retired) counts.retired++;
        else if (!c.latest) counts.none++;
        else counts[c.latest.status]++;
    }
    const dates = cases.filter((c) => c.latest).map((c) => c.latest.date);
    const lastRun = dates.length ? dates.sort().pop() : '—';
    const sources = [...new Set(cases.flatMap((c) => [c.file, ...c.history.map((h) => h.file)]).filter(Boolean))].sort();
    const refText = area.refs.map((r) => `\`${r.doc}\` ${r.sections}`).join('; ');
    const hiw = area.howItWorks.map((d) => `\`${d}\``).join(', ');

    const out = [];
    out.push(`# Test document: ${area.title}`, '');
    out.push('Generated from the planning files, do not edit. To regenerate, run `node docs/tools/test-documents/generate.js` from the repo root; to check it is current, add `--check`.', '');
    out.push('| | |', '|---|---|');
    out.push(`| Source planning files | ${sources.length ? sources.map((s) => `\`docs/planning/features/${s}\``).join(', ') : '—'} |`);
    out.push(`| Requirement and workflow references | ${refText} |`);
    out.push(`| How it works | ${hiw} |`);
    out.push(`| Latest run | ${lastRun} |`, '');

    out.push('## Summary', '');
    out.push('| Cases | PASS | FAIL | NOT RUN | BLOCKED | No result | Retired |', '|---|---|---|---|---|---|---|');
    out.push(`| ${cases.length} | ${counts.PASS} | ${counts.FAIL} | ${counts['NOT RUN']} | ${counts.BLOCKED} | ${counts.none} | ${counts.retired} |`, '');
    out.push('The result of a case is its result line with the latest date. On the same date a PASS, FAIL or BLOCKED line wins over a NOT RUN line; otherwise the later line in the file wins. Every older line is kept under History.', '');

    out.push('## Results at a glance', '');
    if (cases.length) {
        out.push('| ID | Title | Role | Result | Date |', '|---|---|---|---|---|');
        for (const c of cases) {
            const state = c.retired ? 'Retired' : c.latest ? c.latest.status : 'No result';
            out.push(`| ${c.id} | ${cell(c.title)} | ${cell(roleOf(c))} | ${state} | ${cell(c.latest ? c.latest.date : null)} |`);
        }
    } else out.push('No test cases yet.');
    out.push('');

    out.push('## Cases', '');
    for (const c of cases) {
        out.push(`### ${c.id} ${cell(c.title)}`, '', '| | |', '|---|---|');
        const state = c.retired ? 'Retired' : c.latest ? c.latest.status : 'No result';
        const rows = [
            ['Title', c.title],
            ['Role', roleOf(c)],
            ['Pre-condition', c.precondition],
            ['Steps', c.steps],
            ['Expected result', c.expected],
            ['Actual result', c.latest ? c.latest.actual : null],
            ['Result', state],
            ['Method', c.latest ? c.latest.details.split(';')[0] : null],
            ['Date', c.latest ? c.latest.date : null],
            ['Screenshot', c.latest ? c.latest.screenshots : null],
            ['Ref (requirement / workflow)', c.titleRef || area.refs.map(refLabel).join('; ')],
            ['Planning file', c.file ? `docs/planning/features/${c.file}` : null],
        ];
        for (const [name, value] of rows) out.push(`| ${name} | ${cell(value)} |`);
        out.push('');
    }
    if (!cases.length) out.push('No test cases yet.', '');

    out.push('## Bugs found / fixed / blocked', '');
    const bugLines = [];
    for (const c of cases) {
        for (const h of c.history) {
            if (/Bug found|Bug fixed|BLOCKED/.test(h.raw) && !bugLines.some((b) => b.raw === h.raw && b.id === c.id)) bugLines.push({ id: c.id, raw: h.raw, file: h.file });
        }
    }
    if (bugLines.length) for (const b of bugLines) out.push(`- ${b.id} (${b.file}): ${b.raw.replace(/^[-*]\s+/, '')}`);
    else out.push('None recorded.');
    out.push('');

    out.push('## History', '');
    const withHistory = cases.filter((c) => c.history.length > 1);
    if (withHistory.length) {
        for (const c of withHistory) {
            out.push(`### ${c.id} history`, '');
            for (const h of c.history) out.push(`- ${h.date} ${h.status}${h === c.latest ? ' (current)' : ''}: ${cell(h.actual)}`);
            out.push('');
        }
    } else out.push('No case has more than one result line.', '');

    return { markdown: out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n', counts, total: cases.length, lastRun, slug: area.slug, title: area.title };
}

function roleOf(c) {
    return (c.latest && c.latest.role) || c.titleRole || null;
}

const outputs = new Map();
const summaries = areas.map((area) => {
    const result = render(area);
    outputs.set(`${area.slug}.md`, result.markdown);
    return result;
});

const index = ['# Test documents', '', 'Generated from the planning files, do not edit. To regenerate, run `node docs/tools/test-documents/generate.js` from the repo root; to check it is current, add `--check`. How it works: [browser testing](../how-it-works/platform/browser-testing.md).', ''];
index.push('| Document | Cases | PASS | FAIL | NOT RUN | BLOCKED | No result | Retired | Latest run |', '|---|---|---|---|---|---|---|---|---|');
const sum = { total: 0, PASS: 0, FAIL: 0, 'NOT RUN': 0, BLOCKED: 0, none: 0, retired: 0 };
for (const s of summaries) {
    index.push(`| [${s.title}](${s.slug}.md) | ${s.total} | ${s.counts.PASS} | ${s.counts.FAIL} | ${s.counts['NOT RUN']} | ${s.counts.BLOCKED} | ${s.counts.none} | ${s.counts.retired} | ${s.lastRun} |`);
    sum.total += s.total;
    for (const key of Object.keys(s.counts)) sum[key] += s.counts[key];
}
index.push(`| **Total** | ${sum.total} | ${sum.PASS} | ${sum.FAIL} | ${sum['NOT RUN']} | ${sum.BLOCKED} | ${sum.none} | ${sum.retired} | |`, '');
outputs.set('README.md', index.join('\n'));

const stale = [];
for (const [name, content] of outputs) {
    const target = path.join(outDir, name);
    const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
    if (current !== content) {
        stale.push(`docs/testing/${name}`);
        if (!check) {
            fs.mkdirSync(outDir, { recursive: true });
            fs.writeFileSync(target, content);
        }
    }
}
if (check) {
    if (stale.length) {
        console.error('Out of date, run: node docs/tools/test-documents/generate.js\n' + stale.map((s) => '  ' + s).join('\n'));
        process.exit(1);
    }
    console.log('Test documents are current.');
} else {
    console.log(stale.length ? `Written:\n${stale.map((s) => '  ' + s).join('\n')}` : 'Nothing changed.');
}
for (const s of summaries) console.log(`${s.slug}: ${s.total} cases, PASS ${s.counts.PASS}, FAIL ${s.counts.FAIL}, NOT RUN ${s.counts['NOT RUN']}, BLOCKED ${s.counts.BLOCKED}, none ${s.counts.none}, retired ${s.counts.retired}`);
