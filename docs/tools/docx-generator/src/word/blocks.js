const fs = require('fs');
const path = require('path');
const {
    AlignmentType,
    BorderStyle,
    HeadingLevel,
    ImageRun,
    Paragraph,
    ShadingType,
    Table,
    TableCell,
    TableRow,
    TextRun,
    WidthType,
} = require('docx');
const { MONO, COLOR, SHADE, SIZE, CONTENT_WIDTH, DIAGRAM_MAX, wordSafe } = require('./styles');
const { inline, plainText } = require('./inline');
const { diagramFileName, isDiagramBlock } = require('../diagrams/files');
const { REPO_ROOT } = require('../config');

function heading(t) {
    const level = {
        1: HeadingLevel.TITLE,
        2: HeadingLevel.HEADING_1,
        3: HeadingLevel.HEADING_2,
        4: HeadingLevel.HEADING_3,
    };
    return new Paragraph({
        heading: level[t.depth] ?? HeadingLevel.HEADING_4,
        children: inline(t.tokens),
        keepNext: true,
    });
}

function codeBlock(t) {
    const lines = t.text.split('\n');
    const border = { style: BorderStyle.SINGLE, size: 4, color: COLOR.rule, space: 4 };
    return lines.map(
        (line, i) =>
            new Paragraph({
                children: [new TextRun({ text: wordSafe(line) || ' ', font: MONO, size: SIZE.code })],
                shading: { type: ShadingType.CLEAR, fill: SHADE.code, color: 'auto' },
                border: {
                    left: border,
                    right: border,
                    ...(i === 0 ? { top: border } : {}),
                    ...(i === lines.length - 1 ? { bottom: border } : {}),
                },
                spacing: { before: i === 0 ? 120 : 0, after: i === lines.length - 1 ? 160 : 0, line: 240 },
                keepLines: true,
                keepNext: i < lines.length - 1,
            }),
    );
}

function diagramBlock(t, diagramDir) {
    const file = path.join(diagramDir, diagramFileName(t.text));
    if (!fs.existsSync(file)) {
        throw new Error(`A diagram has no image yet (${path.relative(REPO_ROOT, file)}). Run: npm run diagrams`);
    }
    const data = fs.readFileSync(file);
    const width = data.readUInt32BE(16);
    const height = data.readUInt32BE(20);
    const scale = Math.min(DIAGRAM_MAX.width / width, DIAGRAM_MAX.height / height, 1);
    return [
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 160 },
            keepLines: true,
            children: [
                new ImageRun({
                    type: 'png',
                    data,
                    transformation: { width: Math.round(width * scale), height: Math.round(height * scale) },
                }),
            ],
        }),
    ];
}

function columnWidths(table) {
    const cols = table.header.length;
    const weight = Array.from({ length: cols }, (_, c) => {
        const lengths = [table.header[c], ...table.rows.map((r) => r[c])].map((cell) => plainText(cell?.tokens).length);
        return Math.min(Math.max(...lengths, 4), 70) + 4;
    });
    const total = weight.reduce((a, b) => a + b, 0);
    const widths = weight.map((w) => Math.floor((CONTENT_WIDTH * w) / total));
    widths[cols - 1] += CONTENT_WIDTH - widths.reduce((a, b) => a + b, 0);
    return widths;
}

function tableBlock(t) {
    const widths = columnWidths(t);
    const border = { style: BorderStyle.SINGLE, size: 4, color: COLOR.rule };
    const borders = { top: border, bottom: border, left: border, right: border };
    const alignment = { left: AlignmentType.LEFT, center: AlignmentType.CENTER, right: AlignmentType.RIGHT };

    const row = (cells, isHeader) =>
        new TableRow({
            tableHeader: isHeader,
            cantSplit: true,
            children: cells.map(
                (cell, c) =>
                    new TableCell({
                        width: { size: widths[c], type: WidthType.DXA },
                        borders,
                        margins: { top: 60, bottom: 60, left: 100, right: 100 },
                        shading: isHeader ? { type: ShadingType.CLEAR, fill: SHADE.header, color: 'auto' } : undefined,
                        children: [
                            new Paragraph({
                                alignment: alignment[t.align[c]] ?? AlignmentType.LEFT,
                                spacing: { before: 0, after: 0 },
                                children: inline(cell?.tokens, { size: SIZE.table, bold: isHeader || undefined }),
                            }),
                        ],
                    }),
            ),
        });
    const headerIsEmpty = t.header.every((h) => !plainText(h.tokens).trim());
    const rows = [...(headerIsEmpty ? [] : [row(t.header, true)]), ...t.rows.map((r) => row(r, false))];

    return [
        new Table({ width: { size: CONTENT_WIDTH, type: WidthType.DXA }, columnWidths: widths, rows }),
        new Paragraph({ spacing: { before: 0, after: 120 }, children: [] }),
    ];
}

function listBlock(t, level, state) {
    const out = [];
    const instance = t.ordered ? ++state.listInstance : 0;
    for (const item of t.items) {
        let first = true;
        for (const child of item.tokens) {
            if (child.type === 'list') {
                out.push(...listBlock(child, level + 1, state));
            } else if (child.type === 'text' || child.type === 'paragraph') {
                out.push(
                    new Paragraph({
                        numbering: first
                            ? t.ordered
                                ? { reference: 'numbered', level, instance }
                                : { reference: 'bullets', level }
                            : undefined,
                        indent: first ? undefined : { left: 360 * (level + 1) },
                        spacing: { before: 0, after: 60 },
                        children: inline(child.tokens ?? [{ type: 'text', text: child.text }]),
                    }),
                );
                first = false;
            } else {
                out.push(...block(child, state, level + 1));
            }
        }
    }
    return out;
}

function block(t, state, listLevel = 0) {
    switch (t.type) {
        case 'heading':
            return [heading(t)];
        case 'paragraph':
            return [new Paragraph({ children: inline(t.tokens), spacing: { after: 120 } })];
        case 'list':
            return listBlock(t, listLevel, state);
        case 'table':
            return tableBlock(t);
        case 'code':
            return isDiagramBlock(t) ? diagramBlock(t, state.diagramDir) : codeBlock(t);
        case 'blockquote':
            return t.tokens.flatMap((child) =>
                child.type === 'paragraph'
                    ? [
                          new Paragraph({
                              children: inline(child.tokens, { italics: true, color: COLOR.muted }),
                              indent: { left: 360 },
                              border: { left: { style: BorderStyle.SINGLE, size: 12, color: COLOR.rule, space: 8 } },
                              spacing: { after: 120 },
                          }),
                      ]
                    : block(child, state),
            );
        case 'hr':
            return [
                new Paragraph({
                    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR.rule, space: 1 } },
                    spacing: { before: 120, after: 240 },
                    children: [],
                }),
            ];
        case 'space':
            return [];
        default:
            return [new Paragraph({ children: [new TextRun(t.text ?? t.raw ?? '')] })];
    }
}

function contents(tokens) {
    const sections = tokens.filter((t) => t.type === 'heading' && t.depth === 2).map((t) => plainText(t.tokens));
    if (sections.length === 0) return [];
    return [
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Contents')] }),
        ...sections.map(
            (s) => new Paragraph({ children: [new TextRun({ text: s, size: SIZE.body })], spacing: { after: 40 } }),
        ),
        new Paragraph({ pageBreakBefore: true, children: [] }),
    ];
}

module.exports = { block, contents };
