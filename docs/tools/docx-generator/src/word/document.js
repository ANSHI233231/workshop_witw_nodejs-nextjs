const { marked } = require('marked');
const { AlignmentType, Document, Footer, Header, HeadingLevel, PageNumber, Paragraph, TextRun } = require('docx');
const { FONT, COLOR, SIZE, PAGE, BULLET_LEVELS, NUMBER_LEVELS } = require('./styles');
const { plainText } = require('./inline');
const { block, contents } = require('./blocks');
const { config } = require('../config');

function buildDocument(markdown, diagramDir) {
    const tokens = marked.lexer(markdown);
    const titleToken = tokens.find((t) => t.type === 'heading' && t.depth === 1);
    const title = titleToken ? plainText(titleToken.tokens) : 'Document';

    const state = { listInstance: 0, diagramDir };
    const body = [];
    let contentsInserted = false;
    for (const t of tokens) {
        if (!contentsInserted && t.type === 'heading' && t.depth === 2) {
            body.push(...contents(tokens));
            contentsInserted = true;
        }
        body.push(...block(t, state));
    }

    const small = { size: SIZE.small, color: COLOR.muted, font: FONT };
    return {
        title,
        doc: new Document({
            creator: config.author,
            lastModifiedBy: config.author,
            title,
            description: 'Generated from Markdown by docs/tools/docx-generator. Edit the .md file, not this one.',
            revision: 1,
            styles: {
                default: {
                    document: {
                        run: { font: FONT, size: SIZE.body, color: COLOR.text },
                        paragraph: { spacing: { line: 276 } },
                    },
                    title: {
                        run: { font: FONT, size: 44, bold: true, color: COLOR.heading },
                        paragraph: { spacing: { after: 120 } },
                    },
                    heading1: {
                        run: { font: FONT, size: 30, bold: true, color: COLOR.heading },
                        paragraph: { spacing: { before: 360, after: 120 } },
                    },
                    heading2: {
                        run: { font: FONT, size: 25, bold: true, color: COLOR.heading },
                        paragraph: { spacing: { before: 240, after: 100 } },
                    },
                    heading3: {
                        run: { font: FONT, size: 22, bold: true, color: COLOR.heading },
                        paragraph: { spacing: { before: 200, after: 80 } },
                    },
                    hyperlink: { run: { color: COLOR.link, underline: {} } },
                },
            },
            numbering: {
                config: [
                    { reference: 'bullets', levels: BULLET_LEVELS },
                    { reference: 'numbered', levels: NUMBER_LEVELS },
                ],
            },
            sections: [
                {
                    properties: {
                        page: {
                            size: { width: PAGE.width, height: PAGE.height },
                            margin: { top: PAGE.margin, bottom: PAGE.margin, left: PAGE.margin, right: PAGE.margin },
                        },
                    },
                    headers: {
                        default: new Header({
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.RIGHT,
                                    children: [new TextRun({ ...small, text: title })],
                                }),
                            ],
                        }),
                    },
                    footers: {
                        default: new Footer({
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                        new TextRun({
                                            ...small,
                                            children: ['Page ', PageNumber.CURRENT, ' of ', PageNumber.TOTAL_PAGES],
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    },
                    children: body,
                },
            ],
        }),
    };
}

module.exports = { buildDocument };
