const { ExternalHyperlink, ShadingType, TextRun } = require('docx');
const { MONO, COLOR, SHADE, SIZE, wordSafe } = require('./styles');

function inline(tokens, fmt = {}) {
    const runs = [];
    for (const t of tokens ?? []) {
        switch (t.type) {
            case 'strong':
                runs.push(...inline(t.tokens, { ...fmt, bold: true }));
                break;
            case 'em':
                runs.push(...inline(t.tokens, { ...fmt, italics: true }));
                break;
            case 'del':
                runs.push(...inline(t.tokens, { ...fmt, strike: true }));
                break;
            case 'codespan':
                runs.push(
                    new TextRun({
                        ...fmt,
                        text: wordSafe(t.text),
                        font: MONO,
                        size: fmt.size ? fmt.size - 2 : SIZE.body - 2,
                        shading: { type: ShadingType.CLEAR, fill: SHADE.inlineCode, color: 'auto' },
                    }),
                );
                break;
            case 'link':
                if (/^https?:\/\//.test(t.href)) {
                    runs.push(
                        new ExternalHyperlink({
                            link: t.href,
                            children: inline(t.tokens, { ...fmt, color: COLOR.link, underline: {} }),
                        }),
                    );
                } else {
                    runs.push(...inline(t.tokens, fmt));
                }
                break;
            case 'br':
                runs.push(new TextRun({ ...fmt, break: 1 }));
                break;
            case 'text':
                if (t.tokens?.length) runs.push(...inline(t.tokens, fmt));
                else runs.push(new TextRun({ ...fmt, text: wordSafe(t.text) }));
                break;
            case 'image':
                runs.push(new TextRun({ ...fmt, text: `[image: ${t.text || t.href}]`, italics: true }));
                break;
            default:
                runs.push(new TextRun({ ...fmt, text: t.text ?? t.raw ?? '' }));
        }
    }
    return runs;
}

const plainText = (tokens) => (tokens ?? []).map((t) => (t.tokens ? plainText(t.tokens) : (t.text ?? ''))).join('');

module.exports = { inline, plainText };
