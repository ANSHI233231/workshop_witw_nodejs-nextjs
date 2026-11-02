const { AlignmentType, LevelFormat } = require('docx');

const FONT = 'Calibri';
const MONO = 'Consolas';
const COLOR = { text: '1F2328', muted: '5B6470', heading: '1F3A5F', link: '1F5EFF', rule: 'C9CED6' };
const SHADE = { header: 'E8ECF2', code: 'F4F5F7', inlineCode: 'EEF0F3' };
const SIZE = { body: 21, table: 18, code: 16, small: 16 };
const PAGE = { width: 11906, height: 16838, margin: 1134 };
const CONTENT_WIDTH = PAGE.width - 2 * PAGE.margin;
const DIAGRAM_MAX = { width: 640, height: 860 };

const BULLET_LEVELS = ['•', '◦', '▪', '•'].map((symbol, level) => ({
    level,
    format: LevelFormat.BULLET,
    text: symbol,
    alignment: AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 360 * (level + 1), hanging: 260 } } },
}));

const NUMBER_LEVELS = [LevelFormat.DECIMAL, LevelFormat.LOWER_LETTER, LevelFormat.LOWER_ROMAN, LevelFormat.DECIMAL].map(
    (format, level) => ({
        level,
        format,
        text: `%${level + 1}.`,
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 360 * (level + 1), hanging: 300 } } },
    }),
);

const WORD_SAFE = { '\u25B6': '\u25BA', '\u25C0': '\u25C4' };
const wordSafe = (text) => text.replace(/[\u25B6\u25C0]/g, (ch) => WORD_SAFE[ch]);

module.exports = {
    FONT,
    MONO,
    COLOR,
    SHADE,
    SIZE,
    PAGE,
    CONTENT_WIDTH,
    DIAGRAM_MAX,
    BULLET_LEVELS,
    NUMBER_LEVELS,
    wordSafe,
};
